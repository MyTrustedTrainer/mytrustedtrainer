'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, ChevronDown, ChevronUp, Award, CheckCircle, Zap, Star, TrendingUp } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DimensionScore {
  score: number
  weight: number
  weighted: number
}

interface MatchBreakdown {
  communication: DimensionScore
  intensity: DimensionScore
  accountability: DimensionScore
  schedule: DimensionScore
  goal_format: DimensionScore
  personality: DimensionScore
}

interface Badge {
  badge_type: string
  earned_at?: string
}

interface TrainerProfile {
  id: string
  full_name: string
  slug: string
  tagline?: string
  profile_photo_url?: string
  city?: string
  state?: string
  price_per_session?: number
  training_formats?: string[]
  plan_tier?: string
  is_verified?: boolean
  trainer_specialties?: { specialty: string }[]
}

interface TrainerCardProps {
  trainer: TrainerProfile
  matchScore?: number
  breakdown?: MatchBreakdown
  badges?: Badge[]
  showMatchScore?: boolean
  showWhyMatch?: boolean
  className?: string
}

// ── Badge config ──────────────────────────────────────────────────────────────

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; label: string; description: string; color: string }> = {
  responsive: {
    icon: <Zap className="w-3.5 h-3.5" />,
    label: 'Responsive',
    description: 'Replies to leads within 2 hours on average',
    color: 'bg-green-100 text-green-700',
  },
  consistent: {
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    label: 'Consistent',
    description: 'Maintains 90%+ session consistency over 90 days',
    color: 'bg-blue-100 text-blue-700',
  },
  results_driven: {
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    label: 'Results-Driven',
    description: 'Clients report measurable progress in check-ins',
    color: 'bg-amber-100 text-amber-700',
  },
  top_rated: {
    icon: <Star className="w-3.5 h-3.5" />,
    label: 'Top Rated',
    description: 'Consistently high behavioral scores across all metrics',
    color: 'bg-purple-100 text-purple-700',
  },
  verified: {
    icon: <Award className="w-3.5 h-3.5" />,
    label: 'Verified',
    description: 'Identity and credentials verified by MyTrustedTrainer',
    color: 'bg-blue-50 text-[#1652DB]',
  },
}

// ── Dimension config ──────────────────────────────────────────────────────────

const DIMENSION_CONFIG: Array<{
  key: keyof MatchBreakdown
  label: string
  description: string
}> = [
  { key: 'intensity', label: 'Coaching Energy', description: 'Your preferred intensity matches their coaching style' },
  { key: 'accountability', label: 'Accountability Style', description: 'How they handle missed sessions fits your needs' },
  { key: 'communication', label: 'Communication', description: 'Their check-in frequency matches your preference' },
  { key: 'schedule', label: 'Schedule Fit', description: 'Their structure style suits your consistency level' },
  { key: 'goal_format', label: 'Goal & Format', description: 'They specialize in your goal and offer your preferred training format' },
  { key: 'personality', label: 'Personality Match', description: 'Your description of an ideal trainer aligns with how they describe themselves' },
]

// ── Score circle helpers ──────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 9.0) return '#18A96B'
  if (score >= 7.0) return '#F4A636'
  return '#94a3b8'
}

function scoreLabel(score: number): string {
  if (score >= 9.0) return 'Excellent'
  if (score >= 7.0) return 'Great'
  if (score >= 5.0) return 'Good'
  return 'Fair'
}

// ── Bar chart for dimension breakdown ────────────────────────────────────────

function DimensionBar({ score, label, description }: { score: number; label: string; description: string }) {
  const pct = Math.round(score * 100)
  const barColor = score >= 0.85 ? '#18A96B' : score >= 0.65 ? '#F4A636' : '#94a3b8'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: pct + '%', backgroundColor: barColor }} />
      </div>
      <p className="text-xs text-slate-500 leading-tight">{description}</p>
    </div>
  )
}

// ── Badge tooltip ─────────────────────────────────────────────────────────────

function BadgePill({ badgeType }: { badgeType: string }) {
  const [show, setShow] = useState(false)
  const config = BADGE_CONFIG[badgeType]
  if (!config) return null
  return (
    <div className="relative inline-flex">
      <button
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color} cursor-default`}
        onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)} onBlur={() => setShow(false)}
        aria-label={config.label}
      >
        {config.icon}<span>{config.label}</span>
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 w-44 rounded-lg bg-[#03243F] text-white text-xs px-3 py-2 shadow-lg leading-snug text-center pointer-events-none">
          {config.description}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#03243F]" />
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TrainerCard({
  trainer, matchScore, breakdown, badges = [], showMatchScore = false, showWhyMatch = true, className = '',
}: TrainerCardProps) {
  const [expanded, setExpanded] = useState(false)
  const hasScore = showMatchScore && typeof matchScore === 'number'
  const specialties = trainer.trainer_specialties?.map(s => s.specialty) ?? []
  const formats = trainer.training_formats ?? []

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 border-t-[3px] overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
      style={{ borderTopColor: hasScore ? scoreColor(matchScore!) : '#1652DB' }}
    >
      <div className="p-5">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {trainer.profile_photo_url ? (
              <Image src={trainer.profile_photo_url} alt={trainer.full_name} width={64} height={64}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl font-semibold border-2 border-slate-100">
                {trainer.full_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-[#03243F] text-base leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {trainer.full_name}
                  </h3>
                  {trainer.is_verified && <CheckCircle className="w-4 h-4 text-[#1652DB] flex-shrink-0" />}
                </div>
                {trainer.tagline && <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{trainer.tagline}</p>}
                {trainer.city && <p className="text-xs text-slate-400 mt-0.5">{trainer.city}, {trainer.state}</p>}
              </div>
              {hasScore ? (
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: scoreColor(matchScore!) }}>
                    <span className="text-lg font-bold leading-none">{matchScore!.toFixed(1)}</span>
                    <span className="text-[9px] font-medium opacity-90 leading-none mt-0.5">/ 10</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-medium">{scoreLabel(matchScore!)}</span>
                </div>
              ) : (
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-medium text-center leading-tight">Your<br/>Score</span>
                </div>
              )}
            </div>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {badges.map(b => <BadgePill key={b.badge_type} badgeType={b.badge_type} />)}
              </div>
            )}
          </div>
        </div>

        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {specialties.slice(0, 5).map(s => (
              <span key={s} className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">{s}</span>
            ))}
            {specialties.length > 5 && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-400">+{specialties.length - 5} more</span>
            )}
          </div>
        )}

        {showWhyMatch && hasScore && breakdown && (
          <button onClick={() => setExpanded(v => !v)}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-[#1652DB] hover:text-[#1245b8] transition-colors">
            Why this match?
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}

        {expanded && breakdown && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            {DIMENSION_CONFIG.map(({ key, label, description }) => {
              const dim = breakdown[key]
              if (!dim) return null
              return <DimensionBar key={key} score={dim.score} label={label} description={description} />
            })}
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-500 min-w-0">
          {trainer.price_per_session && (
            <span className="font-semibold text-[#03243F]">${trainer.price_per_session}<span className="font-normal text-slate-400">/session</span></span>
          )}
          {formats.length > 0 && <span className="truncate">{formats.slice(0, 2).join(' · ')}</span>}
        </div>
        <Link href={`/trainers/${trainer.slug}`}
          className="flex-shrink-0 px-4 py-1.5 rounded-lg bg-[#18A96B] hover:bg-[#159a5f] text-white text-xs font-semibold transition-colors">
          View Profile
        </Link>
      </div>
    </div>
  )
  }
