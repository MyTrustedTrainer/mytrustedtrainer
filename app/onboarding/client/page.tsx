'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'

const QUESTIONS = [
  {
    id: 'goals',
    question: 'What are your primary fitness goals?',
    type: 'multi',
    options: [
      'Lose weight / burn fat',
      'Build muscle / gain strength',
      'Improve endurance / cardio',
      'Improve flexibility / mobility',
      'Sport-specific performance',
      'General health & wellness',
      'Post-injury / rehabilitation',
    ],
  },
  {
    id: 'schedule',
    question: 'When are you available to train?',
    type: 'multi',
    options: [
      'Early mornings (5–8am)',
      'Mid-morning (8–11am)',
      'Midday (11am–1pm)',
      'Afternoon (1–5pm)',
      'Evenings (5–8pm)',
      'Late evenings (8pm+)',
      'Weekends only',
    ],
  },
  {
    id: 'coaching_style',
    question: 'What coaching style works best for you?',
    type: 'single',
    options: [
      'High energy, motivational & pushing me hard',
      'Calm, educational & focused on technique',
      'Flexible — adapts to how I feel each session',
      'Strict structure with clear programs',
      'Partner-style, we figure it out together',
    ],
  },
  {
    id: 'experience',
    question: 'What is your current experience level?',
    type: 'single',
    options: [
      'Complete beginner (never trained with a PT)',
      'Some experience (trained 1–2 years)',
      'Intermediate (3–5 years, solid foundation)',
      'Advanced (5+ years, competitive or serious)',
    ],
  },
  {
    id: 'location',
    question: 'Where do you prefer to train?',
    type: 'single',
    options: [
      'Commercial gym (prefer specific gym)',
      'Any commercial gym',
      'My home / client\'s home',
      'Outdoors / parks',
      'Online / remote coaching',
      'No preference',
    ],
  },
  {
    id: 'budget',
    question: 'What is your budget per session?',
    type: 'single',
    options: [
      'Under $40/session',
      '$40–$60/session',
      '$60–$80/session',
      '$80–$100/session',
      '$100+/session',
    ],
  },
  {
    id: 'gender_pref',
    question: 'Do you have a trainer gender preference?',
    type: 'single',
    options: [
      'No preference',
      'Prefer male trainer',
      'Prefer female trainer',
    ],
  },
  {
    id: 'communication',
    question: 'How do you like to communicate with your trainer?',
    type: 'single',
    options: [
      'Mostly in-person, minimal texting',
      'Regular check-ins via text/app between sessions',
      'Detailed written programs sent in advance',
      'Video calls for form checks and planning',
      'I\'m flexible — whatever works',
    ],
  },
]

export default function ClientOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const q = QUESTIONS[step]
  const totalSteps = QUESTIONS.length
  const current = answers[q.id] || []

  function toggleOption(option: string) {
    if (q.type === 'single') {
      setAnswers((a) => ({ ...a, [q.id]: [option] }))
    } else {
      setAnswers((a) => {
        const prev = a[q.id] || []
        return {
          ...a,
          [q.id]: prev.includes(option)
            ? prev.filter((o) => o !== option)
            : [...prev, option],
        }
      })
    }
  }

  function canProceed() {
    return (answers[q.id] || []).length > 0
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/onboarding/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/dashboard/client')
      } else {
        alert(data.error || 'Something went wrong')
        setSubmitting(false)
      }
    } catch {
      alert('Network error — please try again')
      setSubmitting(false)
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#03243F] flex flex-col items-center justify-center px-4 py-16 font-[Outfit]">
        {/* Progress */}
        <div className="w-full max-w-xl mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#18A96B] text-sm font-medium">
              Question {step + 1} of {totalSteps}
            </span>
            <span className="text-white/40 text-sm">
              {Math.round(((step + 1) / totalSteps) * 100)}% complete
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#18A96B] rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-xl bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="font-[Playfair_Display] text-2xl font-bold text-[#03243F] mb-2">
            {q.question}
          </h2>
          {q.type === 'multi' && (
            <p className="text-slate-500 text-sm mb-6">Select all that apply</p>
          )}
          {q.type === 'single' && (
            <p className="text-slate-500 text-sm mb-6">Choose one</p>
          )}

          <div className="space-y-3">
            {q.options.map((option) => {
              const selected = current.includes(option)
              return (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    selected
                      ? 'border-[#18A96B] bg-[#18A96B]/10 text-[#03243F] font-medium'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-${q.type === 'single' ? 'full' : 'sm'} border-2 flex-shrink-0 flex items-center justify-center ${
                        selected ? 'border-[#18A96B] bg-[#18A96B]' : 'border-slate-300'
                      }`}
                    >
                      {selected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {option}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}
            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="bg-[#03243F] hover:bg-[#041f33] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="bg-[#18A96B] hover:bg-[#148f58] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Finding your matches…' : 'See My Matches →'}
              </button>
            )}
          </div>
        </div>

        <p className="text-white/30 text-xs mt-8 text-center max-w-sm">
          Your answers are used only to compute match scores. We never sell your data.
        </p>
      </main>
    </>
  )
}
