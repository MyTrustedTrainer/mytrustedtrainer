'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RoleSelectionPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      const role = user.user_metadata?.role
      if (role === 'trainer') {
        router.replace('/onboarding/trainer/1')
        return
      }
      if (role === 'client') {
        router.replace('/onboarding/client')
        return
      }
      setChecking(false)
    }
    checkRole()
  }, [router, supabase.auth])

  async function selectRole(role: 'trainer' | 'client') {
    setLoading(true)
    setError('')
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { error: updateError } = await supabase.auth.updateUser({
        data: { role }
      })
      if (updateError) throw updateError

      const profileTable = role === 'trainer' ? 'trainer_profiles' : 'client_profiles'
      const { error: insertError } = await supabase
        .from(profileTable)
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || ''
        }, { onConflict: 'id' })

      if (insertError) throw insertError

      if (role === 'trainer') {
        router.push('/onboarding/trainer/1')
      } else {
        router.push('/onboarding/client')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#03243F] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03243F] to-[#04305a] flex flex-col">
      <nav className="px-6 py-5">
        <Link href="/" className="text-2xl font-bold text-white" style={{fontFamily:'Playfair Display'}}>
          <span className="text-[#18A96B]">My</span>TrustedTrainer
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3" style={{fontFamily:'Playfair Display'}}>
              How are you using MyTrustedTrainer?
            </h1>
            <p className="text-blue-200 text-lg">Choose your path to get started</p>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-4 mb-6 text-center">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => selectRole('trainer')}
              disabled={loading}
              className="group bg-white rounded-3xl shadow-2xl p-8 text-left hover:shadow-3xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-[#18A96B]"
            >
              <div className="text-5xl mb-4">🏋</div>
              <h2 className="text-2xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>
                I am a Trainer
              </h2>
              <p className="text-gray-600 mb-4">
                I want to attract clients who are the right fit for my coaching style
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-[#18A96B] font-bold">+</span>
                  <span>Get matched with compatible clients</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-[#18A96B] font-bold">+</span>
                  <span>Receive qualified leads</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-[#18A96B] font-bold">+</span>
                  <span>Build your trusted reputation</span>
                </div>
              </div>
              <div className="mt-6 w-full bg-[#18A96B] text-white py-3 rounded-xl font-semibold text-center group-hover:bg-[#15906A] transition-colors">
                {loading ? 'Setting up...' : 'Continue as Trainer'}
              </div>
            </button>
            <button
              onClick={() => selectRole('client')}
              disabled={loading}
              className="group bg-white rounded-3xl shadow-2xl p-8 text-left hover:shadow-3xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-[#F4A636]"
            >
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>
                I am Looking for a Trainer
              </h2>
              <p className="text-gray-600 mb-4">
                I want to find a trainer who truly understands my goals and how I work best
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-[#F4A636] font-bold">+</span>
                  <span>Get algorithmically matched</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-[#F4A636] font-bold">+</span>
                  <span>See compatibility scores</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-[#F4A636] font-bold">+</span>
                  <span>Find your perfect fit</span>
                </div>
              </div>
              <div className="mt-6 w-full bg-[#F4A636] text-white py-3 rounded-xl font-semibold text-center group-hover:bg-[#e09420] transition-colors">
                {loading ? 'Setting up...' : 'Continue as Client'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
