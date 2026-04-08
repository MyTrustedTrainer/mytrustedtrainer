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

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    const role = data.user?.user_metadata?.role
    if (role === 'trainer') {
      router.push('/dashboard/trainer')
    } else if (role === 'client') {
      router.push('/dashboard/client')
    } else {
      router.push('/onboarding/role')
    }
  }

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/auth/callback' }
    })
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
            <h1 className="text-3xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>Welcome back</h1>
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
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 mb-4 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <div className="relative flex items-center mb-4">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="px-3 text-sm text-gray-400">or</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required
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
              </>
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
