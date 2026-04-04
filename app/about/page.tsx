import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#03243F] mb-6" style={{fontFamily:'Playfair Display'}}>About MyTrustedTrainer</h1>
        <div className="space-y-5 text-gray-700 text-lg">
          <p>MyTrustedTrainer was built with one mission: make it easy for anyone in College Station to find a personal trainer they can genuinely trust.</p>
          <p>We aggregate reviews from Google, Yelp, and Facebook into a single transparent score for every trainer. No cherry-picking. No paid placement. Just honest data that helps clients make better decisions.</p>
          <p>We launched in College Station because we believe in this community. Texas A&amp;M students, faculty, and the broader Brazos Valley deserve better tools to find the fitness professionals who can help them reach their goals.</p>
        </div>
        <div className="mt-10 flex gap-4">
          <Link href="/search" className="bg-[#18A96B] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#15906A]">Find a Trainer</Link>
          <Link href="/contact" className="border-2 border-[#03243F] text-[#03243F] px-6 py-3 rounded-xl font-semibold">Contact Us</Link>
        </div>
      </div>
    </div>
  )
}
