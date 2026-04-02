import Link from 'next/link'
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-[#03243F] text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}><span className="text-[#18A96B]">My</span>TrustedTrainer</Link>
          <Link href="/" className="text-gray-300 hover:text-white text-sm">Back to Home</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: April 1, 2026</p>
        <div className="space-y-6 text-gray-700">
          <section><h2 className="text-xl font-bold text-[#03243F] mb-2">1. Acceptance</h2><p>By using MyTrustedTrainer you agree to these terms. If you do not agree, do not use the service.</p></section>
          <section><h2 className="text-xl font-bold text-[#03243F] mb-2">2. Service</h2><p>We provide a platform to discover and connect with personal trainers. Clients browse for free. Trainers may pay for subscription plans to access lead generation features.</p></section>
          <section><h2 className="text-xl font-bold text-[#03243F] mb-2">3. Subscriptions</h2><p>Trainer plans are billed monthly and may be cancelled at any time. Founding Trainer pricing is locked for the first 25 qualifying subscribers.</p></section>
          <section><h2 className="text-xl font-bold text-[#03243F] mb-2">4. Contact</h2><p>Questions? <a href="mailto:support@mytrustedtrainer.com" className="text-[#18A96B] hover:underline">support@mytrustedtrainer.com</a></p></section>
        </div>
      </div>
    </div>
  )
}