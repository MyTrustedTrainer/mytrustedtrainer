import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mytrustedtrainer.com'

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const trainerId = session.metadata?.trainer_id
        const plan = session.metadata?.plan
        const type = session.metadata?.type
        const leadId = session.metadata?.lead_id

        if (session.mode === 'subscription' && trainerId && plan) {
          await supabase.from('trainer_profiles').update({ plan_tier: plan }).eq('id', trainerId)
          await supabase.from('subscriptions').upsert(
            { trainer_id: trainerId, stripe_subscription_id: session.subscription as string, stripe_customer_id: session.customer as string, plan_tier: plan, status: 'active', updated_at: new Date().toISOString() },
            { onConflict: 'trainer_id' }
          )
        }

        if (type === 'lead_unlock' && leadId && trainerId) {
          await supabase.from('leads').update({ status: 'unlocked', unlocked_at: new Date().toISOString(), unlock_charge_id: session.payment_intent as string }).eq('id', leadId)
          const { data: lead } = await supabase.from('leads').select('client_id, client_profiles(email, full_name), trainer_profiles(full_name)').eq('id', leadId).maybeSingle()
          if (lead) {
            const client = (lead as any).client_profiles
            const trainer = (lead as any).trainer_profiles
            if (client?.email) {
              try {
                await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` }, body: JSON.stringify({ from: 'MyTrustedTrainer <hello@mytrustedtrainer.com>', to: client.email, subject: `${trainer?.full_name ?? 'A trainer'} is interested in working with you`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#03243F;padding:20px 28px;border-radius:12px 12px 0 0"><p style="color:white;font-size:18px;font-weight:bold;margin:0">MyTrustedTrainer</p></div><div style="background:white;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none"><h2 style="color:#03243F;margin:0 0 12px 0">Great news, ${client.full_name?.split(' ')[0] ?? 'there'}!</h2><p style="color:#475569;line-height:1.6"><strong>${trainer?.full_name ?? 'A trainer'}</strong> has unlocked your inquiry and is interested in working with you.</p><a href="${siteUrl}/client/dashboard/inquiries" style="display:inline-block;background:#18A96B;color:white;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:15px;margin-top:20px">View My Inbox</a></div></div>` }) })
              } catch {}
            }
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const { data: profile } = await supabase.from('trainer_profiles').select('id').eq('stripe_customer_id', sub.customer as string).maybeSingle()
        if (profile) {
          await supabase.from('subscriptions').upsert(
            { trainer_id: profile.id, stripe_subscription_id: sub.id, stripe_customer_id: sub.customer as string, status: sub.status === 'active' ? 'active' : sub.status, updated_at: new Date().toISOString() },
            { onConflict: 'trainer_id' }
          )
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const { data: profile } = await supabase.from('trainer_profiles').select('id, full_name').eq('stripe_customer_id', sub.customer as string).maybeSingle()
        if (profile) {
          await supabase.from('trainer_profiles').update({ plan_tier: 'free' }).eq('id', profile.id)
          await supabase.from('subscriptions').upsert({ trainer_id: profile.id, status: 'cancelled', updated_at: new Date().toISOString() }, { onConflict: 'trainer_id' })
          try {
            const firstName = profile.full_name?.split(' ')[0] ?? 'there'
            await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` }, body: JSON.stringify({ from: 'MyTrustedTrainer <hello@mytrustedtrainer.com>', to: (sub as any).customer_email ?? undefined, subject: 'Your MTT subscription has ended', html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#03243F;padding:20px 28px;border-radius:12px 12px 0 0"><p style="color:white;font-size:18px;font-weight:bold;margin:0">MyTrustedTrainer</p></div><div style="background:white;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none"><h2 style="color:#03243F;margin:0 0 12px 0">Subscription ended</h2><p style="color:#475569;line-height:1.6">Hi ${firstName}, your MTT subscription has been cancelled. Your profile is still active.</p><a href="${siteUrl}/dashboard/trainer/billing" style="display:inline-block;background:#18A96B;color:white;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:15px;margin-top:20px">Reactivate</a></div></div>` }) })
          } catch {}
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const { data: profile } = await supabase.from('trainer_profiles').select('id, full_name').eq('stripe_customer_id', invoice.customer as string).maybeSingle()
        if (profile) {
          try {
            const firstName = profile.full_name?.split(' ')[0] ?? 'there'
            await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` }, body: JSON.stringify({ from: 'MyTrustedTrainer <hello@mytrustedtrainer.com>', to: (invoice as any).customer_email ?? undefined, subject: 'Action needed — payment issue on your MTT account', html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#03243F;padding:20px 28px;border-radius:12px 12px 0 0"><p style="color:white;font-size:18px;font-weight:bold;margin:0">MyTrustedTrainer</p></div><div style="background:white;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none"><h2 style="color:#03243F;margin:0 0 12px 0">Payment issue</h2><p style="color:#475569;line-height:1.6">Hi ${firstName}, we could not process your payment. Please update your billing information.</p><a href="${siteUrl}/api/portal/session" style="display:inline-block;background:#F4A636;color:#03243F;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:15px;margin-top:20px">Update Billing</a></div></div>` }) })
          } catch {}
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
  }

  return NextResponse.json({ received: true })
}
