'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// âââ QuizCompletionBanner âââââââââââââââââââââââââââââââââââââââââââââââââââââ
// Shown to logged-in clients who haven't completed the compatibility quiz.
// Dismissible per-session (localStorage key: mtt_quiz_banner_dismissed).
// Checks /api/onboarding/client on mount â renders nothing if already complete.

export default function QuizCompletionBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Don't show if dismissed this session
    if (sessionStorage.getItem('mtt_quiz_banner_dismissed')) return

    async function check() {
      try {
        const res = await fetch('/api/onboarding/client')
        if (!res.ok) return // unauthenticated or error â stay hidden
        const data = await res.json()
        if (!data.compatibility_complete) {
          setShow(true)
        }
      } catch {
        // non-fatal â stay hidden
      }
    }
    check()
  }, [])

  function dismiss() {
    sessionStorage.setItem('mtt_quiz_banner_dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="w-full bg-[#18A96B] px-4 py-3 font-[Outfit]">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p className="text-white text-sm font-medium">
          <span className="font-bold">Complete your compatibility quiz</span>
          {' '}â it takes 3 minutes and unlocks your personalized trainer matches.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/onboarding/client"
            className="bg-white text-[#18A96B] font-semibold text-sm px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
          >
            Take the quiz â
          </Link>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-white/70 hover:text-white transition-colors text-lg leading-none"
          >
            â
          </button>
        </div>
      </div>
    </div>
  )
}
