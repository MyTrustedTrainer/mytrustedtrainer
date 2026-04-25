import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

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

        {/* 10 Match Dimensions */}
        <section className="bg-slate-50 py-20 px-6">
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
