import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mytrustedtrainer.com'}/login`)
    }

    const { data: profile } = await supabase
      .from('trainer_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mytrustedtrainer.com'

    if (!profile?.stripe_customer_id) {
      return NextResponse.redirect(`${siteUrl}/dashboard/trainer/billing?no_billing=true`)
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl}/dashboard/trainer/billing`,
    })

    return NextResponse.redirect(session.url)
  } catch (err: any) {
    console.error('Portal session error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
