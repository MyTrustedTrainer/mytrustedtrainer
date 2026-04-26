import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ClientSettingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/client/dashboard/settings')

  const { data: profile } = await supabase
    .from('client_profiles')
    .select('full_name, city, state')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1
        className="text-2xl font-bold text-[#03243F] mb-6"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        Settings
      </h1>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Account
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Name</p>
              <p className="text-sm font-medium text-[#03243F] mt-0.5">
                {profile?.full_name ?? 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium text-[#03243F] mt-0.5">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Location</p>
              <p className="text-sm font-medium text-[#03243F] mt-0.5">
                {profile?.city && profile?.state
                  ? `${profile.city}, ${profile.state}`
                  : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Compatibility Profile
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Update your answers to get better trainer matches. Re-running the quiz recalculates
            your scores.
          </p>
          <Link
            href="/onboarding/client/1"
            className="inline-block px-4 py-2 border border-[#03243F] text-[#03243F] hover:bg-[#03243F] hover:text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Update Compatibility Answers
          </Link>
        </div>

        <div className="p-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Notifications
          </h2>
          <p className="text-xs text-slate-500">
            Weekly check-in reminders are sent every Monday at 8am CT to your email address on
            file.
          </p>
        </div>
      </div>
    </div>
  )
}
