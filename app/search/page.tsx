'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SearchPage() {
  const supabase = createClient()
  const [trainers, setTrainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [maxPrice, setMaxPrice] = useState(150)
  const [format, setFormat] = useState('all')

  const fetchTrainers = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('trainer_profiles')
      .select('id, full_name, slug, tagline, plan, is_verified, trainer_scores(overall_score, total_review_count, google_count, yelp_count, facebook_count), trainer_specialties(specialty), packages(price_cents, is_active)')
      .eq('is_active', true)

    if (query) {
      q = q.or('full_name.ilike.%' + query + '%,tagline.ilike.%' + query + '%,bio.ilike.%' + query + '%')
    }

    const { data, error } = await q.limit(50)
    if (error) { setLoading(false); return }

    // Sort client-side
    let sorted = (data || []).map((t: any) => {
      const minPrice = t.packages
        ? Math.min(...t.packages.filter((p: any) => p.is_active && p.price_cents).map((p: any) => p.price_cents)) / 100
        : 0
      return { ...t, minPrice: isFinite(minPrice) ? minPrice : 0 }
    }).filter((t: any) => maxPrice >= 150 || t.minPrice === 0 || t.minPrice <= maxPrice)

    if (sortBy === 'rating') {
      sorted.sort((a: any, b: any) => (b.trainer_scores?.overall_score || 0) - (a.trainer_scores?.overall_score || 0))
    } else if (sortBy === 'reviews') {
      sorted.sort((a: any, b: any) => (b.trainer_scores?.total_review_count || 0) - (a.trainer_scores?.total_review_count || 0))
    } else if (sortBy === 'price') {
      sorted.sort((a: any, b: any) => (a.minPrice || 999) - (b.minPrice || 999))
    }

    setTrainers(sorted)
    setLoading(false)
  }, [query, sortBy, maxPrice])

  useEffect(() => {
    const timer = setTimeout(fetchTrainers, 300)
    return () => clearTimeout(timer)
  }, [fetchTrainers])

  const cardColors = ['#03243F','#18A96B','#F4A636','#1877F2','#D32323','#6B21A8']

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-[#03243F] text-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-[#18A96B] text-white text-xs font-bold px-2 py-1 rounded">MTT</span>
            <span className="text-lg font-bold" style={{fontFamily:'Playfair Display'}}>MyTrustedTrainer</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-300 hover:text-white text-sm">Log In</Link>
            <Link href="/signup" className="bg-[#18A96B] text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-[#15906A]">Sign Up</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name, specialty, or goal (e.g. weight loss, HIIT)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B] bg-white">
            <option value="rating">Sort: Top Rated</option>
            <option value="reviews">Sort: Most Reviews</option>
            <option value="price">Sort: Lowest Price</option>
          </select>
        </div>

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <div className="w-56 flex-shrink-0">
            <h3 className="font-semibold text-[#03243F] mb-4">Filters</h3>
            <div className="mb-5">
              <label className="text-sm text-gray-600 block mb-2">Max Price: {maxPrice >= 150 ? 'Any' : '$' + maxPrice + '/session'}</label>
              <input type="range" min="30" max="150" step="5" value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#18A96B]" />
            </div>
            <div className="mb-5">
              <label className="text-sm text-gray-600 block mb-2">Format</label>
              <div className="flex flex-col gap-2">
                {(['all','In-Person','Online'] as const).map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${format === f ? 'bg-[#03243F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => { setQuery(''); setMaxPrice(150); setFormat('all'); setSortBy('rating') }}
              className="text-sm text-[#18A96B] hover:underline">Clear all filters</button>
          </div>

          {/* Results */}
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-4">
              {loading ? 'Loading...' : trainers.length + ' trainer' + (trainers.length !== 1 ? 's' : '') + ' found'}
            </p>
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
                ))}
              </div>
            ) : trainers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">No trainers found matching your search.</p>
                <button onClick={() => setQuery('')} className="mt-4 text-[#18A96B] hover:underline text-sm">Clear search</button>
              </div>
            ) : (
              <div className="space-y-4">
                {trainers.map((trainer: any, i: number) => {
                  const score = trainer.trainer_scores
                  const platforms: string[] = []
                  if (score?.google_count > 0) platforms.push('Google')
                  if (score?.yelp_count > 0) platforms.push('Yelp')
                  if (score?.facebook_count > 0) platforms.push('Facebook')
                  const initials = trainer.full_name.split(' ').map((n: string) => n[0]).join('')
                  const color = cardColors[i % cardColors.length]
                  return (
                    <div key={trainer.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-5 hover:shadow-md transition-shadow">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{background: color}}>
                        {initials}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-[#03243F] text-lg">{trainer.full_name}</h3>
                          {trainer.is_verified && <span className="text-xs bg-[#E8F8F2] text-[#18A96B] px-2 py-0.5 rounded-full">✓ Verified</span>}
                          {trainer.plan === 'elite' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Elite</span>}
                        </div>
                        {trainer.tagline && <p className="text-gray-500 text-sm mb-2 truncate">{trainer.tagline}</p>}
                        {score?.overall_score > 0 && (
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-[#F4A636]">{Number(score.overall_score).toFixed(1)} ★</span>
                            <span className="text-gray-400 text-sm">({score.total_review_count} reviews)</span>
                            <div className="flex gap-1">
                              {platforms.map(p => <span key={p} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{p}</span>)}
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {(trainer.trainer_specialties || []).slice(0,4).map((s: any) => (
                            <span key={s.specialty} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{s.specialty}</span>
                          ))}
                        </div>
                      </div>
                      {/* Price + CTA */}
                      <div className="text-right flex-shrink-0">
                        {trainer.minPrice > 0 && (
                          <div className="mb-3">
                            <span className="text-xl font-bold text-[#03243F]">${trainer.minPrice}</span>
                            <span className="text-xs text-gray-400">/session</span>
                          </div>
                        )}
                        <Link href={'/trainers/' + trainer.slug}
                          className="block bg-[#03243F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#04305a] transition-colors">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}