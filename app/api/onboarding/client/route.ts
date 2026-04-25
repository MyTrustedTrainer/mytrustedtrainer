import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// âââ GET â load existing quiz progress âââââââââââââââââââââââââââââââââââââââ

export async function GET() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('client_profiles')
    .select('raw_answers, compatibility_complete')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = row not found â fine, just return empty
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    raw_answers: data?.raw_answers ?? null,
    compatibility_complete: data?.compatibility_complete ?? false,
  })
}

// âââ POST â save incremental progress or mark complete ââââââââââââââââââââââââ

export async function POST(req: NextRequest) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { answers?: Record<string, string>; complete?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { answers = {}, complete = false } = body

  // Map well-known answer keys to dedicated columns for easy querying
  const goal        = answers['q9_goal']     ?? null
  const experience  = answers['q10_exp']     ?? null
  const frequency   = answers['q11_freq']    ?? null
  const budget      = answers['q14_budget']  ?? null
  const format      = answers['q15_format']  ?? null

  const payload: Record<string, unknown> = {
    user_id:                user.id,
    raw_answers:            answers,
    compatibility_complete: complete,
    updated_at:             new Date().toISOString(),
    // Mapped columns (ignored if column doesn't exist yet â handled by try/catch)
    ...(goal       && { goals: goal }),
    ...(experience && { experience_level: experience }),
    ...(frequency  && { training_frequency: frequency }),
    ...(budget     && { budget_range: budget }),
    ...(format     && { training_format: format }),
  }

  // Try full upsert first; if unknown columns cause an error, fall back to minimal payload
  let { error } = await supabase
    .from('client_profiles')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) {
    // Fallback: only the columns we know always exist
    const fallback = await supabase
      .from('client_profiles')
      .upsert(
        {
          user_id:                user.id,
          raw_answers:            answers,
          compatibility_complete: complete,
          updated_at:             new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    if (fallback.error) {
      return NextResponse.json({ error: fallback.error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, complete })
}
