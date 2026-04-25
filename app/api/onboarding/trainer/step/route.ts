import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('full_name, city, state, price_per_session, training_formats, plan_tier, onboarding_complete')
    .eq('id', user.id)
    .single()

  const { data: compatibility } = await supabase
    .from('trainer_compatibility_profiles')
    .select('coaching_style, communication_style, specializations, raw_answers')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    profile: profile || {},
    compatibility: compatibility || {},
  })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const { step, data } = body as { step: number; data: Record<string, unknown> }

  // ââ STEP 1: Basic profile info ââââââââââââââââââââââââââââââââââââââââââââââ
  if (step === 1) {
    const { full_name, city, state, price_per_session, training_formats } = data as {
      full_name: string
      city: string
      state: string
      price_per_session: number | null
      training_formats: string[]
    }

    const { error } = await supabase.from('trainer_profiles').upsert(
      {
        id: user.id,
        full_name,
        city,
        state,
        location_text: city + ', ' + state,
        price_per_session,
        training_formats,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    if (error) {
      console.error('Step 1 upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // ââ STEPS 2, 3, 5: Compatibility profile (quiz answers) âââââââââââââââââââââ
  if (step === 2 || step === 3 || step === 5) {
    // Load existing raw_answers so we can merge, not overwrite
    const { data: existing } = await supabase
      .from('trainer_compatibility_profiles')
      .select('raw_answers')
      .eq('user_id', user.id)
      .single()

    const existingRaw = (existing?.raw_answers as Record<string, unknown>) || {}
    const mergedRaw = { ...existingRaw, ...data }

    // Map known fields to dedicated columns for algorithm use
    const knownCols: Record<string, unknown> = {
      user_id: user.id,
      trainer_id: user.id,
      updated_at: new Date().toISOString(),
    }
    if (data.coaching_approach) knownCols.coaching_style = data.coaching_approach
    if (data.response_time) knownCols.communication_style = data.response_time
    if (data.ideal_client) knownCols.ideal_client_description = data.ideal_client

    // Try with raw_answers first (preferred â stores full quiz fidelity)
    const { error: err1 } = await supabase
      .from('trainer_compatibility_profiles')
      .upsert({ ...knownCols, raw_answers: mergedRaw }, { onConflict: 'user_id' })

    if (err1) {
      // raw_answers column may not exist yet â fall back to known columns only
      console.warn('raw_answers upsert failed, falling back:', err1.message)
      const { error: err2 } = await supabase
        .from('trainer_compatibility_profiles')
        .upsert(knownCols, { onConflict: 'user_id' })
      if (err2) {
        console.error('Step ' + step + ' fallback upsert error:', err2)
        return NextResponse.json({ error: err2.message }, { status: 500 })
      }
    }
  }

  // ââ STEP 4: Specialties ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  if (step === 4) {
    const { specialties } = data as { specialties: string[] }

    // Delete existing specialties for this trainer, then re-insert
    await supabase.from('trainer_specialties').delete().eq('trainer_id', user.id)

    if (specialties?.length) {
      const rows = specialties.map((s: string) => ({
        trainer_id: user.id,
        specialty: s,
      }))
      const { error } = await supabase.from('trainer_specialties').insert(rows)
      if (error) {
        console.error('Step 4 specialties insert error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    // Also save specializations array to compatibility profile
    const { error: compatErr } = await supabase
      .from('trainer_compatibility_profiles')
      .upsert(
        {
          user_id: user.id,
          trainer_id: user.id,
          specializations: specialties,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    if (compatErr) {
      console.warn('Step 4 compat profile update failed (non-fatal):', compatErr.message)
    }
  }

  // ââ STEP 6: Plan selection + complete onboarding âââââââââââââââââââââââââââââ
  if (step === 6) {
    const { plan_tier } = data as { plan_tier: string }

    const { error } = await supabase.from('trainer_profiles').upsert(
      {
        id: user.id,
        plan_tier,
        onboarding_complete: true,
        is_published: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    if (error) {
      console.error('Step 6 upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
