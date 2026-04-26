import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

const PRICE_IDS: Record<string, string | undefined> = {
  growth: process.env.STRIPE_GROWTH_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { plan } = body

    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const priceId = PRICE_IDS[plan]!

    const { data: profile } = await supabase
      .from('trainer_profiles')
      .select('id, stripe_customer_id, full_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json({ error: 'Trainer profile not found' }, { status: 404 })
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

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard/trainer/billing?success=true&plan=${plan}`,
      cancel_url: `${siteUrl}/dashboard/trainer/billing`,
      metadata: { trainer_id: profile.id, plan },
      allow_promotion_codes: false,
    }

    if (plan === 'growth') {
      sessionParams.discounts = [{ coupon: 'MTT-FOUNDING' }]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout subscription error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
