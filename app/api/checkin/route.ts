import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    trainer_id,
    energy_rating,
    session_rating,
    response_speed_rating,
    communication_rating,
    notes,
  } = body

  if (!trainer_id) {
    return NextResponse.json({ error: 'trainer_id required' }, { status: 400 })
  }

  const { error } = await supabase.from('checkins').insert({
    client_id: user.id,
    trainer_id,
    energy_rating: energy_rating ?? null,
    session_rating: session_rating ?? null,
    response_speed_rating: response_speed_rating ?? null,
    communication_rating: communication_rating ?? null,
    notes: notes || null,
    is_private: true,
  })

  if (error) {
    console.error('checkin insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fire-and-forget: trigger badge recalculation
  try {
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/calculate-badges`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    ).catch(() => {})
  } catch {}

  return NextResponse.json({ success: true })
}
