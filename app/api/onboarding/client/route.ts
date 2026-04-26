import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { sendClientWelcome } from '@/lib/resend/emails'

// ─── GET — load existing quiz progress ───────────────────────────────────────

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    raw_answers: data?.raw_answers ?? null,
    compatibility_complete: data?.compatibility_complete ?? false,
  })
}

// ─── POST — save incremental progress or mark complete ───────────────────────

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
    ...(goal       && { goals: goal }),
    ...(experience && { experience_level: experience }),
    ...(frequency  && { training_frequency: frequency }),
    ...(budget     && { budget_range: budget }),
    ...(format     && { training_format: format }),
  }

  // Check if this is first-time completion before upsert
  let wasAlreadyComplete = false
  if (complete) {
    const { data: existing } = await supabase
      .from('client_profiles')
      .select('compatibility_complete, full_name')
      .eq('user_id', user.id)
      .maybeSingle()
    wasAlreadyComplete = existing?.compatibility_complete ?? false
  }

  // Try full upsert first; fall back to minimal payload if unknown columns
  let { error } = await supabase
    .from('client_profiles')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) {
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

  // Send welcome email on first quiz completion (non-blocking)
  if (complete && !wasAlreadyComplete && user.email) {
    try {
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle()
      const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
      await sendClientWelcome(user.email, firstName)
    } catch {}
  }

  return NextResponse.json({ ok: true, complete })
}
