'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react'

interface Lead {
  id: string
  status: string
  goal_summary: string | null
  budget_range: string | null
  match_score_at_time: number | null
  message: string | null
  created_at: string
}

const scoreColor = (s: number | null) => {
  if (!s) return '#94a3b8'
  if (s >= 9) return '#18A96B'
  if (s >= 7) return '#F4A636'
  return '#94a3b8'
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [trainer, setTrainer] = useState<{ id: string; first_lead_used: boolean; plan_tier: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: t } = await supabase
      .from('trainer_profiles')
      .select('id, first_lead_used, plan_tier')
      .eq('id', user.id)
      .maybeSingle()
    setTrainer(t)
    const { data: l } = await supabase
      .from('leads')
      .select('id, status, goal_summary, budget_range, match_score_at_time, message, created_at')
      .eq('trainer_id', user.id)
      .order('match_score_at_time', { ascending: false, nullsFirst: false })
    setLeads(l || [])
    setLoading(false)
  }

  const unlock = async (lead: Lead) => {
    if (!trainer) return
    setUnlocking(lead.id)
    try {
      const isPaidPlan = trainer.plan_tier === 'growth' || trainer.plan_tier === 'pro'
      const isFirst = !trainer.first_lead_used
      if (isFirst || isPaidPlan) {
        if (isFirst && !isPaidPlan) {
          await supabase.from('trainer_profiles').update({ first_lead_used: true }).eq('id', trainer.id)
          setTrainer({ ...trainer, first_lead_used: true })
        }
        await supabase.from('leads').update({ status: 'unlocked' }).eq('id', lead.id)
        await load()
      } else {
        alert('Payment coming soon. This lead has been unlocked for testing.')
        await supabase.from('leads').update({ status: 'unlocked' }).eq('id', lead.id)
        await load()
      }
    } finally {
      setUnlocking(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="w-6 h-6 border-2 border-[#18A96B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isUnlimitedLeads = trainer?.plan_tier === 'growth' || trainer?.plan_tier === 'pro'
  const firstFreeAvailable = !trainer?.first_lead_used

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#03243F]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Leads
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isUnlimitedLeads
            ? 'Unlimited lead unlocks included with your plan.'
            : firstFreeAvailable
            ? 'Your first lead unlock is free. Additional leads are $15 each.'
            : 'Additional leads are $15 each. Upgrade to Growth for unlimited unlocks.'}
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <UsersIcon className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">No leads yet. They&apos;ll appear here when clients request sessions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const isOpen = expanded === lead.id
            const isLocked = lead.status === 'locked'
            const color = scoreColor(lead.match_score_at_time)
            return (
              <div key={lead.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : lead.id)}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {lead.match_score_at_time ? lead.match_score_at_time.toFixed(1) : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    {isLocked ? (
                      <div className="flex items-center gap-2">
                        <div className="h-3 bg-slate-200 rounded w-24 animate-pulse" />
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-[#03243F]">Client inquiry</div>
                    )}
                    <div className="text-xs text-slate-400 mt-0.5">
                      {lead.goal_summary || 'Goal not specified'}{lead.budget_range ? ` · ${lead.budget_range}` : ''} ·{' '}
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isLocked ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {isLocked ? 'Locked' : 'Unlocked'}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                    {isLocked ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Goal:</span> {lead.goal_summary || 'Not specified'}</p>
                          {lead.budget_range && <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Budget:</span> {lead.budget_range}</p>}
                          {lead.message && <p className="text-sm text-slate-600"><span className="font-medium">Message:</span> {lead.message}</p>}
                        </div>
                        <button
                          onClick={() => unlock(lead)}
                          disabled={unlocking === lead.id}
                          className="flex items-center gap-2 px-4 py-2.5 bg-[#18A96B] hover:bg-[#159a5f] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap"
                        >
                          <Unlock className="w-4 h-4" />
                          {unlocking === lead.id ? 'Unlocking…' : isUnlimitedLeads ? 'Unlock Lead' : firstFreeAvailable ? 'Unlock Free — First Lead' : 'Unlock for $15'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Goal:</span> {lead.goal_summary || 'Not specified'}</p>
                        {lead.budget_range && <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Budget:</span> {lead.budget_range}</p>}
                        {lead.message && <p className="text-sm text-slate-600 mb-3"><span className="font-medium">Message:</span> {lead.message}</p>}
                        <a href="/dashboard/trainer/messages" className="inline-flex items-center gap-2 text-sm text-[#18A96B] hover:underline font-medium">
                          Open conversation &rarr;
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
