import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import TrainerCard from '@/components/trainer/TrainerCard'
import RequestSessionModal from './RequestSessionModal'
import SaveTrainerButton from './SaveTrainerButton'
import { CheckCircle, Lock, MapPin, Zap, Award, Star, TrendingUp } from 'lucide-react'

// ── Badge config ───────────────────────────────────────────────────────────────

const BADGE_CONFIG: Record<string, { label: string; color: string }> = {
  responsive:    { label: 'Responsive',    color: 'bg-green-100 text-green-700' },
  consistent:    { label: 'Consistent',    color: 'bg-blue-100 text-blue-700' },
  results_driven:{ label: 'Results-Driven',color: 'bg-amber-100 text-amber-700' },
  top_rated:     { label: 'Top Rated',     color: 'bg-purple-100 text-purple-700' },
  verified:      { label: 'Verified',      color: 'bg-blue-50 text-[#1652DB]' },
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select('full_name, bio, city, state, trainer_specialties(specialty)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!trainer) return { title: 'Trainer Not Found | MyTrustedTrainer' }

  const specialties = (trainer.trainer_specialties as { specialty: string }[] ?? [])
    .map(s => s.specialty).join(', ')
  return {
    title: `${trainer.full_name} — Personal Trainer in ${trainer.city}, ${trainer.state} | MyTrustedTrainer`,
    description: trainer.bio
      ?? `${trainer.full_name} is a personal trainer in ${trainer.city}, TX specializing in ${specialties}.`,
    openGraph: {
      title: `${trainer.full_name} | MyTrustedTrainer`,
      description: trainer.bio ?? '',
    },
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 9.0) return '#18A96B'
  if (score >= 7.0) return '#F4A636'
  return '#94a3b8'
}

function RatingBar({ value, label, locked = false }: { value: number | null; label: string; locked?: boolean }) {
  if (locked || value === null) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-600 font-medium">{label}</span>
          <Lock className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div className="h-2 rounded-full bg-slate-100" />
        <p className="text-xs text-slate-400">Unlocks after 3+ check-ins</p>
      </div>
    )
  }
  const pct = Math.round((value / 5) * 100)
  const color = pct >= 85 ? '#18A96B' : pct >= 65 ? '#F4A636' : '#94a3b8'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="font-semibold" style={{ color }}>{value.toFixed(1)}/5</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

const COACHING_LABELS: Record<string, string> = {
  drill_sergeant:       'Drill Sergeant — high-intensity, direct accountability coaching.',
  supportive_coach:     'Supportive Coach — encouragement-first, positive reinforcement.',
  accountability_partner: 'Accountability Partner — steady consistency and routine focus.',
  educator:             'Educator — data-driven, knowledge-forward coaching approach.',
}
const COMM_LABELS: Record<string, string> = {
  within_hour:       'Responds within 1 hour.',
  within_four_hours: 'Responds within 4 hours.',
  same_day:          'Responds same day.',
  next_day:          'Responds next day.',
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function TrainerProfilePage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  // Fetch trainer with compatibility profile + specialties
  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select(`
      id, full_name, slug, bio, tagline, city, state,
      price_per_session, training_formats, plan_tier,
      is_verified, is_published, profile_photo_url, created_at,
      trainer_specialties ( specialty ),
      trainer_compatibility_profiles (
        coaching_style, communication_frequency, push_intensity,
        handles_missed_sessions, ideal_client_description
      )
    `)
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!trainer) notFound()

  // Fetch active badges
  const { data: badgeRows } = await supabase
    .from('badges')
    .select('badge_type, earned_at')
    .eq('trainer_id', trainer.id)
    .eq('is_active', true)
  const badges = badgeRows ?? []

  // Fetch check-in aggregates
  const { data: checkinRows } = await supabase
    .from('checkins')
    .select('energy_rating, session_rating, response_speed_rating, trainer_communication_rating, created_at')
    .eq('trainer_id', trainer.id)
  const checkins = checkinRows ?? []
  const n = checkins.length
  const avg = (key: keyof typeof checkins[0]) =>
    n >= 3 ? checkins.reduce((s, c) => s + ((c[key] as number) ?? 0), 0) / n : null

  const avgResponse = avg('response_speed_rating')
  const avgSession  = avg('session_rating')
  const avgComm     = avg('trainer_communication_rating')
  const avgEnergy   = avg('energy_rating')
  const ninety = new Date(); ninety.setDate(ninety.getDate() - 90)
  const has90Days   = checkins.filter(c => new Date(c.created_at) >= ninety).length >= 3

  // Specialties list
  const specialties = (trainer.trainer_specialties as { specialty: string }[] ?? []).map(s => s.specialty)

  // Similar trainers
  const { data: similarRaw } = await supabase
    .from('trainer_profiles')
    .select(`id, full_name, slug, tagline, profile_photo_url, city, state,
      price_per_session, training_formats, plan_tier, is_verified,
      trainer_specialties ( specialty )`)
    .eq('city', trainer.city)
    .eq('is_published', true)
    .neq('id', trainer.id)
    .limit(6)

  const similar = (similarRaw ?? [])
    .map((t: any) => ({
      ...t,
      overlap: (t.trainer_specialties ?? []).filter((s: any) => specialties.includes(s.specialty)).length,
    }))
    .sort((a: any, b: any) => b.overlap - a.overlap)
    .slice(0, 3)

  // Auth + match score
  const { data: { user } } = await supabase.auth.getUser()
  let matchScore: number | null = null
  let matchBreakdown: Record<string, { score: number; weight: number; weighted: number }> | null = null
  let isSaved = false

  if (user) {
    const { data: cp } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (cp) {
      const { data: ms } = await supabase
        .from('match_scores')
        .select('score, breakdown')
        .eq('client_id', cp.id)
        .eq('trainer_id', trainer.id)
        .maybeSingle()
      matchScore = ms?.score ?? null
      matchBreakdown = ms?.breakdown ?? null

      const { data: sv } = await supabase
        .from('saved_trainers')
        .select('id')
        .eq('client_id', cp.id)
        .eq('trainer_id', trainer.id)
        .maybeSingle()
      isSaved = !!sv
    }
  }

  const compat = (trainer.trainer_compatibility_profiles as any[])?.[0] ?? null

  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      {/* Unclaimed profile banner */}
      {!trainer.is_verified && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
          <p className="text-sm text-amber-800">
            Are you <strong>{trainer.full_name}</strong>?{' '}
            <Link
              href={`/signup?role=trainer&claim=${trainer.slug}`}
              className="underline font-semibold hover:text-amber-900"
            >
              Claim your profile
            </Link>{' '}
            to respond to leads and see your compatibility matches.
          </p>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="bg-[#03243F] pt-10 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-6 items-start">

            {/* Photo */}
            <div className="flex-shrink-0">
              {trainer.profile_photo_url ? (
                <Image
                  src={trainer.profile_photo_url}
                  alt={trainer.full_name}
                  width={160}
                  height={160}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white/20"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-700 flex items-center justify-center text-4xl font-bold text-white/40 border-4 border-white/10">
                  {trainer.full_name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1
                      className="text-3xl font-bold text-white leading-tight"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {trainer.full_name}
                    </h1>
                    {trainer.is_verified && (
                      <CheckCircle className="w-6 h-6 text-[#18A96B] flex-shrink-0" />
                    )}
                  </div>
                  {trainer.tagline && (
                    <p className="mt-1 text-[#18A96B] text-lg font-medium">{trainer.tagline}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    {trainer.city && (
                      <span className="text-slate-400 text-sm flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {trainer.city}, {trainer.state}
                      </span>
                    )}
                    {trainer.price_per_session && (
                      <span className="text-[#F4A636] font-semibold text-sm">
                        ${trainer.price_per_session}/session
                      </span>
                    )}
                  </div>
                </div>

                {/* Match score circle */}
                {matchScore !== null && (
                  <div className="flex flex-col items-center">
                    <div
                      className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: scoreColor(matchScore) }}
                    >
                      <span className="text-2xl font-bold leading-none">{matchScore.toFixed(1)}</span>
                      <span className="text-[10px] font-medium opacity-90 mt-0.5">/ 10</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1.5 font-medium text-center leading-tight">
                      Your Match<br />Score
                    </span>
                  </div>
                )}
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {badges.map((b: any) => {
                    const cfg = BADGE_CONFIG[b.badge_type]
                    if (!cfg) return null
                    return (
                      <span key={b.badge_type} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    )
                  })}
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-5">
                <RequestSessionModal trainerId={trainer.id} trainerName={trainer.full_name} />
                {user && (
                  <SaveTrainerButton trainerId={trainer.id} initialSaved={isSaved} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Behavioral Score Strip */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2
            className="text-lg font-bold text-[#03243F] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Verified Behavioral Scores
          </h2>
          {n < 3 ? (
            <p className="text-sm text-slate-500">
              Scores unlock after 3 completed client check-ins.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <RatingBar value={avgResponse} label="Avg Response Speed" />
              <RatingBar value={avgSession}  label="Session Quality" />
              <RatingBar value={avgComm}     label="Communication" />
              <RatingBar
                value={has90Days ? avgEnergy : null}
                label="90-Day Client Energy"
                locked={!has90Days}
              />
            </div>
          )}
          {n >= 3 && (
            <p className="text-xs text-slate-400 mt-4">Based on {n} client check-in{n === 1 ? '' : 's'}</p>
          )}
        </section>

        {/* About */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2
            className="text-lg font-bold text-[#03243F] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            About {trainer.full_name}
          </h2>
          {trainer.bio && (
            <p className="text-slate-600 text-sm leading-relaxed">{trainer.bio}</p>
          )}
          {compat?.ideal_client_description && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-[#03243F] mb-2">Who I Work Best With</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{compat.ideal_client_description}</p>
            </div>
          )}
          {compat?.coaching_style && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-[#03243F] mb-2">Coaching Philosophy</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {COACHING_LABELS[compat.coaching_style] ?? compat.coaching_style}
                {compat.communication_frequency && ` ${COMM_LABELS[compat.communication_frequency] ?? ''}`}
              </p>
            </div>
          )}
        </section>

        {/* Specialties */}
        {(specialties.length > 0 || (trainer.training_formats as string[] ?? []).length > 0) && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2
              className="text-lg font-bold text-[#03243F] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Specialties & Training Formats
            </h2>
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {specialties.map((s: string) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-700 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            {(trainer.training_formats as string[] ?? []).length > 0 && (
              <>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Formats Offered</p>
                <div className="flex flex-wrap gap-2">
                  {(trainer.training_formats as string[]).map((f: string) => (
                    <span
                      key={f}
                      className="px-3 py-1.5 rounded-full bg-[#18A96B]/10 border border-[#18A96B]/20 text-sm text-[#18A96B] font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Why This Match */}
        {matchBreakdown && matchScore !== null && (
          <section
            className="bg-white rounded-2xl border border-slate-200 p-6 border-t-[3px]"
            style={{ borderTopColor: scoreColor(matchScore) }}
          >
            <h2
              className="text-lg font-bold text-[#03243F] mb-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Why You Match {matchScore.toFixed(1)}/10
            </h2>
            <p className="text-sm text-slate-500 mb-5">Your personalized compatibility breakdown with {trainer.full_name}</p>
            <div className="space-y-4">
              {Object.entries(matchBreakdown).map(([key, dim]) => {
                const dimLabels: Record<string, string> = {
                  intensity:     'Coaching Energy',
                  accountability:'Accountability Style',
                  communication: 'Communication',
                  schedule:      'Schedule Fit',
                  goal_format:   'Goal & Format',
                  personality:   'Personality Match',
                }
                const pct = Math.round((dim.score ?? 0) * 100)
                const color = pct >= 85 ? '#18A96B' : pct >= 65 ? '#F4A636' : '#94a3b8'
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{dimLabels[key] ?? key}</span>
                      <span className="font-semibold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Similar Trainers */}
        {similar.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold text-[#03243F] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Similar Trainers in {trainer.city}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similar.map((t: any) => (
                <TrainerCard
                  key={t.id}
                  trainer={t}
                  badges={[]}
                  showMatchScore={false}
                  showWhyMatch={false}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Non-auth sticky bar */}
      {!user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#03243F] border-t border-[#1652DB]/40 px-4 py-3 shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <span className="text-sm text-slate-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F4A636] flex-shrink-0" />
              Sign up free to see your compatibility score with {trainer.full_name}
            </span>
            <Link
              href={`/signup?ref=trainer&slug=${trainer.slug}`}
              className="flex-shrink-0 px-4 py-1.5 bg-[#18A96B] hover:bg-[#159a5f] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Get My Score →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
