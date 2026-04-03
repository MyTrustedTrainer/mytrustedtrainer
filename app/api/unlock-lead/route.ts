import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

// POST /api/unlock-lead - creates a Stripe Checkout session to pay $15 to unlock a lead
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { lead_id } = body
    if (!lead_id) return NextResponse.json({ error: 'Missing lead_id' }, { status: 400 })

    // Verify the trainer owns this lead
    const { data: trainerProfile } = await supabase
      .from('trainer_profiles')
      .select('id, full_name, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!trainerProfile) return NextResponse.json({ error: 'Trainer profile not found' }, { status: 404 })

    const { data: lead } = await supabase
      .from('leads')
      .select('id, name')
      .eq('id', lead_id)
      .eq('trainer_id', trainerProfile.id)
      .single()

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    // Create Stripe Checkout session for $15
    const origin = request.headers.get('origin') || 'https://mytrustedtrainer.vercel.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Lead Unlock: ' + lead.name,
            description: 'One-time payment to unlock this lead and view their full contact details.',
          },
          unit_amount: 1500, // $15.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: origin + '/dashboard/trainer?lead_unlocked=' + lead_id,
      cancel_url: origin + '/dashboard/trainer',
      metadata: {
        lead_id: lead_id,
        trainer_id: trainerProfile.id,
        user_id: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Unlock lead error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
