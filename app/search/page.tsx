'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import TrainerCard from '@/components/trainer/TrainerCard'
import { Search, SlidersHorizontal, Lock, ClipboardList } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrainerRow {
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
  created_at?: string
  trainer_specialties?: { specialty: string }[]
  badge_count?: number
}

interface BadgeRow {
  trainer_id: string
  badge_type: string
  earned_at: string
}

type SortOption = 'badges' | 'price_asc' | 'newest'

// ── Sticky banner for non-auth visitors ───────────────────────────────────────

function NonAuthBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#03243F] border-t border-[#1652DB]/40 px-4 py-3 shadow-2xl">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Lock className="w-4 h-4 text-[#F4A636] flex-shrink-0" />
          <span>Sign up free to see your personal compatibility score with each trainer</span>
        </div>
        <Link
          href="/signup"
          className="flex-shrink-0 px-4 py-1.5 bg-[#18A96B] hover:bg-[#159a5f] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          Get Your Scores →
        </Link>
      </div>
    </div>
  )
}

// ── Banner for logged-in client who hasn't completed quiz ─────────────────────

function QuizIncompleteBanner() {
  return (
    <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 text-sm text-amber-800">
        <ClipboardList className="w-4 h-4 flex-shrink-0" />
        <span>Complete your match profile to unlock personalized compatibility scores for each trainer.</span>
      </div>
      <Link
        href="/onboarding/client"
        className="flex-shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
      >
        Complete Profile
      </Link>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const supabase = createClient()

  const [trainers, setTrainers] = useState<TrainerRow[]>([])
  const [badges, setBadges] = useState<Record<string, BadgeRow[]>>({})
  const [loading, setLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('badges')
  const [formatFilter, setFormatFilter] = useState('All')
  const [maxPrice, setMaxPrice] = useState(300)
  const [showFilters, setShowFilters] = useState(false)

  // ── Load data ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      setLoading(true)

      // Check auth status
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthed(!!user)

      if (user) {
        const { data: cp } = await supabase
          .from('client_profiles')
          .select('compatibility_complete')
          .eq('user_id', user.id)
          .maybeSingle()
        setQuizComplete(cp?.compatibility_complete ?? false)
      }

      // Fetch all published trainers
      const { data: trainerRows, error } = await supabase
        .from('trainer_profiles')
        .select(`
          id, full_name, slug, tagline, profile_photo_url,
          city, state, price_per_session, training_formats,
          plan_tier, is_verified, created_at,
          trainer_specialties ( specialty )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('search query error:', error)
        setLoading(false)
        return
      }

      const rows: TrainerRow[] = trainerRows ?? []
      setTrainers(rows)

      // Fetch all badges for these trainers
      if (rows.length > 0) {
        const trainerIds = rows.map(t => t.id)
        const { data: badgeRows } = await supabase
          .from('badges')
          .select('trainer_id, badge_type, earned_at')
          .in('trainer_id', trainerIds)

        const badgeMap: Record<string, BadgeRow[]> = {}
        for (const b of badgeRows ?? []) {
          if (!badgeMap[b.trainer_id]) badgeMap[b.trainer_id] = []
          badgeMap[b.trainer_id].push(b)
        }
        setBadges(badgeMap)
      }

      setLoading(false)
    }

    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sort + filter ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...trainers]

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(t =>
        t.full_name.toLowerCase().includes(q) ||
        t.tagline?.toLowerCase().includes(q) ||
        t.city?.toLowerCase().includes(q) ||
        (t.trainer_specialties ?? []).some(s => s.specialty.toLowerCase().includes(q))
      )
    }

    // Format filter
    if (formatFilter !== 'All') {
      list = list.filter(t =>
        (t.training_formats ?? []).some(f => f.toLowerCase().includes(formatFilter.toLowerCase()))
      )
    }

    // Price filter
    if (maxPrice < 300) {
      list = list.filter(t => !t.price_per_session || t.price_per_session <= maxPrice)
    }

    // Sort
    if (sort === 'badges') {
      list.sort((a, b) => (badges[b.id]?.length ?? 0) - (badges[a.id]?.length ?? 0))
    } else if (sort === 'price_asc') {
      list.sort((a, b) => (a.price_per_session ?? 9999) - (b.price_per_session ?? 9999))
    } else if (sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    }

    return list
  }, [trainers, badges, query, sort, formatFilter, maxPrice])

  // ── Loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#18A96B] border-t-transparent animate-spin" />
        <p className="text-slate-500 text-sm">Loading trainers…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ── Hero / search bar ── */}
      <div className="bg-[#03243F] pt-10 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            Find a Trainer in College Station
          </h1>
          <p className="text-slate-400 text-sm mb-5">
            {isAuthed && quizComplete
              ? 'Showing all trainers — go to Your Matches for your personalized compatibility rankings'
              : 'Browse trainers — sign up to see your personal compatibility score with each one'}
          </p>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, specialty, or style…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quiz incomplete banner (logged-in only) */}
        {isAuthed && !quizComplete && <QuizIncompleteBanner />}

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-sm text-slate-500">
            {filtered.length} trainer{filtered.length === 1 ? '' : 's'}
          </p>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
            >
              <option value="badges">Most Badges</option>
              <option value="price_asc">Lowest Price</option>
              <option value="newest">Newest</option>
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-[#03243F] text-white border-[#03243F]'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>

        {/* ── Expandable filters ── */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex flex-wrap gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Format</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'In-Person', 'Virtual', 'Outdoor'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFormatFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      formatFilter === f
                        ? 'bg-[#03243F] text-white border-[#03243F]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Max Price — {maxPrice === 300 ? 'Any' : `$${maxPrice}/session`}
              </label>
              <input
                type="range"
                min={30}
                max={300}
                step={10}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-48 accent-[#18A96B]"
              />
            </div>
          </div>
        )}

        {/* ── "Go to Your Matches" prompt for logged-in+quiz-complete users ── */}
        {isAuthed && quizComplete && (
          <div className="mb-5 bg-[#18A96B]/8 border border-[#18A96B]/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-[#03243F]">
              🎯 Your personalized match scores are ready.
            </p>
            <Link
              href="/client/matches"
              className="flex-shrink-0 px-4 py-1.5 bg-[#18A96B] hover:bg-[#159a5f] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              See Your Matches →
            </Link>
          </div>
        )}

        {/* ── Trainer grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm">No trainers match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(trainer => (
              <TrainerCard
                key={trainer.id}
                trainer={trainer}
                badges={badges[trainer.id] ?? []}
                showMatchScore={false}
                showWhyMatch={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom banner for non-auth visitors */}
      {!isAuthed && <NonAuthBanner />}
    </div>
  )
}
