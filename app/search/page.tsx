'use client'
import { useState } from 'react'
import Link from 'next/link'

const ALL_TRAINERS = [
  { id: 1, name: 'Marcus Johnson', specialty: 'Strength & Conditioning', rating: 4.9, reviews: 87, price: 65, tags: ['Weight Loss', 'Athlete Training', 'Strength'], initials: 'MJ', color: 'from-[#03243F] to-[#18A96B]', cert: 'NASM', format: 'In-Person', distance: '0.8 mi', platforms: ['Google', 'Yelp'], scores: { results: 4.9, communication: 4.8, punctuality: 5.0, value: 4.7 } },
  { id: 2, name: 'Sarah Chen', specialty: 'Yoga & Mobility', rating: 5.0, reviews: 112, price: 55, tags: ['Flexibility', 'Stress Relief', 'Prenatal'], initials: 'SC', color: 'from-[#18A96B] to-[#0d6e46]', cert: 'RYT-500', format: 'Both', distance: '1.2 mi', platforms: ['Google', 'Facebook'], scores: { results: 5.0, communication: 5.0, punctuality: 4.9, value: 4.8 } },
  { id: 3, name: 'Derek Williams', specialty: 'HIIT & Fat Loss', rating: 4.8, reviews: 64, price: 60, tags: ['HIIT', 'Nutrition', 'Fat Loss'], initials: 'DW', color: 'from-[#F4A636] to-[#e08c1a]', cert: 'ACE', format: 'In-Person', distance: '2.1 mi', platforms: ['Google', 'Yelp', 'Facebook'], scores: { results: 4.9, communication: 4.7, punctuality: 4.8, value: 4.6 } },
  { id: 4, name: 'Priya Patel', specialty: 'Functional Fitness', rating: 4.7, reviews: 43, price: 50, tags: ['Functional', 'Seniors', 'Rehab'], initials: 'PP', color: 'from-[#7c3aed] to-[#5b21b6]', cert: 'ACSM', format: 'Online', distance: '3.0 mi', platforms: ['Google'], scores: { results: 4.7, communication: 4.8, punctuality: 4.6, value: 5.0 } },
  { id: 5, name: 'James Rodriguez', specialty: 'Powerlifting & Strength', rating: 4.9, reviews: 55, price: 75, tags: ['Powerlifting', 'Strength', 'Competition'], initials: 'JR', color: 'from-[#dc2626] to-[#991b1b]', cert: 'NSCA', format: 'In-Person', distance: '1.5 mi', platforms: ['Google', 'Yelp'], scores: { results: 5.0, communication: 4.8, punctuality: 4.9, value: 4.5 } },
  { id: 6, name: 'Aisha Thompson', specialty: 'Bootcamp & Group Fitness', rating: 4.8, reviews: 96, price: 45, tags: ['Bootcamp', 'Group', 'Cardio'], initials: 'AT', color: 'from-[#0369a1] to-[#075985]', cert: 'ACE', format: 'Both', distance: '0.5 mi', platforms: ['Google', 'Facebook'], scores: { results: 4.8, communication: 4.9, punctuality: 4.7, value: 5.0 } },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [maxPrice, setMaxPrice] = useState(150)
  const [format, setFormat] = useState('All')
  const [sortBy, setSortBy] = useState('rating')

  const filtered = ALL_TRAINERS
    .filter(t => {
      const matchQuery = query === '' || t.name.toLowerCase().includes(query.toLowerCase()) || t.specialty.toLowerCase().includes(query.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      const matchRating = t.rating >= minRating
      const matchPrice = t.price <= maxPrice
      const matchFormat = format === 'All' || t.format === format || t.format === 'Both'
      return matchQuery && matchRating && matchPrice && matchFormat
    })
    .sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : sortBy === 'reviews' ? b.reviews - a.reviews : a.price - b.price)

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-[#03243F] text-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-[#18A96B] text-xl font-bold font-[Playfair_Display,serif]">MyTrustedTrainer</Link>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-300 hover:text-white text-sm">Log In</Link>
          <Link href="/signup" className="bg-[#18A96B] hover:bg-[#13875A] text-white text-sm px-4 py-1.5 rounded-lg font-semibold">Sign Up</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name, specialty, or goal (e.g. weight loss, HIIT)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]">
            <option value="rating">Sort: Top Rated</option>
            <option value="reviews">Sort: Most Reviews</option>
            <option value="price">Sort: Lowest Price</option>
          </select>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <h3 className="font-bold text-[#03243F] mb-4">Filters</h3>
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Min Rating: {minRating > 0 ? minRating.toFixed(1) + '+ ★' : 'Any'}</label>
                <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="w-full accent-[#18A96B]" />
              </div>
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Max Price: ${maxPrice}/session</label>
                <input type="range" min="20" max="150" step="5" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-[#18A96B]" />
              </div>
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Format</label>
                {['All', 'In-Person', 'Online'].map(f => (
                  <button key={f} onClick={() => setFormat(f)} className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm mb-1 transition-all ${format === f ? 'bg-[#03243F] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{f}</button>
                ))}
              </div>
              <button onClick={() => { setQuery(''); setMinRating(0); setMaxPrice(150); setFormat('All') }} className="w-full text-sm text-[#18A96B] hover:underline text-center">Clear all filters</button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-4">{filtered.length} trainer{filtered.length !== 1 ? 's' : ''} found</div>
            <div className="space-y-4">
              {filtered.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className={`bg-gradient-to-br ${t.color} p-6 flex items-center justify-center sm:w-28 shrink-0`}>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl">{t.initials}</div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[#03243F] text-lg">{t.name}</h3>
                          <span className="text-xs bg-[#18A96B]/10 text-[#18A96B] px-2 py-0.5 rounded-full font-medium">{t.cert}</span>
                        </div>
                        <div className="text-gray-500 text-sm mb-2">{t.specialty} • {t.format} • {t.distance}</div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[#F4A636] font-bold">{t.rating} ★</span>
                          <span className="text-gray-400 text-sm">({t.reviews} reviews)</span>
                          <div className="flex gap-1">
                            {t.platforms.map(p => <span key={p} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{p}</span>)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {t.tags.map(tag => <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between gap-3">
                        <div className="text-right">
                          <div className="text-[#03243F] font-bold text-lg">${t.price}</div>
                          <div className="text-gray-400 text-xs">per session</div>
                        </div>
                        <Link href={`/trainers/${t.id}`} className="bg-[#18A96B] hover:bg-[#13875A] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all whitespace-nowrap">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-4">🔍</div>
                  <div className="text-lg font-medium text-gray-500">No trainers match your filters</div>
                  <div className="text-sm mt-2">Try adjusting your search or clearing filters</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}