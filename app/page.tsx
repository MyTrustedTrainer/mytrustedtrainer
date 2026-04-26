import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

const BADGES = [
  {
    icon: '⚡',
    name: 'Lightning Responder',
    how: 'Avg response speed ≥ 4.5 / 5 across 3+ client check-ins in the last 30 days.',
    borderColor: '#F4A636',
  },
  {
    icon: '🔁',
    name: 'Consistency King',
    how: 'Avg session rating ≥ 4.3 / 5 across 5+ check-ins in the last 60 days.',
    borderColor: '#1652DB',
  },
  {
    icon: '💎',
    name: 'Value Pick',
    how: 'Price at or below the city median with avg session rating ≥ 4.0 from 3+ check-ins.',
    borderColor: '#18A96B',
  },
  {
    icon: '📈',
    name: 'Results Driven',
    how: "Clients' avg improvement score beats the platform average by 0.5+ points over 90 days.",
    borderColor: '#03243F',
  },
  {
    icon: '🏆',
    name: 'Top Rated Local',
    how: 'Highest avg session rating in College Station with 5+ check-ins. Only one trainer holds this at a time.',
    borderColor: '#F4A636',
  },
]

const FEATURED_TRAINERS = [
  {
    name: 'Marcus Webb',
    tagline: 'Strength & performance coach for athletes and serious lifters',
    specialty: 'Strength Training',
    format: 'In-Person',
    price: 75,
    initials: 'MW',
    badges: ['⚡', '🏆'],
  },
  {
    name: 'Layla Torres',
    tagline: 'Weight loss and accountability coach — compassionate, results-focused',
    specialty: 'Weight Loss',
    format: 'In-Person · Virtual',
    price: 55,
    initials: 'LT',
    badges: ['🔁', '💎'],
  },
  {
    name: 'Derek Hollins',
    tagline: 'Mobility, flexibility, and injury prevention for all fitness levels',
    specialty: 'Mobility & Recovery',
    format: 'In-Person',
    price: 65,
    initials: 'DH',
    badges: ['📈'],
  },
]

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white font-[Outfit]">

        {/* Hero */}
        <section className="bg-[#03243F] text-white py-24 px-6 text-center">
          <p className="text-slate-400 uppercase tracking-widest text-sm font-semibold mb-4">
            College Station · Texas A&M
          </p>
          <h1 className="font-[Playfair_Display] text-5xl md:text-6xl font-bold leading-tight max-w-3xl mx-auto mb-6">
            Find Your <span className="text-[#1652DB]">Ideal Trainer</span>
            <br />By Compatibility, Not Reviews
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Answer 8 questions. Our algorithm scores every local trainer across
            10 dimensions and builds your personalized ranked directory — free, always.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding/client"
              className="bg-[#18A96B] hover:bg-[#148f58] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              Get My Match Score →
            </Link>
            <Link
              href="/search"
              className="border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              Browse Trainers
            </Link>
          </div>
        </section>

        {/* Stats bar — navy with cobalt numbers */}
        <section className="bg-[#03243F] py-6 px-6 border-t border-[#1652DB]/40">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: '35+', label: 'Vetted Local Trainers' },
              { num: '10', label: 'Match Dimensions' },
              { num: '1–10', label: 'Personalized Score' },
              { num: 'Free', label: 'Always for Clients' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="text-[#1652DB] font-bold text-2xl">{num}</div>
                <div className="text-white/60 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <h2 className="font-[Playfair_Display] text-4xl font-bold text-[#03243F] text-center mb-14">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Tell us about yourself',
                desc: 'Goals, schedule, coaching style, budget, experience — 8 quick questions.',
              },
              {
                step: '02',
                title: 'We score every trainer',
                desc: 'Our algorithm weighs 10 compatibility dimensions and produces a 1–10 match score for each trainer.',
              },
              {
                step: '03',
                title: 'See your ranked directory',
                desc: 'Your personal trainer directory, sorted by how well each trainer fits you specifically.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#03243F] text-[#1652DB] font-bold text-xl flex items-center justify-center mx-auto mb-5">
                  {step}
                </div>
                <h3 className="font-[Playfair_Display] text-xl font-bold text-[#03243F] mb-3">{title}</h3>
                <p className="text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The Matching Difference */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-[Playfair_Display] text-4xl font-bold text-[#03243F] text-center mb-4">
              The Matching Difference
            </h2>
            <p className="text-slate-500 text-center max-w-2xl mx-auto mb-14 text-lg">
              Reviews tell you what others thought. We tell you what <em>you</em> will experience.
            </p>
            <div className="grid md:grid-cols-2 gap-8 items-stretch">

              {/* Left — generic star ratings */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
                  What other platforms show you
                </p>
                <div className="space-y-3">
                  {[
                    { name: 'Trainer A', stars: '★★★★☆', count: '41 reviews' },
                    { name: 'Trainer B', stars: '★★★★★', count: '12 reviews' },
                    { name: 'Trainer C', stars: '★★★★☆', count: '78 reviews' },
                  ].map((t) => (
                    <div
                      key={t.name}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div>
                        <div className="font-semibold text-slate-700 text-sm">{t.name}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{t.count}</div>
                      </div>
                      <div className="text-amber-400 text-base tracking-tight">{t.stars}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-slate-400 text-sm italic leading-relaxed">
                  Same 4-star rating. Same generic list. No way to know which trainer is actually right for <em>you</em>.
                </p>
              </div>

              {/* Right — MTT personalized scores */}
              <div className="bg-[#03243F] rounded-2xl p-8 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-[#18A96B] mb-6">
                  What MTT shows you
                </p>
                <div className="space-y-3">
                  {[
                    {
                      name: 'Layla Torres',
                      tagline: 'Weight loss · accountability',
                      score: '9.4',
                      badges: ['💎', '🔁'],
                      bg: '#18A96B',
                    },
                    {
                      name: 'Marcus Webb',
                      tagline: 'Strength & performance',
                      score: '8.1',
                      badges: ['⚡', '🏆'],
                      bg: '#F4A636',
                    },
                    {
                      name: 'Derek Hollins',
                      tagline: 'Mobility · injury prevention',
                      score: '7.3',
                      badges: ['📈'],
                      bg: '#F4A636',
                    },
                  ].map((t) => (
                    <div
                      key={t.name}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/10"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="font-semibold text-white text-sm">{t.name}</div>
                        <div className="text-white/50 text-xs mt-0.5">{t.tagline}</div>
                        <div className="flex gap-1 mt-1">
                          {t.badges.map((b) => (
                            <span key={b} className="text-sm">{b}</span>
                          ))}
                        </div>
                      </div>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 text-white"
                        style={{ backgroundColor: t.bg }}
                      >
                        {t.score}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-white/50 text-sm italic leading-relaxed">
                  Ranked by your personal compatibility — built from 10 dimensions, not crowd opinion.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Badge Showcase */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-[Playfair_Display] text-4xl font-bold text-[#03243F] text-center mb-4">
              Verified Behavioral Badges
            </h2>
            <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">
              Trainers earn badges from real behavioral data — not self-reporting, not ad spend.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              {BADGES.map((b) => (
                <div
                  key={b.name}
                  className="bg-white rounded-xl border border-slate-200 p-5 text-center hover:shadow-md transition-shadow"
                  style={{ borderTopColor: b.borderColor, borderTopWidth: '3px' }}
                >
                  <div className="text-3xl mb-3">{b.icon}</div>
                  <h3 className="font-bold text-[#03243F] text-sm mb-2">{b.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{b.how}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-400 text-sm italic">
              Every badge is calculated automatically from verified client check-in data. No trainer can buy or request a badge.
            </p>
          </div>
        </section>

        {/* Featured Trainers */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-[Playfair_Display] text-4xl font-bold text-[#03243F] text-center mb-4">
              Trainers in College Station
            </h2>
            <p className="text-slate-500 text-center mb-12">
              Sign up free to see your personal compatibility score with each trainer.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {FEATURED_TRAINERS.map((t) => (
                <div
                  key={t.name}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                  style={{ borderTopColor: '#1652DB', borderTopWidth: '3px' }}
                >
                  <div className="p-6">
                    {/* Header row */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#03243F] text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                        {t.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#03243F] text-sm leading-tight">{t.name}</h3>
                        <p className="text-slate-500 text-xs mt-0.5 leading-snug">{t.tagline}</p>
                      </div>
                      {/* Lock icon — score hidden until signup */}
                      <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0" title="Sign up to see your match score">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    {/* Badges */}
                    <div className="flex gap-1.5 mb-4">
                      {t.badges.map((b) => (
                        <span key={b} className="text-base" title="Verified behavioral badge">{b}</span>
                      ))}
                    </div>
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold text-[#03243F]">${t.price}</span>/session · {t.format}
                      </div>
                      <Link
                        href="/signup"
                        className="text-xs font-semibold text-[#18A96B] hover:text-[#148f58] transition-colors"
                      >
                        See your score →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/search"
                className="text-[#1652DB] font-semibold hover:text-[#1245b8] transition-colors"
              >
                See all trainers →
              </Link>
            </div>
          </div>
        </section>

        {/* 10 Match Dimensions */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-[Playfair_Display] text-4xl font-bold text-[#03243F] text-center mb-4">
              What We Match On
            </h2>
            <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
              Ten weighted dimensions, not star ratings. Every score is computed from real compatibility data.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                'Training Goals',
                'Schedule & Availability',
                'Coaching Style',
                'Personality Fit',
                'Location & Travel',
                'Budget Range',
                'Experience Level',
                'Gender Preference',
                'Specializations',
                'Communication Style',
              ].map((dim) => (
                <div
                  key={dim}
                  className="bg-white border border-slate-200 border-t-[3px] border-t-[#1652DB] rounded-lg p-5 text-center text-sm font-semibold text-[#03243F] hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  {dim}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Trainers CTA */}
        <section className="py-20 px-6 bg-[#03243F] text-white text-center">
          <h2 className="font-[Playfair_Display] text-4xl font-bold mb-4">
            Are You a Personal Trainer?
          </h2>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
            Claim your free profile. Appear in personalized match results for clients who fit your style.
            First lead is free — no credit card required.
          </p>
          <Link
            href="/signup?role=trainer"
            className="inline-block bg-[#1652DB] hover:bg-[#1245b8] text-white font-bold px-10 py-4 rounded-lg text-lg transition-colors"
          >
            Claim Your Free Profile
          </Link>
        </section>

        {/* Footer */}
        <footer className="py-10 px-6 text-center text-slate-500 text-sm bg-white border-t border-slate-100">
          <p className="mb-2">
            <Link href="/search" className="hover:text-[#1652DB] mr-4 transition-colors">Browse Trainers</Link>
            <Link href="/onboarding/client" className="hover:text-[#1652DB] mr-4 transition-colors">Get Matched</Link>
            <Link href="/signup?role=trainer" className="hover:text-[#1652DB] transition-colors">Trainer Sign Up</Link>
          </p>
          <p>© {new Date().getFullYear()} MyTrustedTrainer · College Station, TX</p>
        </footer>

      </main>
    </>
  )
}
