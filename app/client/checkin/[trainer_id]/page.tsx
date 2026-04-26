'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, CheckCircle } from 'lucide-react'

const STEPS = [
  {
    key: 'energy_rating' as const,
    title: 'Energy this week',
    labels: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
  },
  {
    key: 'session_rating' as const,
    title: 'Session quality',
    labels: ['Poor', 'Fair', 'Good', 'Great', 'Excellent'],
  },
  {
    key: 'response_speed_rating' as const,
    title: 'Trainer response speed',
    labels: ['Very Slow', 'Slow', 'Average', 'Fast', 'Very Fast'],
  },
  {
    key: 'communication_rating' as const,
    title: 'Communication quality',
    labels: ['Poor', 'Fair', 'Good', 'Great', 'Excellent'],
  },
]

type RatingKey = (typeof STEPS)[number]['key']

function StarSelector({
  value,
  onChange,
  labels,
}: {
  value: number
  onChange: (v: number) => void
  labels: string[]
}) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  return (
    <div>
      <div className="flex gap-3 justify-center my-6">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={`w-10 h-10 transition-colors ${
                n <= active ? 'text-[#F4A636] fill-[#F4A636]' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="text-center text-sm text-slate-500 font-medium h-5">{labels[active - 1]}</p>
      )}
    </div>
  )
}

export default function CheckinPage({ params }: { params: { trainer_id: string } }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [ratings, setRatings] = useState<Partial<Record<RatingKey, number>>>({})
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [trainerName, setTrainerName] = useState('')
  const [privacyAcked, setPrivacyAcked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      if (localStorage.getItem('mtt_checkin_privacy_acked')) setPrivacyAcked(true)
    } catch {}
    fetch(`/api/trainer-name/${params.trainer_id}`)
      .then((r) => r.json())
      .then((d) => setTrainerName(d.name ?? 'your trainer'))
      .catch(() => setTrainerName('your trainer'))
      .finally(() => setLoading(false))
  }, [params.trainer_id])

  const acknowledgePrivacy = () => {
    try { localStorage.setItem('mtt_checkin_privacy_acked', '1') } catch {}
    setPrivacyAcked(true)
  }

  const currentStep = STEPS[step]
  const isLastStep = step === STEPS.length - 1

  const setRating = (key: RatingKey, value: number) =>
    setRatings((prev) => ({ ...prev, [key]: value }))

  const submit = async () => {
    if (!ratings[currentStep.key]) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ratings, notes: notes || null, trainer_id: params.trainer_id }),
      })
      if (res.ok) { setDone(true) }
      else { const d = await res.json(); alert(d.error || 'Failed to submit.') }
    } catch { alert('Something went wrong. Please try again.') }
    setSubmitting(false)
  }

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#18A96B] border-t-transparent rounded-full animate-spin" />
      </div>
    )

  if (done)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center">
          <CheckCircle className="w-14 h-14 text-[#18A96B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#03243F] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Check-in submitted!
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Thanks for the rating. Your feedback helps improve your match and powers trainer badges.
          </p>
          <button
            onClick={() => router.push('/client/dashboard/checkins')}
            className="w-full py-3 bg-[#18A96B] hover:bg-[#159a5f] text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      {!privacyAcked ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-md w-full">
          <h1 className="text-xl font-bold text-[#03243F] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your ratings are private
          </h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Your individual ratings are completely private and anonymous. Your trainer only sees
            aggregate scores across all clients — never your specific ratings.
          </p>
          <button
            onClick={acknowledgePrivacy}
            className="w-full py-3 bg-[#18A96B] hover:bg-[#159a5f] text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Got it — Start Check-in
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-md w-full">
          <div className="flex gap-1 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[#18A96B]' : 'bg-slate-200'}`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400 font-medium mb-1">Step {step + 1} of {STEPS.length}</p>
          <h1 className="text-xl font-bold text-[#03243F]" style={{ fontFamily: 'Playfair Display, serif' }}>
            How was your week with {trainerName}?
          </h1>
          <p className="text-sm font-semibold text-[#03243F] mt-5">{currentStep.title}</p>
          <StarSelector
            value={ratings[currentStep.key] ?? 0}
            onChange={(v) => setRating(currentStep.key, v)}
            labels={currentStep.labels}
          />
          {isLastStep ? (
            <>
              <div className="mt-6">
                <p className="text-sm font-semibold text-[#03243F] mb-2">
                  Anything else?{' '}
                  <span className="text-slate-400 font-normal text-xs">(optional, private)</span>
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes about your week..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30 resize-none"
                />
              </div>
              <button
                onClick={submit}
                disabled={!ratings[currentStep.key] || submitting}
                className="mt-4 w-full py-3 bg-[#18A96B] hover:bg-[#159a5f] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Check-in'}
              </button>
            </>
          ) : (
            <button
              onClick={() => ratings[currentStep.key] && setStep((s) => s + 1)}
              disabled={!ratings[currentStep.key]}
              className="mt-8 w-full py-3 bg-[#03243F] hover:bg-[#04304f] disabled:opacity-40 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
