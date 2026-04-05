import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()

  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const answers = await req.json()

  // Upsert into client_compatibility_profiles
  const { error } = await supabase
    .from('client_compatibility_profiles')
    .upsert({
      user_id: user.id,
      goals: answers.goals || [],
      schedule: answers.schedule || [],
      coaching_style: (answers.coaching_style || [])[0] || null,
      experience_level: (answers.experience || [])[0] || null,
      preferred_location: (answers.location || [])[0] || null,
      budget_range: (answers.budget || [])[0] || null,
      gender_preference: (answers.gender_pref || [])[0] || null,
      communication_style: (answers.communication || [])[0] || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })

  if (error) {
    console.error('Upsert client profile error:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }

  // Trigger match score computation (fire and forget)
  supabase.functions.invoke('compute-match-scores', {
    body: { client_id: user.id },
  }).catch(() => {
    // Non-blocking — scores computed in background
  })

  return NextResponse.json({ success: true })
}
