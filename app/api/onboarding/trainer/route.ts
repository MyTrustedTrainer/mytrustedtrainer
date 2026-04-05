import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const answers = await req.json()

  // Get trainer profile id
  const { data: trainerProfile } = await supabase
    .from('trainer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!trainerProfile) {
    return NextResponse.json({ error: 'Trainer profile not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('trainer_compatibility_profiles')
    .upsert({
      trainer_id: trainerProfile.id,
      user_id: user.id,
      specializations: answers.specializations || [],
      availability: answers.availability || [],
      coaching_style: (answers.coaching_style || [])[0] || null,
      preferred_location: (answers.preferred_location || [])[0] || null,
      experience_level: (answers.experience_level || [])[0] || null,
      communication_style: (answers.communication_style || [])[0] || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'trainer_id',
    })

  if (error) {
    console.error('Upsert trainer compatibility error:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
