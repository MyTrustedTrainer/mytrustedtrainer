import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: April 1, 2026</p>
        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-[#03243F] mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including when you create an account, build a trainer profile, or contact a trainer. This may include your name, email address, phone number, fitness goals, and payment information.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#03243F] mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#03243F] mb-3">3. Review Aggregation</h2>
            <p>MyTrustedTrainer aggregates publicly available reviews from platforms including Google, Yelp, and Facebook. We display this information to help clients make informed decisions. If you are a trainer and believe your information is being displayed incorrectly, please contact us.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#03243F] mb-3">4. Data Security</h2>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access. We use Supabase for secure data storage with row-level security policies.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-[#03243F] mb-3">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@mytrustedtrainer.com" className="text-[#18A96B] hover:underline">support@mytrustedtrainer.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
