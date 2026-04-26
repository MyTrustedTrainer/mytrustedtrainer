import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { leadId } = body
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    const { data: profile } = await supabase
      .from('trainer_profiles')
      .select('id, stripe_customer_id, full_name, first_lead_used')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile) return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })

    const { data: lead } = await supabase
      .from('leads')
      .select('id, status')
      .eq('id', leadId)
      .eq('trainer_id', profile.id)
      .maybeSingle()

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    if (lead.status === 'unlocked' || lead.status === 'converted') {
      return NextResponse.json({ error: 'Lead already unlocked' }, { status: 400 })
    }

    // First lead is free — skip Stripe
    if (!profile.first_lead_used) {
      await supabase
        .from('trainer_profiles')
        .update({ first_lead_used: true })
        .eq('id', profile.id)
      await supabase
        .from('leads')
        .update({ status: 'unlocked', unlocked_at: new Date().toISOString() })
        .eq('id', leadId)
      return NextResponse.json({ free: true })
    }

    let customerId = profile.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile.full_name ?? undefined,
        metadata: { trainer_id: profile.id, supabase_uid: user.id },
      })
      customerId = customer.id
      await supabase
        .from('trainer_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', profile.id)
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mytrustedtrainer.com'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_LEAD_PRICE_ID!, quantity: 1 }],
      success_url: `${siteUrl}/dashboard/trainer/leads?unlocked=${leadId}`,
      cancel_url: `${siteUrl}/dashboard/trainer/leads`,
      metadata: { trainer_id: profile.id, lead_id: leadId, type: 'lead_unlock' },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Lead unlock checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
