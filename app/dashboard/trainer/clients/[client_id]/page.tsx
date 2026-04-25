import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, BarChart2, StickyNote, User } from 'lucide-react'

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: { client_id: string }
  searchParams: { tab?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select('id, plan_tier')
    .eq('id', user.id)
    .maybeSingle()

  if (!trainer) redirect('/onboarding/trainer/1')

  const tier = trainer.plan_tier || 'free'
  const hasAccess = tier === 'growth' || tier === 'pro'
  if (!hasAccess) redirect('/dashboard/trainer/clients')

  const { data: lead } = await supabase
    .from('leads')
    .select('id, goal_summary, budget_range, created_at, match_score_at_time, status, client_id')
    .eq('id', params.client_id)
    .eq('trainer_id', user.id)
    .maybeSingle()

  if (!lead) redirect('/dashboard/trainer/clients')

  const { data: clientProfile } = lead.client_id
    ? await supabase
        .from('client_profiles')
        .select('full_name, city, state, goals, preferred_formats, compatibility_complete')
        .eq('id', lead.client_id)
        .maybeSingle()
    : { data: null }

  const { data: checkins } = await supabase
    .from('checkins')
    .select('id, week_of, session_rating, energy_rating, response_speed_rating, created_at')
    .eq('trainer_id', user.id)
    .eq('client_id', lead.client_id || '')
    .order('week_of', { ascending: false })

  const { data: routines } = await supabase
    .from('routines')
    .select('id, title, description, created_at')
    .eq('trainer_id', user.id)
    .eq('client_id', lead.id)
    .order('created_at', { ascending: false })

  const activeTab = searchParams.tab || 'overview'
  const clientName = (clientProfile as any)?.full_name || 'Client'

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'routine', label: 'Routine', icon: ClipboardList },
    { id: 'checkins', label: 'Check-ins', icon: BarChart2 },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ]

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/trainer/clients"
          className="text-sm text-slate-400 hover:text-[#03243F] transition-colors"
        >
          ← Active Clients
        </Link>
        <span className="text-slate-300">/</span>
        <h1
          className="text-xl font-bold text-[#03243F]"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {clientName}
        </h1>
        {lead.match_score_at_time && (
          <span className="text-xs bg-[#18A96B]/10 text-[#18A96B] font-semibold px-2 py-0.5 rounded-full">
            {lead.match_score_at_time} match
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.id}
              href={`/dashboard/trainer/clients/${params.client_id}?tab=${tab.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#03243F] shadow-sm'
                  : 'text-slate-500 hover:text-[#03243F]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="text-2xl font-bold text-[#03243F]">{checkins?.length || 0}</div>
              <div className="text-xs text-slate-500 mt-0.5">Total Check-ins</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="text-2xl font-bold text-[#03243F]">
                {checkins && checkins.length > 0
                  ? (
                      checkins.reduce((s, c) => s + (c.session_rating || 0), 0) /
                      checkins.length
                    ).toFixed(1)
                  : '—'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Avg Session Rating</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="text-2xl font-bold text-[#03243F]">
                {lead.match_score_at_time ?? '—'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Match Score</div>
            </div>
          </div>

          {clientProfile && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Client Profile
              </p>
              <div className="space-y-2.5">
                {(clientProfile as any).city && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400 w-24 flex-shrink-0">Location</span>
                    <span className="text-[#03243F]">
                      {(clientProfile as any).city}, {(clientProfile as any).state}
                    </span>
                  </div>
                )}
                {(clientProfile as any).goals && (clientProfile as any).goals.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-slate-400 w-24 flex-shrink-0">Goals</span>
                    <div className="flex flex-wrap gap-1">
                      {((clientProfile as any).goals as string[]).map((g) => (
                        <span
                          key={g}
                          className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {lead.goal_summary && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-slate-400 w-24 flex-shrink-0">Summary</span>
                    <span className="text-[#03243F]">{lead.goal_summary}</span>
                  </div>
                )}
                {lead.budget_range && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400 w-24 flex-shrink-0">Budget</span>
                    <span className="text-[#03243F]">{lead.budget_range}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Current Routine
              </p>
              <Link
                href={`/dashboard/trainer/clients/${params.client_id}?tab=routine`}
                className="text-xs text-[#18A96B] hover:underline font-medium"
              >
                {routines && routines.length > 0 ? 'Edit →' : 'Create →'}
              </Link>
            </div>
            {routines && routines.length > 0 ? (
              <p className="text-sm font-medium text-[#03243F]">{routines[0].title}</p>
            ) : (
              <p className="text-sm text-slate-400">No routine assigned yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Routine Tab */}
      {activeTab === 'routine' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Routine</p>
            <Link
              href={`/dashboard/trainer/clients/${params.client_id}/routine`}
              className="px-4 py-2 bg-[#18A96B] hover:bg-[#159a5f] text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Open Routine Builder →
            </Link>
          </div>
          {routines && routines.length > 0 ? (
            <div>
              <p className="text-sm font-semibold text-[#03243F] mb-1">{routines[0].title}</p>
              <p className="text-sm text-slate-500">{routines[0].description || 'No description.'}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No routine created yet. Use the Routine Builder to create one.
            </p>
          )}
        </div>
      )}

      {/* Check-ins Tab */}
      {activeTab === 'checkins' && (
        <div className="space-y-4">
          {!checkins || checkins.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
              <p className="text-slate-500 text-sm">
                No check-ins yet. Check-ins appear weekly as clients rate their sessions.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Week
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Energy
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Session
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Response
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {checkins.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-sm text-slate-600">
                        {new Date(c.week_of).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium text-[#03243F]">
                          {c.energy_rating ?? '—'}/5
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium text-[#03243F]">
                          {c.session_rating ?? '—'}/5
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium text-[#03243F]">
                          {c.response_speed_rating ?? '—'}/5
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Private Notes
          </p>
          <p className="text-sm text-slate-400">
            Notes feature coming in a future update. Use the messages thread to communicate with your
            client.
          </p>
        </div>
      )}
    </div>
  )
}
