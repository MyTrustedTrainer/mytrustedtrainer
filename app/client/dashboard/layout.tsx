import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, Dumbbell, CheckSquare, MessageSquare, Settings, Star } from 'lucide-react'

const navItems = [
  { href: '/client/matches', label: 'My Matches', icon: Star },
  { href: '/client/dashboard/saved', label: 'Saved Trainers', icon: Heart },
  { href: '/client/dashboard/my-program', label: 'My Program', icon: Dumbbell },
  { href: '/client/dashboard/checkins', label: 'Check-ins', icon: CheckSquare },
  { href: '/client/dashboard/inquiries', label: 'Inquiries', icon: MessageSquare },
  { href: '/client/dashboard/settings', label: 'Settings', icon: Settings },
]

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/client/dashboard')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-[#03243F] min-h-screen pt-8 pb-6 px-3 shrink-0">
        <p
          className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mb-4"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          My Dashboard
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white text-sm font-medium transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#03243F] z-50 flex justify-around items-center py-2 border-t border-white/10">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white px-2 py-1 transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-medium">{label.split(' ')[0]}</span>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
    </div>
  )
}
