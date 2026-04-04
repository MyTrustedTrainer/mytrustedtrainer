import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(request: Request) {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    let event: Stripe.Event
    try {
          event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
        } catch (err: any) {
          console.error('Webhook signature error:', err.message)
          return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

    const supabase = await createClient()

    if (event.type === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session
          const { action, conversation_id, trainer_id } = session.metadata || {}

          if (action === 'claim_chat' && conversation_id && trainer_id) {
                  // Mark conversation as claimed after payment
                  await supabase
                    .from('conversations')
                    .update({
                                lead_claim_status: 'claimed',
                                is_unlocked: true,
                                claimed_at: new Date().toISOString()
                              })
                    .eq('id', conversation_id)
                    .eq('trainer_id', trainer_id)

                  console.log('Chat lead claimed after payment:', conversation_id)
                }
        }

    return NextResponse.json({ received: true })
  }

export const config = {
    api: { bodyParser: false }
  }
