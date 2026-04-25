import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle, Zap, Crown } from 'lucide-react'

const PLANS = [
  {
    tier: 'growth', name: 'Growth', price: '$49/mo', founding: '$29/mo',
    features: ['Unlimited lead unlocks', 'CRM for up to 5 active clients', 'Message all unlocked leads', 'Analytics dashboard'],
    cta: 'Upgrade to Growth', highlight: true, icon: Zap,
  },
  {
    tier: 'pro', name: 'Pro', price: '$99/mo', founding: null,
    features: ['Everything in Growth', 'Unlimited active clients', 'Onboard existing clients', 'Priority placement in search', 'Google Calendar sync'],
    cta: 'Upgrade to Pro', highlight: false, icon: Crown,
  },
]

export default async function BillingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/trainer/billing')

  const { data: trainer } = await supabase
    .from('trainer_profiles').select('id, plan_tier, full_name')
    .eq('id', user.id).maybeSingle()
  if (!trainer) redirect('/onboarding/trainer/1')

  const { data: sub } = await supabase
    .from('subscriptions').select('plan_tier, status, current_period_end, stripe_subscription_id')
    .eq('trainer_id', user.id).maybeSingle()

  const tier = trainer.plan_tier || 'free'
  const isPaid = tier === 'growth' || tier === 'pro'

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#03243F]" style={{ fontFamily: 'Playfair Display, serif' }}>Billing</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your plan and subscription.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Current Plan</p>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${tier === 'pro' ? 'text-purple-600' : tier === 'growth' ? 'text-blue-600' : 'text-slate-600'}`}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </span>
              {isPaid && sub?.status === 'active' && <CheckCircle className="w-4 h-4 text-[#18A96B]" />}
            </div>
            {isPaid && sub?.current_period_end && (
              <p className="text-xs text-slate-400 mt-1">Renews {new Date(sub.current_period_end).toLocaleDateString()}</p>
            )}
            {!isPaid && <p className="text-xs text-slate-400 mt-1">First lead unlock free, $15 per lead after that</p>}
          </div>
          {isPaid && (
            <a href="/api/billing/portal" className="px-4 py-2 border border-slate-200 text-slate-600 hover:border-[#03243F] hover:text-[#03243F] rounded-xl text-sm font-medium transition-colors">
              Manage Billing &rarr;
            </a>
          )}
        </div>
      </div>

      {!isPaid && (
        <>
          <h2 className="text-sm font-semibold text-[#03243F] mb-4">Upgrade your plan</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PLANS.map((plan) => {
              const Icon = plan.icon
              return (
                <div key={plan.tier} className={`bg-white rounded-xl border shadow-sm p-5 ${plan.highlight ? 'border-[#18A96B] ring-1 ring-[#18A96B]/20' : 'border-slate-100'}`}>
                  {plan.highlight && (
                    <div className="text-[10px] font-bold text-[#18A96B] bg-[#18A96B]/10 px-2 py-0.5 rounded-full inline-block mb-3">MOST POPULAR</div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-5 h-5 text-[#03243F]" />
                    <h3 className="font-bold text-[#03243F]">{plan.name}</h3>
                  </div>
                  <div className="mb-1">
                    <span className="text-2xl font-bold text-[#03243F]">{plan.price}</span>
                    {plan.founding && (
                      <span className="ml-2 text-xs bg-[#F4A636]/10 text-[#F4A636] font-semibold px-2 py-0.5 rounded-full">{plan.founding} founding offer</span>
                    )}
                  </div>
                  <ul className="space-y-1.5 mb-4 mt-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle className="w-3.5 h-3.5 text-[#18A96B] flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href={`/api/billing/checkout?plan=${plan.tier}`}
                    className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.highlight ? 'bg-[#18A96B] hover:bg-[#159a5f] text-white' : 'bg-[#03243F] hover:bg-[#04304f] text-white'}`}>
                    {plan.cta}
                  </a>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tier === 'growth' && (
        <>
          <h2 className="text-sm font-semibold text-[#03243F] mb-4 mt-6">Unlock more with Pro</h2>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-[#03243F]">Pro — $99/mo</h3>
            </div>
            <ul className="space-y-1.5 mb-4">
              {['Unlimited active clients', 'Onboard your existing clients', 'Priority placement in search', 'Google Calendar sync'].map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <a href="/api/billing/checkout?plan=pro" className="inline-block px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-colors">
              Upgrade to Pro &rarr;
            </a>
          </div>
        </>
      )}
    </div>
  )
}
