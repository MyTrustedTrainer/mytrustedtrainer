'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import TrainerCard from '@/components/trainer/TrainerCard'
import { SlidersHorizontal, RefreshCw, ClipboardList, AlertCircle } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrainerProfile {
  id: string
  full_name: string
  slug: stringh
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

interface MatchRow {
  trainer_id: string
  score: number
  breakdown: Record<string, { score: number; weight: number; weighted: number }>
  calculated_at: string
  trainer_profiles: TrainerProfile
  badges?: { badge_type: string; earned_at: string }[]
}

interface Filters {
  specialty: string
  format: string
  minScore: number
  maxPrice: number
}

// ── Filter sidebar ────────────────────────────────────────────────────────────

const ALL_SPECIALTIES = [
  'Weight Loss', 'Muscle Building', 'HIIT', 'Strength', 'Powerlifting',
  'Athletic Performance', 'Running', 'Yoga', 'Pilates', 'Mobility',
  'Nutrition', 'Senior Fitness', 'Pre/Post Natal', 'General Fitness',
]

function FilterSidebar({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: {
  filters: Filters
  onChange: (f: Partial<Filters>) => void
  totalCount: number
  filteredCount: number
}) {
  return (
    <aside className="w-56 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#03243F] flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </h2>
          <span className="text-xs text-slate-400">{filteredCount} of {totalCount}</span>
        </div>

        {/* Min match score */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Min Match Score
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={9}
              step={1}
              value={filters.minScore}
              onChange={e => onChange({ minScore: Number(e.target.value) })}
              className="flex-1 accent-[#18A96B]"
            />
            <span className="text-sm font-semibold text-[#03243F] w-6 text-right">{filters.minScore}+</span>
          </div>
        </div>

        {/* Max price */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Max Price / Session
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={30}
              max={300}
              step={10}
              value={filters.maxPrice}
              onChange={e => onChange({ maxPrice: Number(e.target.value) })}
              className="flex-1 accent-[#18A96B]"
            />
            <span className="text-sm font-semibold text-[#03243F] w-12 text-right">
              {filters.maxPrice === 300 ? 'Any' : `$${filters.maxPrice}`}
            </span>
          </div>
        </div>

        {/* Format */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Format
          </label>
          {['Any', 'In-Person', 'Virtual', 'Outdoor'].map(f => (
            <label key={f} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="radio"
                name="format"
                value={f}
                checked={filters.format === f}
                onChange={() => onChange({ format: f })}
                className="accent-[#18A96B]"
              />
              <span className="text-sm text-slate-600">{f}</span>
            </label>
          ))}
        </div>

        {/* Specialty */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Specialty
          </label>
          <select
            value={filters.specialty}
            onChange={e => onChange({ specialty: e.target.value })}
            className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
          >
            <option value="">Any specialty</option>
            {ALL_SPECIALTIES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Reset */}
        {(filters.specialty || filters.format !== 'Any' || filters.minScore > 0 || filters.maxPrice < 300) && (
          <button
            onClick={() => onChange({ specialty: '', format: 'Any', minScore: 0, maxPrice: 300 })}
            className="mt-4 w-full text-xs text-slate-400 hover:text-[#03243F] transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ClientMatchesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [clientCity, setClientCity] = useState<string | null>(null)
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [quizComplete, setQuizComplete] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<Filters>({
    specialty: '',
    format: 'Any',
    minScore: 0,
    maxPrice: 300,
  })

  // ── Auth check ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login?redirect=/client/matches')
        return
      }
      setUserId(user.id)
      await loadMatches(user.id)
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load matches ────────────────────────────────────────────────────────────

  const loadMatches = async (uid: string) => {
    setLoading(true)
    setError(null)

    try {
      // Get client profile
      const { data: cp } = await supabase
        .from('client_profiles')
        .select('id, city, state, compatibility_complete')
        .eq('user_id', uid)
        .single()

      if (!cp) {
        setError('No client profile found. Please complete your profile first.')
        setLoading(false)
        return
      }

      setClientCity(cp.city)
      setQuizComplete(cp.compatibility_complete ?? false)

      // Fetch existing match scores for this client
      const { data: scoreRows, error: scoreErr } = await supabase
        .from('match_scores')
        .select(`
          trainer_id,
          score,
          breakdown,
          calculated_at,
          trainer_profiles (
            id, full_name, slug, tagline, profile_photo_url,
            city, state, price_per_session, training_formats,
            plan_tier, is_verified,
            trainer_specialties ( specialty )
          )
        `)
        .eq('client_id', cp.id)
        .order('score', { ascending: false })

      if (scoreErr) throw scoreErr

      if (!scoreRows || scoreRows.length === 0) {
        // No scores yet — trigger calculation if quiz is complete
        if (cp.compatibility_complete) {
          await triggerCalculation(cp.id)
          // Reload after calculation
          await loadMatches(uid)
          return
        } else {
          setMatches([])
          setLoading(false)
          return
        }
      }

      // Fetch badges for each trainer
      const trainerIds = scoreRows.map(r => r.trainer_id)
      const { data: badgeRows } = await supabase
        .from('badges')
        .select('trainer_id, badge_type, earned_at')
        .in('trainer_id', trainerIds)

      const badgeMap: Record<string, { badge_type: string; earned_at: string }[]> = {}
      for (const b of badgeRows ?? []) {
        if (!badgeMap[b.trainer_id]) badgeMap[b.trainer_id] = []
        badgeMap[b.trainer_id].push({ badge_type: b.badge_type, earned_at: b.earned_at })
      }

      const enriched: MatchRow[] = (scoreRows as unknown as MatchRow[])
        .filter(r => r.trainer_profiles)
        .map(r => ({
          ...r,
          badges: badgeMap[r.trainer_id] ?? [],
        }))

      setMatches(enriched)
    } catch (err: unknown) {
      console.error('loadMatches error:', err)
      setError('Failed to load your matches. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Trigger Edge Function ───────────────────────────────────────────────────

  const triggerCalculation = async (clientId: string) => {
    setCalculating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/calculate-matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ client_id: clientId }),
      })
    } catch (err) {
      console.error('triggerCalculation error:', err)
    } finally {
      setCalculating(false)
    }
  }

  const handleRecalculate = async () => {
    if (!userId) return
    const { data: cp } = await supabase.from('client_profiles').select('id').eq('user_id', userId).single()
    if (!cp) return
    await triggerCalculation(cp.id)
    await loadMatches(userId)
  }

  // ── Client-side filtering ───────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return matches.filter(m => {
      const tp = m.trainer_profiles
      if (!tp) return false

      if (m.score < filters.minScore) return false

      if (filters.maxPrice < 300 && tp.price_per_session && tp.price_per_session > filters.maxPrice) return false

      if (filters.format !== 'Any') {
        const fmts = tp.training_formats ?? []
        if (!fmts.some(f => f.toLowerCase().includes(filters.format.toLowerCase()))) return false
      }

      if (filters.specialty) {
        const specs = (tp.trainer_specialties ?? []).map(s => s.specialty.toLowerCase())
        if (!specs.some(s => s.includes(filters.specialty.toLowerCase()))) return false
      }

      return true
    })
  }, [matches, filters])

  // ── Render states ───────────────────────────────────────────────────────────

  if (loading || calculating) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#18A96B] border-t-transparent animate-spin" />
        <p className="text-slate-500 text-sm">
          {calculating ? 'Calculating your personalized matches…' : 'Loading your matches…'}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-slate-600 text-center">{error}</p>
        <Link href="/" className="text-[#18A96B] text-sm font-medium">Back to home</Link>
      </div>
    )
  }

  // No quiz completed
  if (!quizComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#03243F] flex items-center justify-center">
          <ClipboardList className="w-8 h-8 text-[#18A96B]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#03243F]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Complete Your Match Profile
          </h1>
          <p className="mt-2 text-slate-500 max-w-sm mx-auto">
            Answer 20 quick questions so we can find trainers who are genuinely compatible with you.
          </p>
        </div>
        <Link
          href="/onboarding/client"
          className="px-6 py-3 bg-[#18A96B] hover:bg-[#159a5f] text-white font-semibold rounded-xl transition-colors"
        >
          Start My Match Profile →
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-[#03243F] pt-10 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your Matches
          </h1>
          <p className="mt-1.5 text-slate-300 text-sm">
            {matches.length > 0
              ? `${matches.length} trainer${matches.length === 1 ? '' : 's'} ranked by compatibility with you${clientCity ? ` in ${clientCity}` : ''}`
              : 'No matches yet in your area'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {matches.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500">No matches found yet in your area. Check back soon as more trainers join.</p>
            <button
              onClick={handleRecalculate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#18A96B] hover:bg-[#159a5f] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Matches
            </button>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar */}
            <FilterSidebar
              filters={filters}
              onChange={patch => setFilters(prev => ({ ...prev, ...patch }))}
              totalCount={matches.length}
              filteredCount={filtered.length}
            />

            {/* Match grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                  {filtered.length === 0
                    ? 'No matches for current filters'
                    : `Showing ${filtered.length} trainer${filtered.length === 1 ? '' : 's'}`}
                </p>
                <button
                  onClick={handleRecalculate}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#03243F] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Recalculate
                </button>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <SlidersHorizontal className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No trainers match these filters.</p>
                  <button
                    onClick={() => setFilters({ specialty: '', format: 'Any', minScore: 0, maxPrice: 300 })}
                    className="mt-3 text-sm text-[#18A96B] font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filtered.map((m) => (
                    <TrainerCard
                      key={m.trainer_id}
                      trainer={m.trainer_profiles}
                      matchScore={m.score}
                      breakdown={m.breakdown as unknown as Parameters<typeof TrainerCard>[0]['breakdown']}
                      badges={m.badges}
                      showMatchScore={true}
                      showWhyMatch={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
