'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [type, setType] = useState<'client'|'trainer'>('client')
  const [step, setStep] = useState(1)

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-[#03243F] text-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-[#18A96B] text-xl font-bold font-[Playfair_Display,serif]">MyTrustedTrainer</Link>
        <Link href="/login" className="text-gray-300 hover:text-white text-sm">Already have an account? Log in</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-[#03243F] font-[Playfair_Display,serif] mb-2 text-center">Create Your Account</h1>
          <p className="text-gray-500 text-sm text-center mb-6">Join thousands in College Station</p>

          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
            <button onClick={() => setType('client')} className={`flex-1 py-2.5 text-sm font-semibold transition-all ${type === 'client' ? 'bg-[#03243F] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>I am a Client</button>
            <button onClick={() => setType('trainer')} className={`flex-1 py-2.5 text-sm font-semibold transition-all ${type === 'trainer' ? 'bg-[#03243F] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>I am a Trainer</button>
          </div>

          <div className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
            <input type="email" placeholder="Email Address" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
            <input type="password" placeholder="Password" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
            {type === 'trainer' && <input type="text" placeholder="Your Specialty (e.g. Strength & Conditioning)" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />}
            <button className="w-full bg-[#18A96B] hover:bg-[#13875A] text-white font-bold py-3 rounded-xl transition-all">
              Create Account Free
            </button>
          </div>
          <p className="text-center text-gray-400 text-xs mt-4">By signing up you agree to our <Link href="/terms" className="text-[#18A96B]">Terms</Link> and <Link href="/privacy" className="text-[#18A96B]">Privacy Policy</Link>.</p>
        </div>
      </div>
    </main>
  )
}