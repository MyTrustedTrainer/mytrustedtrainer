'use client'
import { useState, useEffect, useCallback } from 'react'
import SiteHeader from '@/components/SiteHeader'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SearchPage() {
  const supabase = createClient()
  const [trainers, setTrainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('match')
  const [maxPrice, setMaxPrice] = useState(150)
  const [format, setFormat] = useState('all')

  const fetchTrainers = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('trainer_profiles')
      .select('id, full_name, slug, tagline, plan_tier, is_verified, profile_photo_url, price_per_session, training_formats, trainer_specialties(specialty)')
      .eq('is_published', true)

    if (query) {
      q = q.or('full_name.ilike.%' + query + '%,tagline.ilike.%' + query + '%,bio.ilike.%' + query + '%')
    }

    const { data, error } = await q.limit(50)
    if (error) { console.error(error); setLoading(false); return }

    let sorted = (data || []).filter((t: any) => {
      if (maxPrice >= 150) return true
      const price = t.price_per_session || 0
      return price === 0 || price <= maxPrice
    })

    if (sortBy === 'price') {
      sorted.sort((a: any, b: any) => (a.price_per_session || 999) - (b.price_per_session || 999))
    } else if (sortBy === 'name') {
      sorted.sort((a: any, b: any) => a.full_name.localeCompare(b.full_name))
    }
    // default 'match' keeps DB order (most recently published first)

    setTrainers(sorted)
    setLoading(false)
  }, [query, sortBy, maxPrice])

  useEffect(() => {
    const timer = setTimeout(fetchTrainers, 300)
    return () => clearTimeout(timer)
  }, [fetchTrainers])

  const cardColors = ['#03243F','#18A96B','#F4A636','#1877F2','#6B21A8','#D32323']

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name, specialty, or goal..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B] bg-white">
            <option value="match">Sort: Best Match</option>
            <option value="price">Sort: Lowest Price</option>
            <option value="name">Sort: A–Z</option>
          </select>
        </div>

        <div className="flex gap-8">
          <div className="w-56 flex-shrink-0">
            <h3 className="font-semibold text-[#03243F] mb-4">Filters</h3>
            <div className="mb-5">
              <label className="text-sm text-gray-600 block mb-2">
                Max Price: {maxPrice >= 150 ? 'Any' : '$' + maxPrice + '/session'}
              </label>
              <input type="range" min="30" max="150" step="5" value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#18A96B]" />
            </div>
            <div className="mb-5">
              <label className="text-sm text-gray-600 block mb-2">Format</label>
              <div className="flex flex-col gap-2">
                {['all', 'In-Person', 'Online', 'Hybrid'].map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${format === f ? 'bg-[#03243F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {f === 'all' ? 'All Formats' : f}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => { setQuery(''); setMaxPrice(150); setFormat('all'); setSortBy('match') }}
              className="text-sm text-[#18A96B] hover:underline">Clear all filters</button>
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-4">
              {loading ? 'Loading trainers...' : trainers.length + ' trainer' + (trainers.length !== 1 ? 's' : '') + ' found in College Station'}
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
                <button onClick={() => { setQuery(''); setMaxPrice(150); }} className="mt-4 text-[#18A96B] hover:underline text-sm">Clear filters</button>
              </div>
            ) : (
              <div className="space-y-4">
                {trainers.map((trainer: any, i: number) => {
                  const initials = trainer.full_name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()
                  const color = cardColors[i % cardColors.length]
                  const formats: string[] = Array.isArray(trainer.training_formats) ? trainer.training_formats : []
                  return (
                    <div key={trainer.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-5 hover:shadow-md transition-shadow">
                      <div className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden">
                        {trainer.profile_photo_url ? (
                          <img src={trainer.profile_photo_url} alt={trainer.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold" style={{background: color}}>
                            {initials}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-[#03243F] text-lg">{trainer.full_name}</h3>
                          {trainer.is_verified && <span className="text-xs bg-[#E8F8F2] text-[#18A96B] px-2 py-0.5 rounded-full font-medium">✓ Verified</span>}
                          {trainer.plan_tier === 'pro' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pro</span>}
                        </div>
                        {trainer.tagline && <p className="text-gray-500 text-sm mb-2 truncate">{trainer.tagline}</p>}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formats.slice(0,3).map((f: string) => (
                            <span key={f} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{f}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(trainer.trainer_specialties || []).slice(0,4).map((s: any) => (
                            <span key={s.specialty} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{s.specialty}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {trainer.price_per_session > 0 && (
                          <div className="mb-3">
                            <span className="text-xl font-bold text-[#03243F]">${trainer.price_per_session}</span>
                            <span className="text-xs text-gray-400">/session</span>
                          </div>
                        )}
                        <Link href={'/trainers/' + (trainer.slug || trainer.id)}
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
