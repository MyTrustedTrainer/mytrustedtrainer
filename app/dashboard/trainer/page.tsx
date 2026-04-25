import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Eye, Users, Star, Award } from 'lucide-react'
import Link from 'next/link'

export default async function TrainerDashboardOverview() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/trainer')

  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select('id, full_name, plan_tier, first_lead_used, is_published, profile_completeness')
    .eq('id', user.id)
    .maybeSingle()

  if (!trainer) redirect('/onboarding/trainer/1')

  // Profile views (7d)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: profileViews } = await supabase
    .from('profile_views')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainer.id)
    .gte('viewed_at', sevenDaysAgo)

  // New (locked) leads
  const { count: newLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainer.id)
    .eq('status', 'locked')

  // Average match score
  const { data: leadScores } = await supabase
    .from('leads')
    .select('match_score_at_time')
    .eq('trainer_id', trainer.id)
    .not('match_score_at_time', 'is', null)

  const avgScore =
    leadScores && leadScores.length > 0
      ? (leadScores.reduce((s, l) => s + (l.match_score_at_time || 0), 0) / leadScores.length).toFixed(1)
      : null

  // Badges
  const { count: badgesEarned } = await supabase
    .from('badges')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainer.id)
    .eq('is_active', true)

  // Recent leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('id, status, goal_summary, budget_range, match_score_at_time, created_at')
    .eq('trainer_id', trainer.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const metrics = [
    { label: 'Profile Views (7d)', value: String(profileViews ?? 0), icon: Eye, accent: '#1652DB', bg: 'bg-blue-50' },
    { label: 'New Leads', value: String(newLeads ?? 0), icon: Users, accent: '#18A96B', bg: 'bg-green-50' },
    { label: 'Avg Match Score', value: avgScore ? `${avgScore}/10` : '—', icon: Star, accent: '#F4A636', bg: 'bg-amber-50' },
    { label: 'Badges Earned', value: String(badgesEarned ?? 0), icon: Award, accent: '#a855f7', bg: 'bg-purple-50' },
  ]

  const scoreColor = (s: number | null) => {
    if (!s) return 'bg-slate-300'
    if (s >= 9) return 'bg-[#18A96B]'
    if (s >= 7) return 'bg-[#F4A636]'
    return 'bg-slate-400'
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-[#03243F]"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Welcome back, {trainer.full_name?.split(' ')[0] || 'Trainer'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s what&apos;s happening with your profile.
        </p>
      </div>

      {!trainer.is_published && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Your profile is not published yet</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Complete your onboarding to start receiving leads.{' '}
              <Link href="/onboarding/trainer/1" className="underline font-medium">
                Finish setup &rarr;
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" style={{ color: m.accent }} />
              </div>
              <div className="text-2xl font-bold text-[#03243F]">{m.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-[#03243F] text-sm">Recent Leads</h2>
          <Link href="/dashboard/trainer/leads" className="text-sm text-[#18A96B] hover:underline font-medium">
            View all &rarr;
          </Link>
        </div>
        {!recentLeads || recentLeads.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-400 text-sm">
            No leads yet. Once your profile is live, leads will appear here.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${scoreColor(lead.match_score_at_time)}`}>
                  {lead.match_score_at_time ? lead.match_score_at_time.toFixed(1) : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#03243F] truncate">
                    {lead.goal_summary || 'New inquiry'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {lead.budget_range || 'Budget not specified'} &middot;{' '}
                    {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  lead.status === 'locked'
                    ? 'bg-amber-100 text-amber-700'
                    : lead.status === 'unlocked'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {lead.status === 'locked' ? 'New' : lead.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
