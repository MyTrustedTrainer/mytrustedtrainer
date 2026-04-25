'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, MessageSquare, Award, BarChart2,
  UserCheck, User, CreditCard, Menu, X,
} from 'lucide-react'

interface TrainerInfo {
  id: string
  full_name: string | null
  profile_photo_url: string | null
  plan_tier: string | null
  slug: string | null
}

const NAV = [
  { href: '/dashboard/trainer', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/trainer/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/trainer/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/trainer/badges', label: 'Badges', icon: Award },
  { href: '/dashboard/trainer/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/trainer/clients', label: 'Active Clients', icon: UserCheck, plans: ['growth', 'pro'] },
  { href: '/dashboard/trainer/profile', label: 'My Profile', icon: User },
  { href: '/dashboard/trainer/billing', label: 'Billing', icon: CreditCard },
]

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  free:   { label: 'FREE',   cls: 'bg-slate-500' },
  growth: { label: 'GROWTH', cls: 'bg-blue-500' },
  pro:    { label: 'PRO',    cls: 'bg-purple-500' },
}

export default function TrainerSidebar({ trainer }: { trainer: TrainerInfo }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const tier = trainer.plan_tier || 'free'
  const badge = PLAN_BADGE[tier] || PLAN_BADGE.free

  const isActive = (link: typeof NAV[0]) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href)

  const Content = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 flex-shrink-0">
        <img src="/logo.svg" alt="MTT" className="h-8 w-auto" />
        <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
          MyTrustedTrainer
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((link) => {
          const Icon = link.icon
          const active = isActive(link)
          const locked = link.plans && !link.plans.includes(tier)
          return (
            <Link
              key={link.href}
              href={locked ? '/dashboard/trainer/billing' : link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-[#18A96B] text-white'
                  : locked
                  ? 'text-white/30 hover:text-white/50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{link.label}</span>
              {locked && (
                <span className="text-[9px] bg-[#F4A636]/20 text-[#F4A636] px-1.5 py-0.5 rounded font-bold">
                  UPGRADE
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Trainer identity */}
      <div className="px-4 py-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {trainer.profile_photo_url ? (
            <img
              src={trainer.profile_photo_url}
              alt={trainer.full_name || ''}
              className="w-9 h-9 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#18A96B]/30 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(trainer.full_name || 'T')[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{trainer.full_name}</p>
            <span className={`inline-block text-[10px] font-bold text-white px-1.5 py-0.5 rounded ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#03243F] text-white p-2 rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#03243F] transform transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <Content />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex fixed inset-y-0 left-0 w-60 bg-[#03243F] flex-col z-30">
        <Content />
      </div>
    </>
  )
}
