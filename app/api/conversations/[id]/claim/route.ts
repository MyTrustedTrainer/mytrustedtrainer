import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const FREE_LEAD_LIMIT = 3

// POST /api/conversations/[id]/claim
// Trainer claims a pending lead chat request
// Free trainers: free if under limit, $15 if over
  // Pro/Elite trainers: always free
export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

          const conversationId = params.id

          // Get trainer profile
          const { data: trainerProfile } = await supabase
            .from('trainer_profiles')
            .select('id, plan, full_name, stripe_customer_id')
            .eq('user_id', user.id)
            .single()

          if (!trainerProfile) return NextResponse.json({ error: 'Trainer profile not found' }, { status: 404 })

          // Get the conversation and verify it belongs to this trainer
          const { data: conv } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .eq('trainer_id', trainerProfile.id)
            .single()

          if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
          if (conv.lead_claim_status === 'claimed') {
                  return NextResponse.json({ success: true, already_claimed: true })
                }

          const isPaidPlan = trainerProfile.plan === 'pro' || trainerProfile.plan === 'elite'

          if (isPaidPlan) {
                  // Pro/Elite: claim for free
                  await supabase
                    .from('conversations')
                    .update({
                                lead_claim_status: 'claimed',
                                is_unlocked: true,
                                claimed_at: new Date().toISOString()
                              })
                    .eq('id', conversationId)

                  return NextResponse.json({ success: true, claimed: true, requires_payment: false })
                }

          // Free plan: check how many leads already claimed
          const { count: claimedCount } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('trainer_id', trainerProfile.id)
            .eq('lead_claim_status', 'claimed')

          if ((claimedCount || 0) < FREE_LEAD_LIMIT) {
                  // Still under free limit - claim for free
                  await supabase
                    .from('conversations')
                    .update({
                                lead_claim_status: 'claimed',
                                is_unlocked: true,
                                claimed_at: new Date().toISOString()
                              })
                    .eq('id', conversationId)

                  return NextResponse.json({ success: true, claimed: true, requires_payment: false })
                }

          // Over free limit - need to pay $15
          const body = await request.json().catch(() => ({}))
          if (body.confirm_pay) {
                  const origin = request.headers.get('origin') || 'https://mytrustedtrainer.vercel.app'
                  const session = await stripe.checkout.sessions.create({
                            payment_method_types: ['card'],
                            line_items: [{
                                        price_data: {
                                                      currency: 'usd',
                                                      product_data: {
                                                                      name: 'Chat Lead Unlock',
                                                                      description: 'One-time payment to accept this client chat request.',
                                                                    },
                                                      unit_amount: 1500,
                                                    },
                                        quantity: 1,
                                      }],
                            mode: 'payment',
                            success_url: origin + '/dashboard/trainer?chat_claimed=' + conversationId,
                            cancel_url: origin + '/dashboard/trainer',
                            metadata: {
                                        conversation_id: conversationId,
                                        trainer_id: trainerProfile.id,
                                        user_id: user.id,
                                        action: 'claim_chat',
                                      },
                          })

                  return NextResponse.json({ success: true, requires_payment: true, checkout_url: session.url })
                }

          // Return info that payment is required
          return NextResponse.json({ success: false, requires_payment: true, amount: 1500 })

        } catch (error: any) {
          console.error('Claim conversation error:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
  }

// POST /api/conversations/[id]/claim with action=ignore
// Trainer ignores a pending lead
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

          const { data: trainerProfile } = await supabase
            .from('trainer_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single()

          if (!trainerProfile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

          await supabase
            .from('conversations')
            .update({ lead_claim_status: 'ignored' })
            .eq('id', params.id)
            .eq('trainer_id', trainerProfile.id)

          return NextResponse.json({ success: true })
        } catch (error: any) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
  }
