import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured trainers (top 3 by score)
  const { data: featured } = await supabase
    .from('trainer_profiles')
    .select('id, full_name, slug, tagline, plan, is_verified, trainer_scores(overall_score, total_review_count, google_count, yelp_count, facebook_count), trainer_specialties(specialty)')
    .eq('is_active', true)
    .eq('is_verified', true)
    .order('plan', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-[#03243F] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-[#18A96B] text-white text-xs font-bold px-2 py-1 rounded">MTT</span>
            <span className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}>MyTrustedTrainer</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/search" className="text-gray-300 hover:text-white text-sm font-medium">Find Trainers</Link>
            <Link href="/for-trainers" className="text-gray-300 hover:text-white text-sm font-medium">For Trainers</Link>
            <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium border border-gray-500 px-4 py-1.5 rounded-lg hover:border-white">Log In</Link>
            <Link href="/signup" className="bg-[#18A96B] text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-[#15906A]">Sign Up Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#03243F] to-[#04305a] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-[#18A96B] rounded-full inline-block"></span>
            Now live in College Station, TX
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{fontFamily:'Playfair Display'}}>
            Find a Trainer You Can <span className="text-[#18A96B]">Actually Trust</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            We pull reviews from Google, Yelp, and Facebook into one honest profile for every personal trainer in College Station. Free to browse. No account needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="bg-[#18A96B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#15906A] transition-colors">
              Browse Trainers Free &rarr;
            </Link>
            <Link href="/for-trainers" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
              I&apos;m a Trainer
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-400">
            {['Google Reviews','Yelp Ratings','Facebook Reviews','Native MTT Reviews'].map(s => (
              <span key={s} className="flex items-center gap-1"><span className="text-[#18A96B]">✓</span> {s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#18A96B] text-white py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            {num: '40+', label: 'Trainer Profiles'},
            {num: '500+', label: 'Aggregated Reviews'},
            {num: '3', label: 'Review Platforms'},
            {num: 'Free', label: 'Always for Clients'},
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold">{s.num}</div>
              <div className="text-white/80 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>How It Works</h2>
          <p className="text-gray-500 mb-12">Three steps to finding your perfect trainer.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {n:'1', title:'Search', desc:'Type a specialty or browse all trainers in College Station.'},
              {n:'2', title:'Compare', desc:'Read aggregated reviews, scores, and client outcome stories.'},
              {n:'3', title:'Connect', desc:'Send a direct message to your chosen trainer. Free, instant, no middleman.'},
            ].map(step => (
              <div key={step.n} className="text-center">
                <div className="w-14 h-14 bg-[#03243F] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{step.n}</div>
                <h3 className="text-xl font-bold text-[#03243F] mb-2">{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trainers - REAL DB DATA */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>Featured Trainers</h2>
            <p className="text-gray-500">Top-rated trainers in College Station this month.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(featured || []).map((trainer: any) => {
              const score = trainer.trainer_scores
              const platforms = []
              if (score?.google_count > 0) platforms.push('Google')
              if (score?.yelp_count > 0) platforms.push('Yelp')
              if (score?.facebook_count > 0) platforms.push('Facebook')
              const initials = trainer.full_name.split(' ').map((n: string) => n[0]).join('')
              const colors = ['#03243F','#18A96B','#F4A636','#1877F2','#D32323']
              const color = colors[trainer.full_name.charCodeAt(0) % colors.length]
              return (
                <div key={trainer.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6 text-center" style={{background: color}}>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                      {initials}
                    </div>
                    <h3 className="text-white font-bold text-lg">{trainer.full_name}</h3>
                    {trainer.tagline && <p className="text-white/80 text-sm mt-1 truncate">{trainer.tagline.split('|')[0].trim()}</p>}
                  </div>
                  <div className="p-5">
                    {score?.overall_score > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[#F4A636] font-bold">{Number(score.overall_score).toFixed(1)} ★</span>
                        <span className="text-gray-500 text-sm">({score.total_review_count} reviews)</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(trainer.trainer_specialties || []).slice(0, 3).map((s: any) => (
                        <span key={s.specialty} className="text-xs bg-[#E8F8F2] text-[#18A96B] px-2 py-1 rounded-full">{s.specialty}</span>
                      ))}
                    </div>
                    <div className="flex gap-1 mb-4">
                      {platforms.map(p => (
                        <span key={p} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{p}</span>
                      ))}
                    </div>
                    <Link href={'/trainers/' + trainer.slug}
                      className="block w-full text-center bg-[#03243F] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#04305a] transition-colors">
                      View Profile
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-center">
            <Link href="/search" className="inline-block bg-[#18A96B] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#15906A] transition-colors">
              See All Trainers &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Why MTT */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>Why MyTrustedTrainer?</h2>
            <p className="text-gray-500">Built from the ground up for the fitness community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {icon:'⭐', title:'Aggregated Reviews', desc:'See ratings from Google, Yelp, and Facebook combined into one trusted score. No cherry-picking.'},
              {icon:'🔍', title:'Smart Search & Filter', desc:'Filter by specialty, price, rating, certification, format, and distance from you.'},
              {icon:'✅', title:'Verified Profiles', desc:'Every trainer profile is manually verified. Certifications checked. No fakes.'},
              {icon:'📊', title:'Four-Dimension Scores', desc:'Trainers rated on Results, Communication, Punctuality, and Value.'},
              {icon:'💬', title:'Real Outcome Stories', desc:'Clients share specific results so you know what to expect.'},
              {icon:'🆓', title:'Free for Clients', desc:'Always. No account required to browse. Sign up only when you are ready to contact a trainer.'},
            ].map(f => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-[#03243F] mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Trainers */}
      <section className="py-20 px-6 bg-[#03243F] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{fontFamily:'Playfair Display'}}>Are You a Trainer in College Station?</h2>
          <p className="text-gray-300 mb-8 text-lg">Your profile may already be here. Claim it, connect your reviews, and start getting leads. First 25 trainers get Pro pricing locked at $29/month for life.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=trainer" className="bg-[#18A96B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#15906A] transition-colors">
              Claim Your Profile &rarr;
            </Link>
            <Link href="/for-trainers" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>Simple Pricing for Trainers</h2>
            <p className="text-gray-500">Clients are always free. Trainers choose their plan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {name:'Free', price:'$0', period:'forever', features:['Basic profile','1 review platform','Up to 3 leads/month','MTT review badge'], cta:'Get Started Free', href:'/signup?role=trainer&plan=free', featured:false},
              {name:'Pro', price:'$49', period:'/month', features:['All platforms connected','Unlimited leads','Featured in search','Respond to reviews','Analytics dashboard'], cta:'Start Pro Trial', href:'/signup?role=trainer&plan=pro', featured:true},
              {name:'Elite', price:'$99', period:'/month', features:['Everything in Pro','Video testimonials','Homepage featured slot','CRM integrations','Dedicated support'], cta:'Go Elite', href:'/signup?role=trainer&plan=elite', featured:false},
            ].map(plan => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.featured ? 'bg-[#03243F] text-white ring-4 ring-[#18A96B] relative' : 'bg-gray-50'}`}>
                {plan.featured && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#18A96B] text-white text-xs font-bold px-4 py-1 rounded-full">🔥 Most Popular</div>}
                <h3 className={`text-xl font-bold mb-1 ${plan.featured ? 'text-white' : 'text-[#03243F]'}`}>{plan.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className={`text-4xl font-bold ${plan.featured ? 'text-white' : 'text-[#03243F]'}`}>{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.featured ? 'text-gray-300' : 'text-gray-400'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.featured ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-[#18A96B]">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors ${plan.featured ? 'bg-[#18A96B] text-white hover:bg-[#15906A]' : 'bg-[#03243F] text-white hover:bg-[#04305a]'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#03243F] text-gray-400 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="text-white text-lg font-bold block mb-3" style={{fontFamily:'Playfair Display'}}>
              <span className="text-[#18A96B]">My</span>TrustedTrainer
            </span>
            <p className="text-sm">The trusted marketplace for fitness trainers in College Station, TX.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">For Clients</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-white">Find Trainers</Link></li>
              <li><Link href="/signup" className="hover:text-white">Create Account</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-white">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">For Trainers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup?role=trainer" className="hover:text-white">Claim Profile</Link></li>
              <li><Link href="/for-trainers" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/signup?role=trainer" className="hover:text-white">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-sm">
          &copy; 2026 MyTrustedTrainer. All rights reserved.
        </div>
      </footer>
    </div>
  )
}