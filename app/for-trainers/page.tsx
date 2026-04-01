import Link from 'next/link'

export default function ForTrainersPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="bg-[#03243F] text-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-[#18A96B] text-xl font-bold font-[Playfair_Display,serif]">MyTrustedTrainer</Link>
        <div className="flex gap-4">
          <Link href="/search" className="text-gray-300 hover:text-white text-sm">Find Trainers</Link>
          <Link href="/signup?type=trainer" className="bg-[#18A96B] hover:bg-[#13875A] text-white text-sm px-4 py-1.5 rounded-lg font-semibold">Get Started Free</Link>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-[#03243F] to-[#04305a] text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold font-[Playfair_Display,serif] mb-4">Grow Your Training Business in College Station</h1>
          <p className="text-gray-300 text-xl mb-8">Your reputation is your business. We put it front and center — reviews from Google, Yelp, and Facebook in one powerful profile that gets you found.</p>
          <Link href="/signup?type=trainer" className="bg-[#18A96B] hover:bg-[#13875A] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg">
            Claim Your Profile Free →
          </Link>
          <p className="text-gray-400 text-sm mt-4">⚡ First 25 trainers get Pro pricing locked at $29/month for life</p>
        </div>
      </section>

      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold font-[Playfair_Display,serif] text-[#03243F] mb-3">Everything You Need to Win More Clients</h2>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: '🔗', title: 'Connect All Your Reviews', desc: 'Link Google, Yelp, and Facebook. All your reviews in one profile.' },
            { icon: '📈', title: 'Get More Leads', desc: 'Clients discover you through search and send inquiries directly.' },
            { icon: '📊', title: 'Analytics Dashboard', desc: 'See who viewed your profile and what they searched for.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-[#03243F] text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 bg-white" id="pricing">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold font-[Playfair_Display,serif] text-[#03243F]">Simple, Transparent Pricing</h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { name: 'Free', price: '$0', features: ['Basic profile', '1 review platform', '3 leads/month'], cta: 'Start Free', highlight: false },
            { name: 'Pro', price: '$49/mo', badge: '🔥 Most Popular', features: ['All review platforms', 'Unlimited leads', 'Featured in search', 'Analytics', 'Respond to reviews'], cta: 'Start Pro', highlight: true },
            { name: 'Elite', price: '$99/mo', features: ['Everything in Pro', 'Video testimonials', 'Homepage featured', 'Dedicated support'], cta: 'Go Elite', highlight: false },
          ].map(plan => (
            <div key={plan.name} className={`rounded-2xl p-6 border-2 relative ${plan.highlight ? 'border-[#18A96B] shadow-xl' : 'border-gray-100 shadow-sm'}`}>
              {plan.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#18A96B] text-white text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</div>}
              <div className="font-bold text-[#03243F] text-xl mb-1">{plan.name}</div>
              <div className="text-3xl font-bold text-[#03243F] mb-4">{plan.price}</div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => <li key={f} className="text-sm text-gray-600 flex gap-2"><span className="text-[#18A96B] font-bold">✓</span>{f}</li>)}
              </ul>
              <Link href="/signup?type=trainer" className={`block w-full text-center font-bold py-3 rounded-xl transition-all ${plan.highlight ? 'bg-[#18A96B] hover:bg-[#13875A] text-white' : 'border-2 border-[#03243F] text-[#03243F] hover:bg-[#03243F] hover:text-white'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#03243F] text-white py-8 px-6 text-center">
        <Link href="/" className="text-[#18A96B] text-xl font-bold font-[Playfair_Display,serif]">MyTrustedTrainer</Link>
        <p className="text-gray-400 text-sm mt-2">© 2026 MyTrustedTrainer. College Station, TX.</p>
      </footer>
    </main>
  )
}