'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const supabase = createClient()
  const router = useRouter()
  const [role, setRole] = useState<'trainer'|'client'>('trainer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if email already exists across any account type
    try {
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      const checkData = await checkRes.json()
      if (checkData.exists) {
        setError('An account with this email already exists. Please sign in instead.')
        setLoading(false)
        return
      }
    } catch {
      // If check fails, proceed with signup (Supabase will handle duplicates)
    }

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: name, role },
        emailRedirectTo: window.location.origin + '/auth/callback'
      }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03243F] to-[#04305a] flex flex-col">
      <nav className="px-6 py-5">
        <Link href="/" className="text-2xl font-bold text-white" style={{fontFamily:'Playfair Display'}}>
          <span className="text-[#18A96B]">My</span>TrustedTrainer
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>Check your email!</h2>
                <p className="text-gray-600">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>Create Account</h1>
                <p className="text-gray-500 mb-6">Join MyTrustedTrainer today</p>

                <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                  {(['trainer','client'] as const).map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        role === r ? 'bg-white shadow text-[#03243F]' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      {r === 'trainer' ? '🏋 I am a Trainer' : '🎯 Find a Trainer'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                      placeholder="John Smith"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="you@example.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="Min 8 characters" minLength={8}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                  </div>

                  {role === 'trainer' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-sm text-amber-800">
                        <strong>Founding Trainer Offer:</strong> First 25 trainers get Pro locked at $29/mo for life!
                      </p>
                    </div>
                  )}

                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {error && error.includes('already exists') && (
                    <p className="text-sm text-center">
                      <Link href="/login" className="text-[#18A96B] font-semibold hover:underline">Sign in to your existing account</Link>
                    </p>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-[#18A96B] text-white py-3.5 rounded-xl font-semibold hover:bg-[#15906A] disabled:opacity-50 transition-colors">
                    {loading ? 'Creating Account...' : 'Create Free Account'}
                  </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#18A96B] font-semibold hover:underline">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
