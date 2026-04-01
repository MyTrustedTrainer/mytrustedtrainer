import Link from 'next/link'

const TRAINERS = [
  {
    name: 'Marcus Johnson',
    specialty: 'Strength & Conditioning',
    rating: 4.9,
    reviews: 87,
    price: '$65/session',
    tags: ['NASM Certified', 'Weight Loss', 'Athlete Training'],
    initials: 'MJ',
    color: 'from-[#03243F] to-[#18A96B]',
    platforms: ['Google', 'Yelp'],
  },
  {
    name: 'Sarah Chen',
    specialty: 'Yoga & Mobility',
    rating: 5.0,
    reviews: 112,
    price: '$55/session',
    tags: ['RYT-500', 'Flexibility', 'Stress Relief'],
    initials: 'SC',
    color: 'from-[#18A96B] to-[#0d6e46]',
    platforms: ['Google', 'Facebook'],
  },
  {
    name: 'Derek Williams',
    specialty: 'HIIT & Fat Loss',
    rating: 4.8,
    reviews: 64,
    price: '$60/session',
    tags: ['ACE Certified', 'HIIT', 'Nutrition Coaching'],
    initials: 'DW',
    color: 'from-[#F4A636] to-[#e08c1a]',
    platforms: ['Google', 'Yelp', 'Facebook'],
  },
]

const FEATURES = [
  {
    icon: '⭐',
    title: 'Aggregated Reviews',
    desc: 'See ratings from Google, Yelp, and Facebook combined into one trusted score. No cherry-picking.',
  },
  {
    icon: '🔍',
    title: 'Smart Search & Filter',
    desc: 'Filter by specialty, price, rating, certification, format, and distance from you.',
  },
  {
    icon: '✅',
    title: 'Verified Profiles',
    desc: 'Every trainer profile is manually verified. Certifications checked. No fakes.',
  },
  {
    icon: '📊',
    title: 'Four-Dimension Scores',
    desc: 'Trainers rated on Results, Communication, Punctuality, and Value — not just a single star.',
  },
  {
    icon: '💬',
    title: 'Real Outcome Stories',
    desc: 'Clients share specific results — "Lost 28 lbs in 5 months" — so you know what to expect.',
  },
  {
    icon: '🆓',
    title: 'Free for Clients',
    desc: 'Always. No account required to browse. Sign up only when you are ready to contact a trainer.',
  },
]

const STEPS = [
  { num: '1', title: 'Search', desc: 'Type a specialty or browse all trainers in College Station.' },
  { num: '2', title: 'Compare', desc: 'Read aggregated reviews, scores, and client outcome stories.' },
  { num: '3', title: 'Connect', desc: 'Send a direct message to your chosen trainer. Free, instant, no middleman.' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-[Outfit,sans-serif]">

      {/* NAV */}
      <nav className="bg-[#03243F] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-[#18A96B] text-2xl font-bold font-[Playfair_Display,serif]">MTT</span>
          <span className="hidden sm:block text-white font-semibold text-lg">MyTrustedTrainer</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/search" className="text-gray-300 hover:text-white text-sm transition-colors">Find Trainers</Link>
          <Link href="/for-trainers" className="text-gray-300 hover:text-white text-sm transition-colors">For Trainers</Link>
          <Link href="/login" className="text-sm bg-transparent border border-gray-500 hover:border-white text-gray-300 hover:text-white px-4 py-1.5 rounded-lg transition-all">Log In</Link>
          <Link href="/signup" className="text-sm bg-[#18A96B] hover:bg-[#13875A] text-white px-4 py-1.5 rounded-lg transition-all font-semibold">Sign Up Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#03243F] via-[#04305a] to-[#03243F] text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#18A96B]/20 border border-[#18A96B]/40 rounded-full px-4 py-1.5 mb-6 text-sm text-[#18A96B]">
            <span className="w-2 h-2 bg-[#18A96B] rounded-full inline-block"></span>
            Now live in College Station, TX
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-[Playfair_Display,serif] leading-tight mb-6">
            Find a Trainer You Can <span className="text-[#18A96B]">Actually Trust</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            We pull reviews from Google, Yelp, and Facebook into one honest profile for every personal trainer in College Station. Free to browse. No account needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/search" className="bg-[#18A96B] hover:bg-[#13875A] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Browse Trainers Free →
            </Link>
            <Link href="/for-trainers" className="border-2 border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all">
              I&apos;m a Trainer
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2"><span className="text-[#18A96B]">✓</span> Google Reviews</div>
            <div className="flex items-center gap-2"><span className="text-[#18A96B]">✓</span> Yelp Ratings</div>
            <div className="flex items-center gap-2"><span className="text-[#18A96B]">✓</span> Facebook Reviews</div>
            <div className="flex items-center gap-2"><span className="text-[#18A96B]">✓</span> Native MTT Reviews</div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-[#18A96B] text-white py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-12 text-center">
          <div><div className="text-3xl font-bold">40+</div><div className="text-sm text-green-100">Trainer Profiles</div></div>
          <div><div className="text-3xl font-bold">500+</div><div className="text-sm text-green-100">Aggregated Reviews</div></div>
          <div><div className="text-3xl font-bold">3</div><div className="text-sm text-green-100">Review Platforms</div></div>
          <div><div className="text-3xl font-bold">Free</div><div className="text-sm text-green-100">Always for Clients</div></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h2 className="text-4xl font-bold font-[Playfair_Display,serif] text-[#03243F] mb-4">How It Works</h2>
          <p className="text-gray-500 text-lg">Three steps to finding your perfect trainer.</p>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#03243F] text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">{s.num}</div>
              <h3 className="text-xl font-bold text-[#03243F] mb-2">{s.title}</h3>
              <p className="text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED TRAINERS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold font-[Playfair_Display,serif] text-[#03243F] mb-4">Featured Trainers</h2>
            <p className="text-gray-500 text-lg">Top-rated trainers in College Station this month.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TRAINERS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
                <div className={`bg-gradient-to-br ${t.color} p-6 flex items-center gap-4`}>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">{t.initials}</div>
                  <div>
                    <div className="text-white font-bold text-lg">{t.name}</div>
                    <div className="text-white/80 text-sm">{t.specialty}</div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[#F4A636] font-bold text-lg">{t.rating}</span>
                      <span className="text-[#F4A636]">★</span>
                      <span className="text-gray-400 text-sm ml-1">({t.reviews} reviews)</span>
                    </div>
                    <span className="text-[#03243F] font-semibold text-sm">{t.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {t.tags.map((tag) => (
                      <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <div className="flex gap-1.5 mb-4">
                    {t.platforms.map((p) => (
                      <span key={p} className="bg-[#03243F]/5 text-[#03243F] text-xs px-2 py-0.5 rounded-full font-medium">{p}</span>
                    ))}
                  </div>
                  <Link href="/search" className="block w-full text-center bg-[#03243F] hover:bg-[#18A96B] text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-200">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/search" className="bg-[#18A96B] hover:bg-[#13875A] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-md hover:shadow-lg">
              See All Trainers →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold font-[Playfair_Display,serif] text-[#03243F] mb-4">Why MyTrustedTrainer?</h2>
            <p className="text-gray-500 text-lg">Built from the ground up for the fitness community.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-[#03243F] mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR TRAINERS CTA */}
      <section className="py-20 px-6 bg-[#03243F] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold font-[Playfair_Display,serif] mb-4">Are You a Trainer in College Station?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Your profile may already be here. Claim it, connect your reviews, and start getting leads. First 25 trainers get Pro pricing locked at $29/month for life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/claim" className="bg-[#18A96B] hover:bg-[#13875A] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg">
              Claim Your Profile →
            </Link>
            <Link href="/for-trainers" className="border-2 border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all">
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-6 bg-white" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold font-[Playfair_Display,serif] text-[#03243F] mb-4">Simple Pricing for Trainers</h2>
            <p className="text-gray-500 text-lg">Clients are always free. Trainers choose their plan.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', period: 'forever', features: ['Basic profile', '1 review platform', 'Up to 3 leads/month', 'MTT review badge'], cta: 'Get Started Free', highlight: false },
              { name: 'Pro', price: '$49', period: '/month', badge: '🔥 Most Popular', features: ['All platforms connected', 'Unlimited leads', 'Featured in search', 'Respond to reviews', 'Analytics dashboard'], cta: 'Start Pro Trial', highlight: true },
              { name: 'Elite', price: '$99', period: '/month', features: ['Everything in Pro', 'Video testimonials', 'Homepage featured slot', 'CRM integrations', 'Dedicated support'], cta: 'Go Elite', highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 border-2 ${plan.highlight ? 'border-[#18A96B] shadow-xl scale-105' : 'border-gray-100 shadow-sm'} relative`}>
                {plan.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#18A96B] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">{plan.badge}</div>}
                <div className="text-[#03243F] font-bold text-xl mb-1">{plan.name}</div>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold text-[#03243F]">{plan.price}</span>
                  <span className="text-gray-400 mb-1">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-[#18A96B] font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup?type=trainer" className={`block w-full text-center font-bold py-3 rounded-xl transition-all ${plan.highlight ? 'bg-[#18A96B] hover:bg-[#13875A] text-white' : 'border-2 border-[#03243F] text-[#03243F] hover:bg-[#03243F] hover:text-white'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#03243F] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-[#18A96B] text-2xl font-bold font-[Playfair_Display,serif] mb-2">MTT</div>
            <p className="text-gray-400 text-sm leading-relaxed">The trusted marketplace for fitness trainers in College Station, TX.</p>
          </div>
          <div>
            <div className="font-semibold mb-3">For Clients</div>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/search" className="hover:text-white transition-colors">Find Trainers</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">For Trainers</div>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/claim" className="hover:text-white transition-colors">Claim Profile</Link></li>
              <li><Link href="/for-trainers" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/signup?type=trainer" className="hover:text-white transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Company</div>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/investors" className="hover:text-white transition-colors">Investors</Link></li>
              <li><a href="mailto:support@mytrustedtrainer.com" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <div>© 2026 MyTrustedTrainer. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}