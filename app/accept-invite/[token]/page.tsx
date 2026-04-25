import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

export default async function AcceptInvitePage({
  params,
}: {
  params: { token: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Look up the invite lead
  const { data: lead } = await supabase
    .from('leads')
    .select('id, trainer_id, status, trainer_profiles(full_name, profile_photo_url, slug, city, state)')
    .eq('id', params.token)
    .eq('status', 'invited')
    .maybeSingle()

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1
            className="text-xl font-bold text-[#03243F] mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Invalid or Expired Invite
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            This invite link has already been used or has expired. Please contact your trainer for a
            new invite.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#03243F] hover:bg-[#04304f] text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const trainer = (lead as any).trainer_profiles

  // If not logged in, redirect to signup with return URL
  if (!user) {
    redirect(`/signup?redirect=/accept-invite/${params.token}`)
  }

  // Accept the invite — link this client to the lead and mark converted
  const { error } = await supabase
    .from('leads')
    .update({
      client_id: user.id,
      status: 'converted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.token)

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1
            className="text-xl font-bold text-[#03243F] mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Something went wrong
          </h1>
          <p className="text-slate-500 text-sm">
            We couldn&apos;t process your invite. Please try again or contact support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center">
        <CheckCircle className="w-12 h-12 text-[#18A96B] mx-auto mb-4" />
        <h1
          className="text-2xl font-bold text-[#03243F] mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          You&apos;re connected!
        </h1>
        {trainer && (
          <p className="text-slate-500 text-sm mb-6">
            You&apos;re now connected with{' '}
            <span className="font-semibold text-[#03243F]">{trainer.full_name}</span>{' '}
            {trainer.city && `in ${trainer.city}, ${trainer.state}`}.
          </p>
        )}
        <div className="flex flex-col gap-3">
          <Link
            href="/client/dashboard/my-program"
            className="block w-full py-3 bg-[#18A96B] hover:bg-[#159a5f] text-white font-semibold rounded-xl text-sm transition-colors"
          >
            View My Program →
          </Link>
          {trainer?.slug && (
            <Link
              href={`/trainers/${trainer.slug}`}
              className="block w-full py-3 border border-slate-200 text-slate-600 hover:border-[#03243F] hover:text-[#03243F] font-medium rounded-xl text-sm transition-colors"
            >
              View Trainer Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
