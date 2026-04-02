'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard/trainer')
  }

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    const redirectTo = window.location.origin + '/auth/callback'
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
    if (error) { setError(error.message) } else { setMagicSent(true) }
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
            <h1 className="text-3xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>
              Welcome back
            </h1>
            <p className="text-gray-500 mb-8">Sign in to your account</p>

            {magicSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#03243F] mb-2">Check your email!</h3>
                <p className="text-gray-600">We sent a magic link to <strong>{email}</strong></p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Password" required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full bg-[#18A96B] text-white py-3.5 rounded-xl font-semibold hover:bg-[#15906A] disabled:opacity-50 transition-colors">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="relative flex items-center">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="px-3 text-sm text-gray-400">or</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>

                <button type="button" onClick={handleMagicLink} disabled={loading}
                  className="w-full border-2 border-[#03243F] text-[#03243F] py-3.5 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  Send Magic Link
                </button>
              </form>
            )}

            <p className="text-center text-gray-500 text-sm mt-6">
              Do not have an account yet?{' '}
              <Link href="/signup" className="text-[#18A96B] font-semibold hover:underline">Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}