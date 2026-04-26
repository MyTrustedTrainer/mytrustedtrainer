'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Crown, Zap, Star, AlertCircle } from 'lucide-react'

type PlanTier = 'free' | 'growth' | 'pro'

interface TrainerPlan {
  plan_tier: PlanTier
  stripe_customer_id: string | null
  first_lead_used: boolean
}

function PlanBadge({ tier }: { tier: PlanTier }) {
  if (tier === 'pro') return <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wide">Pro</span>
  if (tier === 'growth') return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide">Growth</span>
  return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wide">Free</span>
}

export default function BillingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [profile, setProfile] = useState<TrainerPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const justUpgraded = searchParams.get('success') === 'true'
  const upgradedPlan = searchParams.get('plan')
  const noBilling = searchParams.get('no_billing') === 'true'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase
        .from('trainer_profiles')
        .select('plan_tier, stripe_customer_id, first_lead_used')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setProfile(data)
          setLoading(false)
        })
    })
  }, [router])

  const handleUpgrade = async (plan: 'growth' | 'pro') => {
    setUpgrading(plan)
    setError('')
    try {
      const res = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong')
        setUpgrading(null)
      }
    } catch {
      setError('Failed to start checkout. Please try again.')
      setUpgrading(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-[#18A96B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const tier = profile?.plan_tier ?? 'free'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1
        className="text-2xl font-bold text-[#03243F] mb-6"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        Billing & Plan
      </h1>

      {/* Success Banner */}
      {justUpgraded && upgradedPlan && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-[#18A96B] shrink-0" />
          <p className="text-sm text-green-800 font-medium">
            You're now on the <span className="capitalize">{upgradedPlan}</span> plan. Welcome!
          </p>
        </div>
      )}

      {noBilling && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-[#F4A636] shrink-0" />
          <p className="text-sm text-amber-800">No billing account found. Upgrade to a paid plan to access billing settings.</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Current Plan</h2>
          <PlanBadge tier={tier} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-[#03243F] capitalize">{tier} Plan</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {tier === 'free' && 'First lead free · $15/lead after · No monthly fee'}
              {tier === 'growth' && 'Unlimited leads · CRM for up to 5 clients'}
              {tier === 'pro' && 'Unlimited everything · Priority placement · Add existing clients'}
            </p>
          </div>
          {profile?.stripe_customer_id && tier !== 'free' && (
            <a
              href="/api/portal/session"
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors"
            >
              Manage Billing →
            </a>
          )}
        </div>
      </div>

      {/* Lead Unlock Status (Free tier) */}
      {tier === 'free' && (
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 mb-6 flex items-center gap-3">
          <Zap className={`w-5 h-5 shrink-0 ${profile?.first_lead_used ? 'text-slate-400' : 'text-[#18A96B]'}`} />
          <p className="text-sm text-slate-600">
            {profile?.first_lead_used
              ? 'Free lead used · Additional leads unlock at $15 each'
              : '🎉 Your first lead unlock is free — no payment needed'}
          </p>
        </div>
      )}

      {/* Upgrade Cards */}
      {tier !== 'pro' && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Growth */}
          {tier !== 'growth' && (
            <div className="bg-white rounded-2xl border-2 border-[#1652DB] shadow-sm p-6 relative">
              <div className="absolute -top-3 left-6">
                <span className="bg-[#F4A636] text-[#03243F] text-xs font-bold px-3 py-1 rounded-full">
                  Founding Rate — $29/mo for life
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Growth</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-[#03243F]">$29</span>
                  <span className="text-slate-500 text-sm">/mo</span>
                  <span className="ml-2 text-slate-400 line-through text-sm">$49</span>
                </div>
                <p className="text-xs text-[#18A96B] font-semibold mb-4">Locked in for life — only for founding trainers</p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Unlimited lead unlocks',
                    'CRM for up to 5 active clients',
                    'Routine builder + client program',
                    'Full analytics dashboard',
                    'Badge showcase on profile',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-[#18A96B] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade('growth')}
                  disabled={upgrading === 'growth'}
                  className="w-full py-3 bg-[#1652DB] hover:bg-[#1245b8] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {upgrading === 'growth' ? 'Redirecting to checkout…' : 'Claim Founding Rate →'}
                </button>
              </div>
            </div>
          )}

          {/* Pro */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Pro</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-[#03243F]">$99</span>
              <span className="text-slate-500 text-sm">/mo</span>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                'Everything in Growth',
                'Unlimited active clients',
                'Add existing clients (invite link)',
                'Priority placement in match results',
                'Early access to new features',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <Crown className="w-4 h-4 text-purple-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={upgrading === 'pro'}
              className="w-full py-3 bg-[#03243F] hover:bg-[#04304f] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {upgrading === 'pro' ? 'Redirecting to checkout…' : 'Upgrade to Pro →'}
            </button>
          </div>
        </div>
      )}

      {/* Pro already — show Star badge */}
      {tier === 'pro' && (
        <div className="bg-purple-50 rounded-2xl border border-purple-100 p-6 flex items-center gap-4">
          <Star className="w-8 h-8 text-purple-500 shrink-0" />
          <div>
            <p className="font-semibold text-purple-900">You're on the Pro plan</p>
            <p className="text-sm text-purple-700 mt-0.5">Unlimited clients, priority placement, and every feature MTT offers.</p>
          </div>
        </div>
      )}

      {/* Growth — show upgrade to Pro only */}
      {tier === 'growth' && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#03243F]">Upgrade to Pro</p>
              <p className="text-sm text-slate-500 mt-0.5">Unlock unlimited clients, existing client invites, and priority placement.</p>
            </div>
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={upgrading === 'pro'}
              className="px-5 py-2.5 bg-[#03243F] hover:bg-[#04304f] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {upgrading === 'pro' ? 'Redirecting…' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
