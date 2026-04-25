import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock } from 'lucide-react'

const BADGE_DEFS = [
  {
    type: 'responsive',
    name: 'Lightning Responder',
    icon: '⚡',
    description: 'Awarded when your average response time to client messages is under 2 hours over a 30-day period.',
    earnedCopy: 'You respond faster than most trainers. Clients love it.',
    progressCopy: 'Keep your response time under 2 hours consistently.',
  },
  {
    type: 'consistent',
    name: 'Consistency King',
    icon: '🔁',
    description: 'Awarded when clients rate your session consistency 4+ stars for 8 consecutive weeks.',
    earnedCopy: 'Your clients know they can count on you. That\'s rare.',
    progressCopy: 'Maintain high session consistency ratings for 8 weeks straight.',
  },
  {
    type: 'results_driven',
    name: 'Results Driven',
    icon: '🏆',
    description: 'Awarded when 3+ clients rate your results 5 stars in their 90-day check-ins.',
    earnedCopy: 'Your clients are seeing real results. Keep it up.',
    progressCopy: 'Get 3 clients to rate your results 5 stars in their check-ins.',
  },
  {
    type: 'top_rated',
    name: 'Top Rated',
    icon: '⭐',
    description: 'Awarded when your aggregate client satisfaction score is 4.8+ across 5+ check-ins.',
    earnedCopy: 'You\'re in the top tier. Clients consistently rate you exceptional.',
    progressCopy: 'Reach a 4.8+ aggregate rating across at least 5 client check-ins.',
  },
  {
    type: 'verified',
    name: 'Verified Trainer',
    icon: '✅',
    description: 'Awarded when you upload a valid certification document that our team has reviewed.',
    earnedCopy: 'Your credentials have been verified. This badge builds trust.',
    progressCopy: 'Upload your certification in the Profile section for review.',
  },
]

export default async function BadgesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/trainer/badges')

  const { data: earnedBadges } = await supabase
    .from('badges')
    .select('badge_type, earned_at, is_active')
    .eq('trainer_id', user.id)
    .eq('is_active', true)

  const earnedMap = new Map((earnedBadges || []).map((b) => [b.badge_type, b]))

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#03243F]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Badges
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Badges are earned automatically based on real client behavior — you can&apos;t buy or request them.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {BADGE_DEFS.map((def) => {
          const earned = earnedMap.get(def.type)
          return (
            <div
              key={def.type}
              className={`bg-white rounded-xl border shadow-sm p-5 ${earned ? 'border-[#18A96B]/30' : 'border-slate-100'}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${earned ? 'bg-[#18A96B]/10' : 'bg-slate-100'}`}>
                  {def.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#03243F] text-sm">{def.name}</h3>
                    {earned ? (
                      <CheckCircle className="w-4 h-4 text-[#18A96B] flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    )}
                  </div>
                  {earned && (
                    <p className="text-[11px] text-[#18A96B] font-medium mt-0.5">
                      Earned {new Date(earned.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{def.description}</p>
              <div className={`rounded-lg px-3 py-2.5 text-xs ${earned ? 'bg-[#18A96B]/5 text-[#18A96B] font-medium' : 'bg-slate-50 text-slate-500'}`}>
                {earned ? def.earnedCopy : def.progressCopy}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
