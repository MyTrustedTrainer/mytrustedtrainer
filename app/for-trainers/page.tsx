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
          </div>
          <h1 className="text-5xl font-bold mb-6" style={{fontFamily:'Playfair Display'}}>
            Grow Your Training Business in College Station
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            MyTrustedTrainer connects you with clients actively searching for a trainer. Your aggregated reviews build instant credibility — you just show up and train.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=trainer" className="bg-[#18A96B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#15906A] transition-colors">
              Claim Your Free Profile &rarr;
            </Link>
            <a href="#pricing" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>Everything You Need to Get More Clients</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {icon:'⭐', title:'Aggregated Review Score', desc:'We pull your Google, Yelp, and Facebook reviews into one powerful score that clients trust immediately.'},
              {icon:'📩', title:'Direct Lead Delivery', desc:'Clients contact you directly through your profile. No middleman, no commission — just a direct message.'},
              {icon:'📊', title:'Analytics Dashboard', desc:'See how many people viewed your profile, where leads came from, and which specialties drive the most interest.'},
              {icon:'🔍', title:'Featured in Search', desc:'Pro and Elite trainers appear at the top of search results and on the homepage featured section.'},
              {icon:'✅', title:'Verified Badge', desc:'Our team manually verifies certifications so clients know they can trust your credentials.'},
              {icon:'📱', title:'Mobile-Optimized', desc:'Your profile looks perfect on every device. Most clients browse on their phones.'},
            ].map(b => (
              <div key={b.title} className="bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-bold text-[#03243F] mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>Get Started in 3 Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {n:'1', title:'Create Your Profile', desc:'Sign up and set up your trainer profile in under 10 minutes. Add your bio, specialties, certifications, and packages.'},
              {n:'2', title:'Connect Your Reviews', desc:'Link your Google Business, Yelp, and Facebook profiles. We aggregate everything into your MTT score automatically.'},
              {n:'3', title:'Start Getting Leads', desc:'Clients searching for trainers in College Station find your profile and contact you directly.'},
            ].map(s => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 bg-[#18A96B] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{s.n}</div>
                <h3 className="text-lg font-bold text-[#03243F] mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/signup?role=trainer" className="bg-[#18A96B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#15906A] inline-block transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <div className="inline-block bg-[#F4A636]/20 text-[#F4A636] font-bold px-4 py-1.5 rounded-full text-sm mb-4">
              Founding Member Offer: First 25 trainers get Pro locked at $29/mo for life
            </div>
            <h2 className="text-3xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>Simple, Transparent Pricing</h2>
            <p className="text-gray-500">Clients are always free. Start free and upgrade when you are ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              { name:'Free', price:'$0', period:'forever', features:['Basic public profile','1 review platform connected','Up to 3 leads/month','MTT review badge'], cta:'Get Started Free', href:'/signup?role=trainer&plan=free', featured:false },
              { name:'Pro', price:'$49', period:'/month', founding:'$29/mo founding price', features:['All review platforms connected','Unlimited leads','Featured placement in search','Respond to reviews','Analytics dashboard','Priority support'], cta:'Start Pro Trial', href:'/signup?role=trainer&plan=pro', featured:true },
              { name:'Elite', price:'$99', period:'/month', features:['Everything in Pro','Video testimonials','Homepage featured slot','CRM integrations','Dedicated account manager'], cta:'Go Elite', href:'/signup?role=trainer&plan=elite', featured:false },
            ].map((plan: any) => (
              <div key={plan.name} className={`rounded-2xl p-8 relative ${plan.featured ? 'bg-[#03243F] text-white ring-4 ring-[#18A96B]' : 'bg-gray-50'}`}>
                {plan.featured && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#18A96B] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">Most Popular</div>}
                <h3 className={`text-xl font-bold mb-1 ${plan.featured ? 'text-white' : 'text-[#03243F]'}`}>{plan.name}</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-bold ${plan.featured ? 'text-white' : 'text-[#03243F]'}`}>{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.featured ? 'text-gray-300' : 'text-gray-400'}`}>{plan.period}</span>
                </div>
                {plan.founding && <p className="text-[#F4A636] text-sm font-semibold mb-4">{plan.founding}</p>}
                <ul className="space-y-2 mb-8 mt-4">
                  {plan.features.map((f: string) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.featured ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-[#18A96B] mt-0.5 flex-shrink-0">&#10003;</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`block text-center py-3 rounded-xl font-semibold transition-colors ${plan.featured ? 'bg-[#18A96B] text-white hover:bg-[#15906A]' : 'bg-[#03243F] text-white hover:bg-[#04305a]'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#03243F] mb-10 text-center" style={{fontFamily:'Playfair Display'}}>Common Questions</h2>
          <div className="space-y-6">
            {[
              {q:"Is my profile already on MyTrustedTrainer?", a:"If you have a Google Business profile, Yelp listing, or Facebook page as a trainer in College Station, your basic info may already be here. Sign up to claim and customize it."},
              {q:"How do I get more leads?", a:"Pro and Elite trainers appear at the top of search results and are featured on the homepage. Keeping your profile complete, verified, and active significantly increases your visibility."},
              {q:"What is the Founding Trainer offer?", a:"The first 25 trainers who subscribe to Pro get their rate locked at $29/month for as long as they stay subscribed — even after we raise prices. This is a one-time offer for early adopters."},
              {q:"Can I cancel anytime?", a:"Yes. No contracts, no cancellation fees. Cancel anytime from your dashboard."},
              {q:"How do I connect my Google reviews?", a:"After signing up, go to your dashboard and follow the guided steps to connect your Google Business profile. Your reviews will be imported automatically."},
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6">
                <h3 className="font-bold text-[#03243F] mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-[#03243F] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{fontFamily:'Playfair Display'}}>Ready to Grow Your Client Base?</h2>
          <p className="text-gray-300 mb-8">Join the trainers already using MyTrustedTrainer to get discovered in College Station.</p>
          <Link href="/signup?role=trainer" className="bg-[#18A96B] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#15906A] inline-block transition-colors">
            Create Your Free Profile &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#02192d] text-gray-400 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white font-bold" style={{fontFamily:'Playfair Display'}}>
            <span className="text-[#18A96B]">My</span>TrustedTrainer
          </span>
          <div className="flex gap-6 text-sm">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/search" className="hover:text-white">Find Trainers</Link>
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
          <p className="text-sm">&copy; 2026 MyTrustedTrainer</p>
        </div>
      </footer>
    </div>
  )
}
