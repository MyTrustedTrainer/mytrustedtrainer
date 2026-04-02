import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    return NextResponse.json({ success: true, lead: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}