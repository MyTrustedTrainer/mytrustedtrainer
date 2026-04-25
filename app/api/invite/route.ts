import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mytrustedtrainer.com'}/accept-invite/${lead.id}`

  try {
    await resend.emails.send({
      from: 'MyTrustedTrainer <hello@mytrustedtrainer.com>',
      to: email,
      subject: `${trainer.full_name} invited you to MyTrustedTrainer`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #03243F;">You've been invited!</h2>
          <p>${trainer.full_name} has invited you to connect on MyTrustedTrainer — a platform that tracks your training progress and keeps everything in one place.</p>
          <p>This invite expires in 7 days.</p>
          <a href="${inviteUrl}" style="display:inline-block;background:#18A96B;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;margin-top:16px;">
            Accept Invite →
          </a>
          <p style="color:#888;font-size:12px;margin-top:24px;">If you didn't expect this, you can ignore this email.</p>
        </div>
      `,
    })
  } catch {
    // Email failure is non-blocking per project rules
  }

  return NextResponse.json({ success: true, invite_id: lead.id })
}
