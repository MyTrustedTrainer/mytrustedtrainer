import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

export default function ForTrainersPage() {
    return (
          <div className="min-h-screen bg-white">
                <SiteHeader />
          
            {/* Hero */}
                <section className="bg-gradient-to-br from-[#03243F] to-[#04305a] text-white py-20 px-6">
                        <div className="max-w-4xl mx-auto text-center">
                                  <div className="inline-block bg-[#F4A636] text-[#03243F] text-sm font-bold px-4 py-1.5 rounded-full mb-6">
                                              First 25 Trainers — Founding Member Pricing
                                  </div>div>
                                  <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display' }}>
                                              Get Matched With Clients Who Are Right For You
                                  </h1>h1>
                                  <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                                              MyTrustedTrainer doesn&apos;t just list you — it matches you. Clients answer 8 questions and our algorithm scores every trainer across 10 dimensions. The right clients find you automatically.
                                  </p>p>
                                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                              <Link href="/signup?role=trainer" className="bg-[#18A96B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#15906A] transition-colors">
                                                            Claim Your Free Profile →
                                              </Link>Link>
                                              <a href="#pricing" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
                                                            View Pricing
                                              </a>a>
                                  </div>div>
                        </div>div>
                </section>section>
          
            {/* Why Compatibility Matching */}
                <section className="py-20 px-6">
                        <div className="max-w-5xl mx-auto">
                                  <div className="text-center mb-12">
                                              <h2 className="text-3xl font-bold text-[#03243F] mb-4" style={{ fontFamily: 'Playfair Display' }}>
                                                            Why Compatibility Matching Beats Reviews
                                              </h2>h2>
                                              <p className="text-gray-500 max-w-2xl mx-auto">
                                                            Reviews tell clients if a trainer is good. Compatibility matching tells them if a trainer is right <em>for them</em>em>. That&apos;s a better lead — and a longer client relationship.
                                              </p>p>
                                  </div>div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
            {
                              icon: '🎯',
                              title: 'Pre-Qualified Leads',
                              desc: 'Every client who contacts you has already been algorithmically matched to you across 10 dimensions — goals, schedule, coaching style, experience level, and more.',
            },
            {
                              icon: '🏅',
                              title: 'Earned Trust Badges',
                              desc: 'Badges on your profile are earned exclusively from private behavioral data collected from your matched clients over time. They cannot be bought, requested, or faked.',
            },
            {
                              icon: '📈',
                              title: 'Built-In CRM',
                              desc: 'Pro and Elite plans include a full client management system — routines, check-ins, calendar, and messaging — so your entire business runs on one platform.',
            },
            {
                              icon: '🔒',
                              title: 'Priority Placement',
                              desc: 'Elite trainers appear at the top of every matched client&apos;s personalized ranked directory. Not based on ad spend — based on fit score.',
            },
            {
                              icon: '👥',
                              title: 'Bring Existing Clients',
                              desc: 'Elite trainers can onboard their current clients directly into the platform, so behavioral data starts building your badge profile from day one.',
            },
            {
                              icon: '📊',
                              title: 'Profile Analytics',
                              desc: 'See how many clients your profile was surfaced to, your average match score, and which compatibility dimensions are driving the most interest.',
            },
                        ].map((item) => (
                                        <div key={item.title} className="bg-gray-50 rounded-2xl p-6">
                                                        <div className="text-3xl mb-3">{item.icon}</div>div>
                                                        <h3 className="font-bold text-[#03243F] mb-2">{item.title}</h3>h3>
                                                        <p className="text-gray-500 text-sm">{item.desc}</p>p>
                                        </div>div>
                                      ))}
                                  </div>div>
                        </div>div>
                </section>section>
          
            {/* How It Works */}
                <section className="py-20 px-6 bg-gray-50">
                        <div className="max-w-4xl mx-auto">
                                  <div className="text-center mb-12">
                                              <h2 className="text-3xl font-bold text-[#03243F] mb-2" style={{ fontFamily: 'Playfair Display' }}>
                                                            Get Started in 3 Steps
                                              </h2>h2>
                                  </div>div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
            {
                              n: '1',
                              title: 'Claim Your Profile',
                              desc: 'Sign up and complete your trainer compatibility profile — coaching style, availability, specialties, experience, and the type of clients you work best with.',
            },
            {
                              n: '2',
                              title: 'Get Matched Automatically',
                              desc: 'Our algorithm scores you against every incoming client. When a client is a strong match, you appear in their personalized ranked directory.',
            },
            {
                              n: '3',
                              title: 'Receive Pre-Qualified Leads',
                              desc: 'Clients who contact you already fit your profile. Free trainers get their first lead free, then $15/lead. Pro and Elite get unlimited leads.',
            },
                        ].map((step) => (
                                        <div key={step.n} className="text-center">
                                                        <div className="w-14 h-14 bg-[#18A96B] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                                          {step.n}
                                                        </div>div>
                                                        <h3 className="text-lg font-bold text-[#03243F] mb-2">{step.title}</h3>h3>
                                                        <p className="text-gray-500 text-sm">{step.desc}</p>p>
                                        </div>div>
                                      ))}
                                  </div>div>
                                  <div className="text-center mt-10">
                                              <Link href="/signup?role=trainer" className="bg-[#18A96B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#15906A] inline-block transition-colors">
                                                            Get Started Free
                                              </Link>Link>
                                  </div>div>
                        </div>div>
                </section>section>
          
            {/* Pricing */}
                <section id="pricing" className="py-20 px-6">
                        <div className="max-w-5xl mx-auto">
                                  <div className="text-center mb-10">
                                              <div className="inline-block bg-[#F4A636]/20 text-[#F4A636] font-bold px-4 py-1.5 rounded-full text-sm mb-4">
                                                            Founding Member Offer: First 25 trainers get Pro locked at $29/mo for life
                                              </div>div>
                                              <h2 className="text-3xl font-bold text-[#03243F] mb-2" style={{ fontFamily: 'Playfair Display' }}>
                                                            Simple, Transparent Pricing
                                              </h2>h2>
                                              <p className="text-gray-500">Clients are always free. Start free and upgrade when you&apos;re ready.</p>p>
                                  </div>div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                                  
                                    {/* Free */}
                                              <div className="rounded-2xl p-8 bg-gray-50">
                                                            <h3 className="text-xl font-bold mb-1 text-[#03243F]">Free</h3>h3>
                                                            <div className="flex items-end gap-1 mb-4">
                                                                            <span className="text-4xl font-bold text-[#03243F]">$0</span>span>
                                                                            <span className="text-sm mb-1 text-gray-400">forever</span>span>
                                                            </div>div>
                                                            <ul className="space-y-2 mb-8">
                                                              {[
                              'Claim your profile',
                              'Appear in client match results',
                              'First lead free',
                              '$15/lead after that',
                            ].map((f) => (
                                                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                                                                    <span className="text-[#18A96B] mt-0.5 flex-shrink-0">✓</span>span> {f}
                                                </li>li>
                                              ))}
                                                            </ul>ul>
                                                            <Link href="/signup?role=trainer&plan=free" className="block text-center py-3 rounded-xl font-semibold transition-colors bg-[#03243F] text-white hover:bg-[#04305a]">
                                                                            Get Started Free
                                                            </Link>Link>
                                              </div>div>
                                  
                                    {/* Pro */}
                                              <div className="rounded-2xl p-8 bg-[#03243F] text-white ring-4 ring-[#18A96B] relative">
                                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#18A96B] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                                                                            Most Popular
                                                            </div>div>
                                                            <h3 className="text-xl font-bold mb-1 text-white">Pro</h3>h3>
                                                            <div className="flex items-end gap-1 mb-1">
                                                                            <span className="text-4xl font-bold text-white">$49</span>span>
                                                                            <span className="text-sm mb-1 text-gray-300">/month</span>span>
                                                            </div>div>
                                                            <p className="text-[#F4A636] text-sm font-semibold mb-4">$29/mo founding price</p>p>
                                                            <ul className="space-y-2 mb-8">
                                                              {[
                              'Unlimited leads',
                              'CRM for up to 5 active clients',
                              'Routines, check-ins & calendar',
                              'Featured in match results',
                              'Profile analytics',
                              'Priority support',
                            ].map((f) => (
                                                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                                                                    <span className="text-[#18A96B] mt-0.5 flex-shrink-0">✓</span>span> {f}
                                                </li>li>
                                              ))}
                                                            </ul>ul>
                                                            <Link href="/signup?role=trainer&plan=pro" className="block text-center py-3 rounded-xl font-semibold transition-colors bg-[#18A96B] text-white hover:bg-[#15906A]">
                                                                            Start Pro Trial
                                                            </Link>Link>
                                              </div>div>
                                  
                                    {/* Elite */}
                                              <div className="rounded-2xl p-8 bg-gray-50">
                                                            <h3 className="text-xl font-bold mb-1 text-[#03243F]">Elite</h3>h3>
                                                            <div className="flex items-end gap-1 mb-4">
                                                                            <span className="text-4xl font-bold text-[#03243F]">$99</span>span>
                                                                            <span className="text-sm mb-1 text-gray-400">/month</span>span>
                                                            </div>div>
                                                            <ul className="space-y-2 mb-8">
                                                              {[
                              'Everything in Pro',
                              'Unlimited active clients',
                              'Onboard your existing clients',
                              'Priority placement in all matches',
                              'Homepage featured slot',
                              'Dedicated account manager',
                            ].map((f) => (
                                                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                                                                    <span className="text-[#18A96B] mt-0.5 flex-shrink-0">✓</span>span> {f}
                                                </li>li>
                                              ))}
                                                            </ul>ul>
                                                            <Link href="/signup?role=trainer&plan=elite" className="block text-center py-3 rounded-xl font-semibold transition-colors bg-[#03243F] text-white hover:bg-[#04305a]">
                                                                            Go Elite
                                                            </Link>Link>
                                              </div>div>
                                  
                                  </div>div>
                        </div>div>
                </section>section>
          
            {/* FAQ */}
                <section className="py-20 px-6 bg-gray-50">
                        <div className="max-w-3xl mx-auto">
                                  <h2 className="text-3xl font-bold text-[#03243F] mb-10 text-center" style={{ fontFamily: 'Playfair Display' }}>
                                              Common Questions
                                  </h2>h2>
                                  <div className="space-y-6">
                                    {[
            {
                              q: 'How does the matching algorithm work?',
                              a: 'Clients answer 8 questions covering their goals, schedule, experience level, preferred coaching style, budget, and more. The algorithm scores every trainer across 10 compatibility dimensions and builds each client a personalized ranked directory. No two clients see the same list.',
            },
            {
                              q: 'What are the badges and how do I earn them?',
                              a: 'Badges are earned exclusively from private behavioral data collected from your matched clients over time — things like consistency, communication, and results. They cannot be purchased, requested, or self-reported. They are the platform\'s trust moat.',
            },
            {
                              q: 'What is the Founding Trainer offer?',
                              a: 'The first 25 trainers who subscribe to Pro get their rate locked at $29/month for life — even after we raise prices. Use code MTT-FOUNDING at checkout.',
            },
            {
                              q: 'What\'s included in the CRM?',
                              a: 'Pro trainers get a full CRM for up to 5 active clients: custom routines, session check-ins, calendar, and direct messaging. Elite removes the client cap and adds the ability to onboard trainers you already work with.',
            },
            {
                              q: 'Can I cancel anytime?',
                              a: 'Yes. No contracts, no cancellation fees. Cancel anytime from your dashboard.',
            },
                        ].map((item, i) => (
                                        <div key={i} className="bg-white rounded-2xl p-6">
                                                        <h3 className="font-bold text-[#03243F] mb-2">{item.q}</h3>h3>
                                                        <p className="text-gray-500 text-sm">{item.a}</p>p>
                                        </div>div>
                                      ))}
                                  </div>div>
                        </div>div>
                </section>section>
          
            {/* CTA */}
                <section className="py-20 px-6 bg-[#03243F] text-white">
                        <div className="max-w-3xl mx-auto text-center">
                                  <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>
                                              Ready to Get Matched With the Right Clients?
                                  </h2>h2>
                                  <p className="text-gray-300 mb-8">
                                              Join the trainers already using MyTrustedTrainer to build a better client base in College Station.
                                  </p>p>
                                  <Link href="/signup?role=trainer" className="bg-[#18A96B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#15906A] inline-block transition-colors">
                                              Create Your Free Profile →
                                  </Link>Link>
                        </div>div>
                </section>section>
          
            {/* Footer */}
                <footer className="bg-[#02192d] text-gray-400 py-8 px-6">
                        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                                  <span className="text-white font-bold" style={{ fontFamily: 'Playfair Display' }}>
                                              <span className="text-[#18A96B]">My</span>span>TrustedTrainer
                                  </span>span>
                                  <div className="flex gap-6 text-sm">
                                              <Link href="/" className="hover:text-white">Home</Link>Link>
                                              <Link href="/search" className="hover:text-white">Find Trainers</Link>Link>
                                              <Link href="/about" className="hover:text-white">About</Link>Link>
                                              <Link href="/contact" className="hover:text-white">Contact</Link>Link>
                                              <Link href="/privacy" className="hover:text-white">Privacy</Link>Link>
                                              <Link href="/terms" className="hover:text-white">Terms</Link>Link>
                                  </div>div>
                                  <p className="text-sm">© 2026 MyTrustedTrainer</p>p>
                        </div>div>
                </footer>footer>
          </div>div>
        )
}</div>
