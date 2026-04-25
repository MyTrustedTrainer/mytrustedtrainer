import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Crown } from 'lucide-react'

export default async function ActiveClientsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/trainer/clients')

  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select('id, plan_tier')
    .eq('id', user.id)
    .maybeSingle()

  if (!trainer) redirect('/onboarding/trainer/1')

  const tier = trainer.plan_tier || 'free'
  const hasAccess = tier === 'growth' || tier === 'pro'

  if (!hasAccess) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <h1
          className="text-2xl font-bold text-[#03243F] mb-6"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Active Clients
        </h1>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-10 text-center">
          <Crown className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#03243F] mb-2">Upgrade to Manage Clients</h2>
          <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">
            The CRM and active client management is available on Growth ($49/mo) and Pro ($99/mo) plans.
          </p>
          <Link
            href="/dashboard/trainer/billing"
            className="inline-block px-6 py-3 bg-[#18A96B] hover:bg-[#159a5f] text-white font-semibold rounded-xl text-sm transition-colors"
          >
            View Upgrade Options →
          </Link>
        </div>
      </div>
    )
  }

  // Get converted leads (active clients)
  const { data: leads } = await supabase
    .from('leads')
    .select('id, goal_summary, created_at, budget_range')
    .eq('trainer_id', user.id)
    .eq('status', 'converted')
    .order('created_at', { ascending: false })

  const maxClients = tier === 'pro' ? Infinity : 5

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[#03243F]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Active Clients
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {tier === 'growth' ? `${leads?.length || 0} / 5 clients` : `${leads?.length || 0} clients`}
          </p>
        </div>
        {tier === 'pro' && (
          <button className="px-4 py-2 bg-[#03243F] hover:bg-[#04304f] text-white rounded-xl text-sm font-semibold transition-colors">
            + Add Existing Client
          </button>
        )}
      </div>

      {!leads || leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <p className="text-slate-500 text-sm">
            No active clients yet. When you convert a lead to a client, they&apos;ll appear here.
          </p>
          <Link
            href="/dashboard/trainer/leads"
            className="inline-block mt-4 text-sm text-[#18A96B] hover:underline font-medium"
          >
            View your leads →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Client
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">
                  Goal
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">
                  Since
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.map((lead, i) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#18A96B]/20 flex items-center justify-center text-sm font-bold text-[#18A96B]">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm font-medium text-[#03243F]">Client {i + 1}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500 hidden sm:table-cell">
                    {lead.goal_summary || '—'}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400 hidden md:table-cell">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/trainer/clients/${lead.id}`}
                      className="text-xs text-[#18A96B] hover:underline font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
