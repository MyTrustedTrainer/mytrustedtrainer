import Link from 'next/link'

const TRAINER_DATA: Record<string, {
  name: string, specialty: string, bio: string, tagline: string, rating: number, reviews: number,
  price: number, initials: string, color: string, cert: string, format: string, location: string,
  platforms: { name: string, rating: number, count: number }[], scores: Record<string, number>,
  availability: string[], packages: { name: string, price: number, desc: string }[],
  reviewList: { author: string, platform: string, rating: number, text: string, date: string }[]
}> = {
  '1': {
    name: 'Marcus Johnson', specialty: 'Strength & Conditioning', tagline: 'Transform your body, transform your life.',
    bio: 'NASM-certified personal trainer with 8+ years helping College Station clients build strength, lose fat, and compete at their best. Specializes in evidence-based programming for sustainable results.',
    rating: 4.9, reviews: 87, price: 65, initials: 'MJ', color: 'from-[#03243F] to-[#18A96B]',
    cert: 'NASM CPT', format: 'In-Person', location: 'College Station, TX',
    platforms: [{ name: 'Google', rating: 4.9, count: 54 }, { name: 'Yelp', rating: 4.8, count: 33 }],
    scores: { Results: 4.9, Communication: 4.8, Punctuality: 5.0, Value: 4.7 },
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    packages: [
      { name: 'Single Session', price: 65, desc: 'One 60-minute training session.' },
      { name: '10-Pack', price: 550, desc: '10 sessions, save $100. Most popular.' },
      { name: 'Monthly Unlimited', price: 400, desc: 'Unlimited sessions, 3x/week max.' },
    ],
    reviewList: [
      { author: 'Jake T.', platform: 'Google', rating: 5, text: 'Marcus helped me lose 30 lbs in 4 months. Best investment I have ever made in my health.', date: 'March 2026' },
      { author: 'Emily R.', platform: 'Yelp', rating: 5, text: 'Incredibly knowledgeable and motivating. I look forward to every session.', date: 'February 2026' },
      { author: 'David M.', platform: 'Google', rating: 4, text: 'Great trainer, very professional. Would recommend to anyone serious about getting fit.', date: 'January 2026' },
    ],
  },
}

export default function TrainerProfilePage({ params }: { params: { id: string } }) {
  const t = TRAINER_DATA[params.id] || TRAINER_DATA['1']

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-[#03243F] text-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-[#18A96B] text-xl font-bold font-[Playfair_Display,serif]">MyTrustedTrainer</Link>
        <div className="flex gap-4">
          <Link href="/search" className="text-gray-300 hover:text-white text-sm">← Back to Search</Link>
          <Link href="/signup" className="bg-[#18A96B] hover:bg-[#13875A] text-white text-sm px-4 py-1.5 rounded-lg font-semibold">Sign Up</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className={`bg-gradient-to-br ${t.color} text-white py-12 px-6`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-3xl shrink-0">{t.initials}</div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold font-[Playfair_Display,serif] mb-1">{t.name}</h1>
            <p className="text-white/80 mb-2">{t.tagline}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">{t.cert}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">{t.format}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">{t.location}</span>
            </div>
          </div>
          <div className="text-center shrink-0">
            <div className="text-4xl font-bold">{t.rating} ★</div>
            <div className="text-white/70 text-sm">{t.reviews} reviews</div>
            <div className="text-white font-bold text-xl mt-1">${t.price}/session</div>
          </div>
        </div>
      </div>

      {/* Score Strip */}
      <div className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8">
          {Object.entries(t.scores).map(([key, val]) => (
            <div key={key} className="text-center">
              <div className="text-[#18A96B] font-bold text-xl">{(val as number).toFixed(1)}</div>
              <div className="text-gray-500 text-xs">{key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
        {/* Main */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-[#03243F] mb-3 font-[Playfair_Display,serif]">About {t.name}</h2>
            <p className="text-gray-600 leading-relaxed">{t.bio}</p>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-[#03243F] mb-4 font-[Playfair_Display,serif]">Review Sources</h2>
            <div className="space-y-3">
              {t.platforms.map(p => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-700">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F4A636] font-bold">{p.rating} ★</span>
                    <span className="text-gray-400 text-sm">({p.count} reviews)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-[#03243F] mb-4 font-[Playfair_Display,serif]">Recent Reviews</h2>
            <div className="space-y-4">
              {t.reviewList.map((r, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#03243F] rounded-full flex items-center justify-center text-white text-xs font-bold">{r.author[0]}</div>
                      <span className="font-medium text-gray-700">{r.author}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{r.platform}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#F4A636]">{'★'.repeat(r.rating)}</span>
                      <span className="text-gray-400 text-xs">{r.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* CTA */}
          <div className="bg-[#03243F] rounded-2xl p-6 text-white text-center">
            <h3 className="font-bold text-lg mb-2">Ready to Start?</h3>
            <p className="text-gray-300 text-sm mb-4">Send {t.name.split(' ')[0]} a message. Free, no account required to inquire.</p>
            <Link href="/signup" className="block w-full bg-[#18A96B] hover:bg-[#13875A] text-white font-bold py-3 rounded-xl transition-all mb-2">
              Request a Session
            </Link>
            <button className="block w-full border border-white/30 hover:border-white text-white text-sm py-2.5 rounded-xl transition-all">
              Save Trainer
            </button>
          </div>

          {/* Packages */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-[#03243F] mb-3">Packages</h3>
            <div className="space-y-3">
              {t.packages.map(p => (
                <div key={p.name} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex justify-between mb-0.5">
                    <span className="font-medium text-sm text-[#03243F]">{p.name}</span>
                    <span className="text-[#18A96B] font-bold text-sm">${p.price}</span>
                  </div>
                  <p className="text-gray-400 text-xs">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-[#03243F] mb-3">Availability</h3>
            <div className="flex gap-1.5 flex-wrap">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => (
                <span key={day} className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.availability.includes(day) ? 'bg-[#18A96B] text-white' : 'bg-gray-100 text-gray-400'}`}>{day}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}