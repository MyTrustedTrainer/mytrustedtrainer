import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendNewLeadToTrainer } from '@/lib/resend/emails'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { trainer_id, name, email, phone, message, goals } = body

    if (!trainer_id || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('leads')
      .insert({ trainer_id, name, email, phone, message, goals, source: 'website' })
      .select()
      .single()

    if (error) throw error

    // Track profile view
    await supabase.from('profile_views').insert({ trainer_id, source: 'contact_form' })

    // Notify trainer of new lead (non-blocking)
    try {
      const { data: trainerProfile } = await supabase
        .from('trainer_profiles')
        .select('email, full_name')
        .eq('id', trainer_id)
        .maybeSingle()

      if (trainerProfile?.email) {
        const firstName = trainerProfile.full_name?.split(' ')[0] ?? 'there'
        const goalSummary = goals || message || 'Not specified'
        await sendNewLeadToTrainer(
          trainerProfile.email,
          firstName,
          0,            // manual inquiry — no algorithmic score
          goalSummary,
          'Not specified',
          data.id
        )
      }
    } catch {}

    return NextResponse.json({ success: true, lead: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
