'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SiteHeaderProps {
  showBack?: boolean
}

export default function SiteHeader({ showBack }: SiteHeaderProps) {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('trainer_profiles')
          .select('full_name, slug, avatar_url, plan')
          .eq('user_id', user.id)
          .single()
          .then(({ data }) => setProfile(data))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setMenuOpen(false)
    router.push('/')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const profileHref = profile?.slug ? '/trainers/' + profile.slug : '/dashboard/trainer'

  return (
    <nav className="bg-[#03243F] text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Left: logo + optional back link stacked */}
        <div className="flex flex-col flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-[#18A96B] text-white text-xs font-bold px-2 py-1 rounded">MTT</span>
            <span className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}>MyTrustedTrainer</span>
          </Link>
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-gray-400 hover:text-white text-xs mt-1 text-left transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
        </div>

        {/* Right: auth section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <div className="relative flex items-center gap-2" ref={menuRef}>

              {/* Avatar — clicking goes directly to profile page */}
              <Link
                href={profileHref}
                className="w-9 h-9 rounded-full bg-[#18A96B] flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white/20 hover:border-white/60 transition-colors"
                aria-label="View my profile"
              >
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-white text-sm font-bold">{initials}</span>
                }
              </Link>

              {/* Hamburger — clicking opens the dropdown menu */}
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-[#03243F] truncate">{profile?.full_name || user.email}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    {profile?.plan && (
                      <span className={"mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium " + (profile.plan === 'elite' ? 'bg-purple-100 text-purple-700' : profile.plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500')}>
                        {profile.plan.toUpperCase()} PLAN
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    {profile?.slug && (
                      <Link href={'/trainers/' + profile.slug} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <span>&#x1F464;</span> View My Profile
                      </Link>
                    )}
                    <Link href="/dashboard/trainer" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <span>&#x1F4CA;</span> Dashboard
                    </Link>
                    <Link href="/dashboard/trainer/edit" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <span>&#x270F;&#xFE0F;</span> Edit Profile
                    </Link>
                    <Link href="/for-trainers" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <span>&#x2B06;&#xFE0F;</span> Upgrade Plan
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <span>&#x1F6AA;</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/search" className="text-gray-300 hover:text-white text-sm font-medium hidden sm:block">Find Trainers</Link>
              <Link href="/for-trainers" className="text-gray-300 hover:text-white text-sm font-medium hidden sm:block">For Trainers</Link>
              <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium border border-gray-500 px-4 py-1.5 rounded-lg hover:border-white">Log In</Link>
              <Link href="/signup" className="bg-[#18A96B] text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-[#15906A]">Sign Up</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}
