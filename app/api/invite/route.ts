import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendExistingClientInvite } from '@/lib/resend/emails'

export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select('id, plan_tier, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (!trainer || trainer.plan_tier !== 'pro') {
    return NextResponse.json(
      { error: 'Add Existing Client is available on Pro plan only' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { email } = body

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  // Create a lead row with status='invited' — the lead ID serves as the invite token
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert({
      trainer_id: user.id,
      client_id: null, // filled when client accepts
      status: 'invited',
      message: `Invited by ${trainer.full_name}`,
    })
    .select()
    .single()

  if (leadError || !lead) {
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mytrustedtrainer.com'
  const inviteUrl = `${siteUrl}/accept-invite/${lead.id}`

  // Send invite email using typed template (non-blocking)
  try {
    // Extract first name from email as best guess if no name provided
    const clientFirstName = email.split('@')[0].split('.')[0]
    await sendExistingClientInvite(email, clientFirstName, trainer.full_name, inviteUrl)
  } catch {}

  return NextResponse.json({ success: true, invite_id: lead.id })
}
