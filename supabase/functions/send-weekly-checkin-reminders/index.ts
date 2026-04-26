// supabase/functions/send-weekly-checkin-reminders/index.ts
// Runs Monday 8am CT via pg_cron. Sends Resend email to each client
// who has a converted lead and hasn't checked in with that trainer in 7 days.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select(
      'client_id, trainer_id, client_profiles(email, full_name), trainer_profiles(full_name, slug)'
    )
    .eq('status', 'converted')

  if (leadsError) {
    return new Response(JSON.stringify({ error: leadsError.message }), { status: 500 })
  }

  if (!leads?.length) {
    return new Response(JSON.stringify({ message: 'No converted leads' }), { status: 200 })
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const siteUrl = Deno.env.get('SITE_URL') ?? 'https://mytrustedtrainer.com'
  let sent = 0
  let skipped = 0

  for (const lead of leads) {
    const { client_id, trainer_id } = lead
    const client = (lead as any).client_profiles
    const trainer = (lead as any).trainer_profiles

    if (!client?.email) { skipped++; continue }

    // Skip if already checked in this week
    const { data: recent } = await supabase
      .from('checkins')
      .select('id')
      .eq('client_id', client_id)
      .eq('trainer_id', trainer_id)
      .gte('created_at', sevenDaysAgo)
      .limit(1)

    if (recent?.length) { skipped++; continue }

    const checkinUrl = `${siteUrl}/client/checkin/${trainer_id}`
    const firstName = client.full_name?.split(' ')[0] ?? 'there'
    const trainerName = trainer?.full_name ?? 'your trainer'

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        },
        body: JSON.stringify({
          from: 'MyTrustedTrainer <hello@mytrustedtrainer.com>',
          to: client.email,
          subject: `How was your week with ${trainerName}?`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;">
              <div style="background:#03243F;padding:20px 28px;border-radius:12px 12px 0 0;">
                <p style="color:white;font-size:18px;font-weight:bold;margin:0;">MyTrustedTrainer</p>
              </div>
              <div style="background:white;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
                <h2 style="color:#03243F;margin:0 0 12px 0;">How was your week, ${firstName}?</h2>
                <p style="color:#475569;margin:0 0 8px 0;line-height:1.6;">
                  Time for your weekly check-in with <strong>${trainerName}</strong>. It takes about 45 seconds, and your ratings are completely private.
                </p>
                <a href="${checkinUrl}" style="display:inline-block;background:#18A96B;color:white;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:15px;margin-top:20px;">
                  Submit This Week's Check-in →
                </a>
                <p style="color:#94a3b8;font-size:11px;margin-top:24px;">
                  MyTrustedTrainer · College Station, TX<br/>
                  Your individual ratings are always private and anonymous.
                </p>
              </div>
            </div>
          `,
        }),
      })
      sent++
    } catch (_e) {
      // Non-blocking — continue to next
    }
  }

  return new Response(
    JSON.stringify({ success: true, sent, skipped, total: leads.length }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 }
  )
})
