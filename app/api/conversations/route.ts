import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const FREE_LEAD_LIMIT = 3

export async function GET(request: Request) {
      try {
              const supabase = await createClient()
              const { data: { user } } = await supabase.auth.getUser()
              if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: trainerProfile } = await supabase
                .from('trainer_profiles').select('id, plan').eq('user_id', user.id).single()

        let conversations
              if (trainerProfile) {
                        const { data } = await supabase
                          .from('conversations')
                          .select('*, messages(id, body, sender_type, created_at, is_read)')
                          .eq('trainer_id', trainerProfile.id)
                          .order('last_message_at', { ascending: false })
                        conversations = data
              } else {
                        const { data } = await supabase
                          .from('conversations')
                          .select('*, trainer_profiles(id, full_name, slug, avatar_url), messages(id, body, sender_type, created_at, is_read)')
                          .eq('client_user_id', user.id)
                          .order('last_message_at', { ascending: false })
                        conversations = data
              }

        return NextResponse.json({ conversations: conversations || [] })
      } catch (error: any) {
              return NextResponse.json({ error: error.message }, { status: 500 })
      }
}

export async function POST(request: Request) {
      try {
              const body = await request.json()
              const { trainer_id, message } = body
              if (!trainer_id || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

        const supabase = await createClient()
              const { data: { user } } = await supabase.auth.getUser()
              if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: senderProfile } = await supabase
                .from('trainer_profiles').select('id').eq('user_id', user.id).single()
              if (senderProfile?.id === trainer_id) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })

        let { data: conv } = await supabase
                .from('conversations')
                .select('*')
                .eq('trainer_id', trainer_id)
                .eq('client_user_id', user.id)
                .single()

        if (!conv) {
                  const { data: trainer } = await supabase
                    .from('trainer_profiles').select('plan').eq('id', trainer_id).single()

                const { count: claimedCount } = await supabase
                    .from('conversations')
                    .select('*', { count: 'exact', head: true })
                    .eq('trainer_id', trainer_id)
                    .eq('lead_claim_status', 'claimed')

                const isPaidPlan = trainer?.plan === 'pro' || trainer?.plan === 'elite'
                  const underFreeLimit = (claimedCount || 0) < FREE_LEAD_LIMIT
                            const autoClaimStatus = (isPaidPlan || underFreeLimit) ? 'claimed' : 'pending'

                const { data: newConv, error: convError } = await supabase
                    .from('conversations')
                    .insert({
                                  trainer_id,
                                  client_user_id: user.id,
                                  client_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Client',
                                  client_email: user.email,
                                  is_unlocked: autoClaimStatus === 'claimed',
                                  lead_claim_status: autoClaimStatus,
                                  claimed_at: autoClaimStatus === 'claimed' ? new Date().toISOString() : null,
                                  last_message_at: new Date().toISOString()
                    })
                    .select().single()

                if (convError) throw convError
                  conv = newConv

                await supabase.from('leads').insert({
                            trainer_id, client_user_id: user.id,
                            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Client',
                            email: user.email, message, source: 'chat', status: 'new'
                })
        }

        if (conv.lead_claim_status !== 'claimed') {
                  return NextResponse.json({ conversation: conv, message: null, pending: true })
        }

        const { data: msg, error: msgError } = await supabase
                .from('messages')
                .insert({ conversation_id: conv.id, sender_type: 'client', sender_id: user.id, body: message, is_read: false })
                .select().single()

        if (msgError) throw msgError

        await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conv.id)

        return NextResponse.json({ conversation: conv, message: msg, pending: false })
      } catch (error: any) {
              return NextResponse.json({ error: error.message }, { status: 500 })
      }
}
