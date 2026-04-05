'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'

const SECTIONS = [
  {
    id: 'specializations',
    label: 'Your Specializations',
    description: 'What types of clients and goals do you specialize in?',
    type: 'multi',
    options: [
      'Weight loss / fat burning',
      'Muscle building / strength',
      'Endurance / cardio',
      'Flexibility / mobility',
      'Sports performance',
      'General fitness & wellness',
      'Post-injury rehabilitation',
      'Senior fitness',
      'Youth / teen fitness',
      'Pre/postnatal fitness',
    ],
  },
  {
    id: 'availability',
    label: 'Your Availability',
    description: 'When are you regularly available to train clients?',
    type: 'multi',
    options: [
      'Early mornings (5–8am)',
      'Mid-morning (8–11am)',
      'Midday (11am–1pm)',
      'Afternoon (1–5pm)',
      'Evenings (5–8pm)',
      'Late evenings (8pm+)',
      'Weekends',
    ],
  },
  {
    id: 'coaching_style',
    label: 'Your Coaching Style',
    description: 'How would you describe your training approach?',
    type: 'single',
    options: [
      'High energy, motivational & pushing clients hard',
      'Calm, educational & focused on technique',
      'Flexible — adapts to how clients feel each session',
      'Strict structure with clear programs',
      'Partner-style, figure it out together',
    ],
  },
  {
    id: 'preferred_location',
    label: 'Where You Train',
    description: 'Where do you prefer to conduct sessions?',
    type: 'single',
    options: [
      'Commercial gym (specific gym)',
      'Any commercial gym',
      'Client home / my studio',
      'Outdoors / parks',
      'Online / remote coaching',
      'No preference',
    ],
  },
  {
    id: 'experience_level',
    label: 'Client Experience Level',
    description: 'What experience level do you work best with?',
    type: 'single',
    options: [
      'Complete beginners',
      'Beginner to intermediate',
      'Intermediate to advanced',
      'Advanced / competitive',
      'All levels',
    ],
  },
  {
    id: 'communication_style',
    label: 'Communication Style',
    description: 'How do you prefer to communicate with clients between sessions?',
    type: 'single',
    options: [
      'Mostly in-person, minimal texting',
      'Regular check-ins via text/app between sessions',
      'Detailed written programs sent in advance',
      'Video calls for form checks and planning',
      'Whatever works for the client',
    ],
  },
]

export default function TrainerCompatibilityPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const section = SECTIONS[step]
  const totalSteps = SECTIONS.length
  const current = answers[section.id] || []

  function toggleOption(option: string) {
    if (section.type === 'single') {
      setAnswers((a) => ({ ...a, [section.id]: [option] }))
    } else {
      setAnswers((a) => {
        const prev = a[section.id] || []
        return {
          ...a,
          [section.id]: prev.includes(option)
            ? prev.filter((o) => o !== option)
            : [...prev, option],
        }
      })
    }
  }

  function canProceed() {
    return (answers[section.id] || []).length > 0
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/onboarding/trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/dashboard/trainer?tab=compatibility&saved=1')
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
        <div className="w-full max-w-xl mb-8">
          <h1 className="font-[Playfair_Display] text-3xl font-bold text-white mb-2">
            Compatibility Profile
          </h1>
          <p className="text-white/60 text-sm mb-6">
            Help clients find you. These answers power your match scores.
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#18A96B] text-sm font-medium">
              {step + 1} / {totalSteps}
            </span>
            <span className="text-white/40 text-sm">
              {Math.round(((step + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#18A96B] rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="w-full max-w-xl bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="font-[Playfair_Display] text-xl font-bold text-[#03243F] mb-1">
            {section.label}
          </h2>
          <p className="text-slate-500 text-sm mb-6">{section.description}</p>

          <div className="space-y-3">
            {section.options.map((option) => {
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
                      className={`w-5 h-5 rounded-${section.type === 'single' ? 'full' : 'sm'} border-2 flex-shrink-0 flex items-center justify-center ${
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
                className="text-slate-500 hover:text-slate-700 font-medium"
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
                {submitting ? 'Saving…' : 'Save Profile →'}
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
