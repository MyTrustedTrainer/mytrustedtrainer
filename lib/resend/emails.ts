/**
 * lib/resend/emails.ts
 * Typed send functions for all 9 MTT transactional emails.
 * All functions: wrapped in try/catch, never throw on failure.
 * Shared layout: navy #03243F header, white body 600px, green #18A96B CTAs.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mytrustedtrainer.com'
const FROM = 'MyTrustedTrainer <hello@mytrustedtrainer.com>'

// ─── Shared HTML layout ───────────────────────────────────────────────────────

function emailLayout(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <div style="background:#03243F;padding:20px 28px;border-radius:12px 12px 0 0">
      <p style="color:white;font-size:18px;font-weight:bold;margin:0;letter-spacing:-0.3px">MyTrustedTrainer</p>
    </div>
    <div style="background:white;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
      ${body}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 20px">
      <p style="color:#94a3b8;font-size:11px;line-height:1.6;margin:0">
        MyTrustedTrainer &middot; College Station, TX<br>
        <a href="${SITE_URL}/unsubscribe" style="color:#94a3b8">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

function ctaButton(text: string, href: string, color = '#18A96B', textColor = 'white'): string {
  return `<a href="${href}" style="display:inline-block;background:${color};color:${textColor};text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:15px;margin-top:20px">${text}</a>`
}

// ─── Resend send helper ───────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
}

// ─── 1. Trainer Welcome ───────────────────────────────────────────────────────

export async function sendTrainerWelcome(to: string, firstName: string): Promise<void> {
  try {
    const html = emailLayout(`
      <h2 style="color:#03243F;margin:0 0 12px;font-size:22px">Your MTT profile is ready to claim, ${firstName}.</h2>
      <p style="color:#475569;line-height:1.7;margin:0 0 8px">
        MyTrustedTrainer matches fitness clients to their ideal personal trainer using a compatibility algorithm — not star ratings.
        Claim your profile to start appearing in matches, respond to leads, and earn verified behavioral badges.
      </p>
      <p style="color:#475569;line-height:1.7;margin:0">
        First lead is always free. No monthly fee until you're ready.
      </p>
      ${ctaButton('Complete My Profile →', `${SITE_URL}/onboarding/trainer/1`)}
    `)
    await sendEmail(to, 'Your MyTrustedTrainer profile is ready to claim', html)
  } catch {}
}

// ─── 2. Client Welcome ────────────────────────────────────────────────────────

export async function sendClientWelcome(to: string, firstName: string): Promise<void> {
  try {
    const html = emailLayout(`
      <h2 style="color:#03243F;margin:0 0 12px;font-size:22px">Find your perfect trainer match, ${firstName}.</h2>
      <p style="color:#475569;line-height:1.7;margin:0 0 8px">
        MyTrustedTrainer doesn't show you star ratings from strangers. It shows you a personal compatibility score —
        calculated from your coaching preferences, training style, communication needs, and goals.
      </p>
      <p style="color:#475569;line-height:1.7;margin:0">
        Takes about 3 minutes. Your scores are yours alone — never shared with trainers.
      </p>
      ${ctaButton('Build My Compatibility Profile →', `${SITE_URL}/onboarding/client`)}
    `)
    await sendEmail(to, 'Welcome to MyTrustedTrainer — find your perfect match', html)
  } catch {}
}

// ─── 3. New Lead (Trainer) ────────────────────────────────────────────────────

export async function sendNewLeadToTrainer(
  to: string,
  trainerFirstName: string,
  matchScore: number,
  goalSummary: string,
  budgetRange: string,
  leadId: string
): Promise<void> {
  try {
    const scoreColor = matchScore >= 9.0 ? '#18A96B' : matchScore >= 7.0 ? '#F4A636' : '#94a3b8'
    const html = emailLayout(`
      <h2 style="color:#03243F;margin:0 0 4px;font-size:22px">New matched lead, ${trainerFirstName}.</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px">Someone is looking for a trainer like you.</p>

      <div style="display:flex;align-items:center;gap:16px;background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px">
        <div style="width:56px;height:56px;border-radius:50%;background:${scoreColor};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="color:white;font-size:18px;font-weight:bold">${matchScore}</span>
        </div>
        <div>
          <p style="color:#03243F;font-weight:bold;margin:0 0 2px">Compatibility Score</p>
          <p style="color:#475569;font-size:13px;margin:0">${matchScore}/10 match with this client</p>
        </div>
      </div>

      <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:20px">
        <p style="color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px">Goal</p>
        <p style="color:#03243F;font-size:14px;margin:0 0 12px">${goalSummary}</p>
        <p style="color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px">Budget</p>
        <p style="color:#03243F;font-size:14px;margin:0 0 12px">${budgetRange}</p>
        <p style="color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px">Client Info</p>
        <p style="color:#cbd5e1;font-size:14px;margin:0;filter:blur(4px);user-select:none">████ ██████ &bull; ████████@████.com &bull; (███) ███-████</p>
        <p style="color:#94a3b8;font-size:11px;margin:4px 0 0">Unlock to reveal full contact details</p>
      </div>

      ${ctaButton('Unlock This Lead →', `${SITE_URL}/dashboard/trainer/leads`)}
    `)
    await sendEmail(to, `New matched lead — ${matchScore}/10 compatibility`, html)
  } catch {}
}

// ─── 4. Lead Unlocked (Client) ────────────────────────────────────────────────

export async function sendLeadUnlockedToClient(
  to: string,
  clientFirstName: string,
  trainerName: string
): Promise<void> {
  try {
    const html = emailLayout(`
      <h2 style="color:#03243F;margin:0 0 12px;font-size:22px">Great news, ${clientFirstName}!</h2>
      <p style="color:#475569;line-height:1.7;margin:0 0 8px">
        <strong>${trainerName}</strong> has unlocked your inquiry and is interested in working with you.
        Head to your inbox to start a conversation.
      </p>
      ${ctaButton('View My Inbox →', `${SITE_URL}/client/dashboard/inquiries`)}
    `)
    await sendEmail(to, `${trainerName} is interested in working with you`, html)
  } catch {}
}

// ─── 5. New Message ───────────────────────────────────────────────────────────

export async function sendNewMessage(
  to: string,
  recipientFirstName: string,
  senderName: string,
  messagePreview: string,
  replyUrl: string
): Promise<void> {
  try {
    const preview = messagePreview.length > 100 ? messagePreview.substring(0, 100) + '…' : messagePreview
    const html = emailLayout(`
      <h2 style="color:#03243F;margin:0 0 12px;font-size:22px">New message from ${senderName}</h2>
      <div style="background:#f8fafc;border-left:3px solid #18A96B;border-radius:0 8px 8px 0;padding:12px 16px;margin:0 0 20px">
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0;font-style:italic">"${preview}"</p>
      </div>
      <p style="color:#475569;line-height:1.7;margin:0">Reply now to keep the conversation going, ${recipientFirstName}.</p>
      ${ctaButton('Reply Now →', replyUrl)}
    `)
    await sendEmail(to, `New message from ${senderName}`, html)
  } catch {}
}

// ─── 6. Check-in Reminder ─────────────────────────────────────────────────────

export async function sendCheckinReminder(
  to: string,
  clientFirstName: string,
  trainerName: string,
  trainerId: string
): Promise<void> {
  try {
    const checkinUrl = `${SITE_URL}/client/checkin/${trainerId}`
    const html = emailLayout(`
      <h2 style="color:#03243F;margin:0 0 12px;font-size:22px">How was your week with ${trainerName}?</h2>
      <p style="color:#475569;line-height:1.7;margin:0 0 8px">
        Time for your weekly check-in, ${clientFirstName}. It takes about 45 seconds, and your ratings are
        completely private — your trainer only sees aggregate scores across all clients, never your individual ratings.
      </p>
      <p style="color:#475569;line-height:1.7;margin:0">
        Your feedback also powers verified trainer badges — the only badges on MTT that can't be bought or requested.
      </p>
      ${ctaButton('Submit This Week\'s Check-in →', checkinUrl)}
      <p style="color:#94a3b8;font-size:12px;margin-top:16px">These reminders send every Monday at 8am CT.</p>
    `)
    await sendEmail(to, `How was your week with ${trainerName}?`, html)
  } catch {}
}

// ─── 7. Payment Failed ────────────────────────────────────────────────────────

export async function sendPaymentFailed(
  to: string,
  trainerFirstName: string
): Promise<void> {
  try {
    const html = emailLayout(`
      <h2 style="color:#03243F;margin:0 0 12px;font-size:22px">Action needed — payment issue on your MTT account</h2>
      <p style="color:#475569;line-height:1.7;margin:0 0 8px">
        Hi ${trainerFirstName}, we were unable to process your MyTrustedTrainer subscription payment.
      </p>
      <p style="color:#475569;line-height:1.7;margin:0">
        Please update your billing information to keep your account active and avoid losing access to leads and CRM features.
      </p>
      ${ctaButton('Update Billing →', `${SITE_URL}/api/portal/session`, '#F4A636', '#03243F')}
    `)
    await sendEmail(to, 'Action needed — payment issue on your MTT account', html)
  } catch {}
}

// ─── 8. Subscription Cancelled ───────────────────────────────────────────────

export async function sendSubscriptionCancelled(
  to: string,
  trainerFirstName: string
): Promise<void> {
  try {
    const html = emailLayout(`
      <h2 style="color:#03243F;margin:0 0 12px;font-size:22px">Your MTT subscription has ended</h2>
      <p style="color:#475569;line-height:1.7;margin:0 0 8px">
        Hi ${trainerFirstName}, your MyTrustedTrainer subscription has been cancelled.
      </p>
      <p style="color:#475569;line-height:1.7;margin:0">
        Your profile is still active and you'll still appear in client searches. Leads beyond your first free one
        will require a $15 unlock. You can reactivate your subscription at any time to get unlimited leads back.
      </p>
      ${ctaButton('Reactivate My Subscription →', `${SITE_URL}/dashboard/trainer/billing`)}
    `)
    await sendEmail(to, 'Your MTT subscription has ended', html)
  } catch {}
}

// ─── 9. Existing Client Invite ────────────────────────────────────────────────

export async function sendExistingClientInvite(
  to: string,
  clientFirstName: string,
  trainerName: string,
  acceptUrl: string
): Promise<void> {
  try {
    const html = emailLayout(`
      <h2 style="color:#03243F;margin:0 0 12px;font-size:22px">${trainerName} wants to connect with you on MTT</h2>
      <p style="color:#475569;line-height:1.7;margin:0 0 8px">
        Hi ${clientFirstName}, your trainer <strong>${trainerName}</strong> has invited you to join MyTrustedTrainer
        so they can share your training routine, track your progress, and log weekly check-ins.
      </p>
      <p style="color:#475569;line-height:1.7;margin:0">
        Accepting this invitation is free. You'll be connected directly to ${trainerName}'s trainer profile.
      </p>
      ${ctaButton('Accept Invitation →', acceptUrl)}
      <p style="color:#94a3b8;font-size:12px;margin-top:16px">This invitation expires in 7 days.</p>
    `)
    await sendEmail(to, `${trainerName} wants to connect with you on MyTrustedTrainer`, html)
  } catch {}
}
