import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { trainer_id, name, email, phone, goal, budget_range, message } = body

    if (!trainer_id || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If logged-in client, look up their profile for cross-referencing
    let clientId: string | null = null
    let matchScoreAtTime: number | null = null

    if (user) {
      const { data: cp } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cp) {
        clientId = cp.id
        const { data: ms } = await supabase
          .from('match_scores')
          .select('score')
          .eq('client_id', cp.id)
          .eq('trainer_id', trainer_id)
          .maybeSingle()
        matchScoreAtTime = ms?.score ?? null
      }
    }

    const { error } = await supabase.from('leads').insert({
      trainer_id,
      client_id: clientId,
      match_score_at_time: matchScoreAtTime,
      status: 'locked',
      message: message ?? null,
      goal_summary: goal ?? null,
      budget_range: budget_range ?? null,
    })

    if (error) throw error

    // Email notification wired in Session 14 via Resend
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('leads/create error:', err)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
