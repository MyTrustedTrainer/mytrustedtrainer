'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TOTAL_STEPS = 6

const TRAINING_FORMATS = ['In-Person', 'Virtual', 'Outdoor', 'Group', 'Corporate']

const COACHING_APPROACHES = [
  { id: 'drill_sergeant', label: 'Drill Sergeant', desc: 'High intensity, no excuses. You push clients hard.' },
  { id: 'supportive_coach', label: 'Supportive Coach', desc: 'Encouraging, positive reinforcement. Meet clients where they are.' },
  { id: 'accountability_partner', label: 'Accountability Partner', desc: 'Check-ins, follow-ups. Keeping clients on track.' },
  { id: 'educator', label: 'Educator', desc: 'Teaching the why. Clients leave knowing more each session.' },
]

const MISSED_SESSION_RESPONSES = [
  { id: 'within_hour', label: 'Follow up within the hour' },
  { id: 'check_in_day', label: 'Check in that day' },
  { id: 'wait_for_them', label: 'Wait for them to reach out' },
  { id: 'next_session', label: 'Address it at the next session' },
]

const SESSION_STRUCTURES = [
  { id: 'highly_structured', label: 'Highly structured', desc: 'Same format every time. Clients know what to expect.' },
  { id: 'flexible', label: 'Flexible based on the client', desc: 'Adapted day-to-day based on energy, mood, progress.' },
  { id: 'mix', label: 'Mix of both', desc: 'A framework with room to breathe.' },
]

const MOTIVATION_APPROACHES = [
  { id: 'data', label: 'Data and measurable progress', desc: 'Numbers, metrics, tracking.' },
  { id: 'encouragement', label: 'Personal encouragement', desc: 'Belief in them. Being in their corner.' },
  { id: 'challenge', label: 'Challenging them', desc: 'Pushing limits. Not letting them settle.' },
  { id: 'wins', label: 'Celebrating small wins', desc: 'Every bit of progress matters.' },
]

const RESPONSE_TIMES = [
  { id: 'within_1hr', label: 'Within 1 hour' },
  { id: 'within_4hr', label: 'Within 4 hours' },
  { id: 'same_day', label: 'Same day' },
  { id: 'next_day', label: 'Next day' },
]

const CHECKIN_FREQUENCIES = [
  { id: 'daily', label: 'Daily' },
  { id: 'every_few_days', label: 'Every few days' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'when_they_reach_out', label: 'When they reach out' },
]

const COMM_CHANNELS = [
  { id: 'in_app', label: 'In-app messaging' },
  { id: 'text', label: 'Text / SMS' },
  { id: 'email', label: 'Email' },
  { id: 'client_preference', label: 'Whatever the client prefers' },
]

const SPECIALTIES = [
  'Weight Loss', 'Muscle Building', 'Athletic Performance', 'Mobility', 'Rehabilitation',
  'Nutrition', 'Senior Fitness', 'Pre/Postnatal', 'Youth', 'HIIT', 'Yoga', 'Powerlifting',
  'Running', 'Flexibility',
]

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    badge: null,
    features: ['Claim your profile', 'Appear in match results', 'First lead free', '$15 per lead after that'],
    cta: 'Start Free',
    border: 'border-slate-200',
    ctaBg: 'bg-[#03243F] text-white hover:bg-[#041f33]',
    founding: null,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$49',
    period: '/mo',
    badge: 'Most Popular',
    features: ['Unlimited leads', 'CRM for up to 5 clients', 'All Free features'],
    cta: 'Start Growth',
    border: 'border-[#18A96B]',
    ctaBg: 'bg-[#18A96B] text-white hover:bg-[#148f58]',
    founding: 'Founding rate: $29/mo for life â first 25 trainers',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$99',
    period: '/mo',
    badge: null,
    features: ['Unlimited clients', 'Onboard existing clients', 'Priority placement', 'All Growth features'],
    cta: 'Start Pro',
    border: 'border-[#F4A636]',
    ctaBg: 'bg-[#F4A636] text-[#03243F] hover:bg-[#e09528]',
    founding: null,
  },
]

const STEP_LABELS = ['Basics', 'Coaching Style', 'Communication', 'Specialties', 'Ideal Client', 'Your Plan']

// ---- CARD SELECT ----

function CardSelect({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string; desc?: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const sel = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={
              'w-full text-left p-4 rounded-xl border-2 transition-all ' +
              (sel ? 'border-[#18A96B] bg-green-50 shadow-sm' : 'border-slate-200 hover:border-slate-300')
            }
          >
            <div className="flex items-start gap-3">
              <div
                className={
                  'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ' +
                  (sel ? 'border-[#18A96B] bg-[#18A96B]' : 'border-slate-300')
                }
              >
                {sel && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <div className="font-semibold text-[#03243F] text-sm">{opt.label}</div>
                {opt.desc && <div className="text-slate-500 text-xs mt-0.5">{opt.desc}</div>}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ---- STEP COMPONENTS ----

function Step1({
  fullName, setFullName,
  city, setCity,
  stateAbbr, setStateAbbr,
  price, setPrice,
  formats, setFormats,
}: {
  fullName: string; setFullName: (v: string) => void
  city: string; setCity: (v: string) => void
  stateAbbr: string; setStateAbbr: (v: string) => void
  price: string; setPrice: (v: string) => void
  formats: string[]; setFormats: (v: string[]) => void
}) {
  return (
    <div className="p-8 space-y-5">
      <div>
        <h2 className="font-[Playfair_Display] text-2xl font-bold text-[#03243F] mb-1">The basics</h2>
        <p className="text-slate-500 text-sm">Let&apos;s start with who you are and how you work.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#03243F] mb-1.5">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[#03243F] placeholder-slate-400 focus:outline-none focus:border-[#18A96B] focus:ring-1 focus:ring-[#18A96B] transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-[#03243F] mb-1.5">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="College Station"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[#03243F] placeholder-slate-400 focus:outline-none focus:border-[#18A96B] focus:ring-1 focus:ring-[#18A96B] transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#03243F] mb-1.5">State</label>
          <input
            type="text"
            value={stateAbbr}
            onChange={(e) => setStateAbbr(e.target.value.toUpperCase().slice(0, 2))}
            placeholder="TX"
            maxLength={2}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[#03243F] placeholder-slate-400 focus:outline-none focus:border-[#18A96B] focus:ring-1 focus:ring-[#18A96B] transition uppercase"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#03243F] mb-1.5">Price per session ($)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="65"
          min="1"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[#03243F] placeholder-slate-400 focus:outline-none focus:border-[#18A96B] focus:ring-1 focus:ring-[#18A96B] transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#03243F] mb-3">
          Training formats <span className="text-slate-400 font-normal">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {TRAINING_FORMATS.map((f) => {
            const sel = formats.includes(f)
            return (
              <button
                key={f}
                type="button"
                onClick={() =>
                  setFormats(sel ? formats.filter((x) => x !== f) : [...formats, f])
                }
                className={
                  'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ' +
                  (sel
                    ? 'border-[#18A96B] bg-green-50 text-[#03243F]'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300')
                }
              >
                {f}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Step2({
  coachingApproach, setCoachingApproach,
  missedSession, setMissedSession,
  sessionStructure, setSessionStructure,
  motivationApproach, setMotivationApproach,
}: {
  coachingApproach: string; setCoachingApproach: (v: string) => void
  missedSession: string; setMissedSession: (v: string) => void
  sessionStructure: string; setSessionStructure: (v: string) => void
  motivationApproach: string; setMotivationApproach: (v: string) => void
}) {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="font-[Playfair_Display] text-2xl font-bold text-[#03243F] mb-1">Your coaching identity</h2>
        <p className="text-slate-500 text-sm">These answers power your compatibility scores with every potential client.</p>
      </div>
      <div>
        <p className="font-semibold text-[#03243F] mb-3 text-sm">Your coaching approach:</p>
        <CardSelect options={COACHING_APPROACHES} value={coachingApproach} onChange={setCoachingApproach} />
      </div>
      <div>
        <p className="font-semibold text-[#03243F] mb-3 text-sm">When a client misses a session without notice, you:</p>
        <CardSelect options={MISSED_SESSION_RESPONSES} value={missedSession} onChange={setMissedSession} />
      </div>
      <div>
        <p className="font-semibold text-[#03243F] mb-3 text-sm">Your sessions are typically:</p>
        <CardSelect options={SESSION_STRUCTURES} value={sessionStructure} onChange={setSessionStructure} />
      </div>
      <div>
        <p className="font-semibold text-[#03243F] mb-3 text-sm">You motivate clients through:</p>
        <CardSelect options={MOTIVATION_APPROACHES} value={motivationApproach} onChange={setMotivationApproach} />
      </div>
    </div>
  )
}

function Step3({
  responseTime, setResponseTime,
  checkinFreq, setCheckinFreq,
  commChannel, setCommChannel,
}: {
  responseTime: string; setResponseTime: (v: string) => void
  checkinFreq: string; setCheckinFreq: (v: string) => void
  commChannel: string; setCommChannel: (v: string) => void
}) {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="font-[Playfair_Display] text-2xl font-bold text-[#03243F] mb-1">Communication style</h2>
        <p className="text-slate-500 text-sm">Clients match with trainers whose communication fits their expectations.</p>
      </div>
      <div>
        <p className="font-semibold text-[#03243F] mb-3 text-sm">How quickly do you typically respond to clients?</p>
        <CardSelect options={RESPONSE_TIMES} value={responseTime} onChange={setResponseTime} />
      </div>
      <div>
        <p className="font-semibold text-[#03243F] mb-3 text-sm">How often do you proactively check in between sessions?</p>
        <CardSelect options={CHECKIN_FREQUENCIES} value={checkinFreq} onChange={setCheckinFreq} />
      </div>
      <div>
        <p className="font-semibold text-[#03243F] mb-3 text-sm">Preferred communication channel:</p>
        <CardSelect options={COMM_CHANNELS} value={commChannel} onChange={setCommChannel} />
      </div>
    </div>
  )
}

function Step4({
  specialties,
  setSpecialties,
  userId,
}: {
  specialties: string[]
  setSpecialties: (v: string[]) => void
  userId: string | null
}) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [certUploaded, setCertUploaded] = useState(false)

  async function handleCertUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = 'certifications/' + userId + '/' + Date.now() + '.' + ext
      const { error } = await supabase.storage
        .from('trainer-assets')
        .upload(path, file, { upsert: true })
      if (!error) setCertUploaded(true)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8">
      <h2 className="font-[Playfair_Display] text-2xl font-bold text-[#03243F] mb-1">Specialties</h2>
      <p className="text-slate-500 text-sm mb-6">Select every area you actively train clients in. This drives goal-based matching.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {SPECIALTIES.map((s) => {
          const sel = specialties.includes(s)
          return (
            <button
              key={s}
              type="button"
              onClick={() =>
                setSpecialties(sel ? specialties.filter((x) => x !== s) : [...specialties, s])
              }
              className={
                'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ' +
                (sel
                  ? 'border-[#18A96B] bg-green-50 text-[#03243F]'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300')
              }
            >
              {s}
            </button>
          )
        })}
      </div>

      <div className="border border-slate-200 rounded-xl p-5">
        <p className="font-semibold text-[#03243F] text-sm mb-1">
          Upload a certification{' '}
          <span className="text-slate-400 font-normal">(optional)</span>
        </p>
        <p className="text-xs text-slate-500 mb-3">PDF, JPG, or PNG â max 5MB. Adds a verified checkmark to your profile.</p>
        {certUploaded ? (
          <div className="flex items-center gap-2 text-sm text-[#18A96B] font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Certification uploaded
          </div>
        ) : (
          <label className="cursor-pointer inline-flex items-center gap-2 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:border-slate-300 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {uploading ? 'Uploadingâ¦' : 'Choose file'}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleCertUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  )
}

function Step5({
  idealClient, setIdealClient,
  successfulRelationship, setSuccessfulRelationship,
  workingWithMe, setWorkingWithMe,
}: {
  idealClient: string; setIdealClient: (v: string) => void
  successfulRelationship: string; setSuccessfulRelationship: (v: string) => void
  workingWithMe: string; setWorkingWithMe: (v: string) => void
}) {
  const prompts = [
    {
      label: 'Describe the client you do your absolute best work with.',
      value: idealClient,
      onChange: setIdealClient,
      placeholder: 'Think about the clients who energized you most. What did they have in common?',
    },
    {
      label: 'What does a successful trainer-client relationship look like to you?',
      value: successfulRelationship,
      onChange: setSuccessfulRelationship,
      placeholder: 'Communication, commitment, results â what does success actually look like?',
    },
    {
      label: "What should a potential client know about working with you that isn't on your resume?",
      value: workingWithMe,
      onChange: setWorkingWithMe,
      placeholder: 'Your style, your expectations, what makes working with you different.',
    },
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="font-[Playfair_Display] text-2xl font-bold text-[#03243F] mb-1">Your ideal client</h2>
        <p className="text-slate-500 text-sm">
          These answers help us match you with clients who are genuinely a good fit â not just nearby.
        </p>
      </div>
      {prompts.map(({&ìabel, value, onChange, placeholder }) => (
        <div key={label}>
          <label className="block text-sm font-semibold text-[#03243F] mb-2">{label}</label>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[#03243F] placeholder-slate-400 focus:outline-none focus:border-[#18A96B] focus:ring-1 focus:ring-[#18A96B] transition resize-none text-sm leading-relaxed"
          />
          <div className={'text-right text-xs mt-1 ' + (value.length < 10 ? 'text-slate-300' : 'text-[#18A96B]')}>
            {value.length} chars
          </div>
        </div>
      ))}
    </div>
  )
}

function Step6({ onSelectPlan, saving }: { onSelectPlan: (plan: string) => void; saving: boolean }) {
  return (
    <div className="p-8">
      <h2 className="font-[Playfair_Display] text-2xl font-bold text-[#03243F] mb-1">Choose your plan</h2>
      <p className="text-slate-500 text-sm mb-6">You can upgrade or change plans anytime. Clients never pay anything.</p>
      <div className="space-y-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className={'border-2 ' + plan.border + ' rounded-2xl p-5 relative'}>
            {plan.badge && (
              <span className="absolute -top-3 left-5 bg-[#18A96B] text-white text-xs font-bold px-3 py-1 rounded-full">
                {plan.badge}
              </span>
            )}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-[#03243F] text-lg">{plan.name}</div>
                {plan.founding && (
                  <div className="text-[#F4A636] text-xs font-semibold mt-0.5">{plan.founding}</div>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#03243F]">{plan.price}</span>
                <span className="text-slate-400 text-sm">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg
                    className="w-4 h-4 text-[#18A96B] flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => onSelectPlan(plan.id)}
              disabled={saving}
              className={'w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 ' + plan.ctaBg}
            >
              {saving ? 'Savingâ¦' : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- MAIN PAGE ----

export default function TrainerOnboardingPage({ params }: { params: { step: string } }) {
  const step = parseInt(params.step, 10)
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Step 1
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [stateAbbr, setStateAbbr] = useState('TX')
  const [price, setPrice] = useState('')
  const [formats, setFormats] = useState<string[]>([])

  // Step 2
  const [coachingApproach, setCoachingApproach] = useState('')
  const [missedSession, setMissedSession] = useState('')
  const [sessionStructure, setSessionStructure] = useState('')
  const [motivationApproach, setMotivationApproach] = useState('')

  // Step 3
  const [responseTime, setResponseTime] = useState('')
  const [checkinFreq, setCheckinFreq] = useState('')
  const [commChannel, setCommChannel] = useState('')

  // Step 4
  const [specialties, setSpecialties] = useState<string[]>([])

  // Step 5
  const [idealClient, setIdealClient] = useState('')
  const [successfulRelationship, setSuccessfulRelationship] = useState('')
  const [workingWithMe, setWorkingWithMe] = useState('')

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      try {
        const res = await fetch('/api/onboarding/trainer/step')
        if (res.ok) {
          const data = await res.json()
          const p = data.profile || {}
          const c = data.compatibility || {}
          const raw = (c.raw_answers as Record<string, string>) || {}

          if (p.full_name) setFullName(p.full_name)
          if (p.city) setCity(p.city)
          if (p.state) setStateAbbr(p.state)
          if (p.price_per_session) setPrice(String(p.price_per_session))
          if (p.training_formats?.length) setFormats(p.training_formats)

          if (raw.coaching_approach) setCoachingApproach(raw.coaching_approach)
          else if (c.coaching_style) setCoachingApproach(c.coaching_style)

          if (raw.missed_session) setMissedSession(raw.missed_session)
          if (raw.session_structure) setSessionStructure(raw.session_structure)
          if (raw.motivation_approach) setMotivationApproach(raw.motivation_approach)

          if (raw.response_time) setResponseTime(raw.response_time)
          else if (c.communication_style) setResponseTime(c.communication_style)

          if (raw.checkin_frequency) setCheckinFreq(raw.checkin_frequency)
          if (raw.comm_channel) setCommChannel(raw.comm_channel)

          if (c.specializations?.length) setSpecialties(c.specializations)
          if (raw.ideal_client) setIdealClient(raw.ideal_client)
          if (raw.successful_relationship) setSuccessfulRelationship(raw.successful_relationship)
          if (raw.working_with_me) setWorkingWithMe(raw.working_with_me)
        }
      } catch {
        // Non-fatal â form will be empty, user can fill it in
      }

      setLoading(false)
    }
    load()
  }, [])

  function canAdvance() {
    if (step === 1) return fullName.trim().length > 0 && city.trim().length > 0 && price.length > 0 && formats.length > 0
    if (step === 2) return !!(coachingApproach && missedSession && sessionStructure && motivationApproach)
    if (step === 3) return !!(responseTime && checkinFreq && commChannel)
    if (step === 4) return specialties.length > 0
    if (step === 5) return idealClient.trim().length >= 10 && successfulRelationship.trim().length >= 10 && workingWithMe.trim().length >= 10
    return false
  }

  async function saveAndAdvance() {
    setSaving(true)
    try {
      let body: Record<string, unknown> = { step }

      if (step === 1) {
        body.data = {
          full_name: fullName,
          city,
          state: stateAbbr,
          price_per_session: price ? parseInt(price, 10) : null,
          training_formats: formats,
        }
      } else if (step === 2) {
        body.data = {
          coaching_approach: coachingApproach,
          missed_session: missedSession,
          session_structure: sessionStructure,
          motivation_approach: motivationApproach,
        }
      } else if (step === 3) {
        body.data = {
          response_time: responseTime,
          checkin_frequency: checkinFreq,
          comm_channel: commChannel,
        }
      } else if (step === 4) {
        body.data = { specialties }
      } else if (step === 5) {
        body.data = {
          ideal_client: idealClient,
          successful_relationship: successfulRelationship,
          working_with_me: workingWithMe,
        }
      }

      const res = await fetch('/api/onboarding/trainer/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }

      router.push('/onboarding/trainer/' + (step + 1))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  async function selectPlan(planId: string) {
    setSaving(true)
    try {
      const res = await fetch('/api/onboarding/trainer/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 6, data: { plan_tier: planId } }),
      })
      if (!res.ok) throw new Error('Failed to save plan')

      if (planId === 'free') {
        router.push('/dashboard/trainer')
      } else {
        // Stripe checkout wired in Session 13 â placeholder redirect for now
        router.push('/dashboard/trainer?upgraded=' + planId)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      alert(msg)
      setSaving(false)
    }
  }

  if (!Number.isInteger(step) || step < 1 || step > 6) {
    router.push('/onboarding/trainer/1')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03243F] flex items-center justify-center">
        <div className="text-white text-lg font-[Outfit]">Loadingâ¦</div>
      </div>
    )
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <main className="min-h-screen bg-[#03243F] font-[Outfit] py-10 px-4">
      {/* Header */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.svg" alt="MTT" className="h-8 w-auto" />
          <span className="text-white font-[Playfair_Display] text-lg font-bold">MyTrustedTrainer</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#18A96B] text-sm font-semibold">
            Step {step} of {TOTAL_STEPS}: {STEP_LABELS[step - 1]}
          </span>
          <span className="text-white/40 text-sm">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#18A96B] rounded-full transition-all duration-500"
            style={{ width: progress + '%' }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {step === 1 && (
          <Step1
            fullName={fullName} setFullName={setFullName}
            city={city} setCity={setCity}
            stateAbbr={stateAbbr} setStateAbbr={setStateAbbr}
            price={price} setPrice={setPrice}
            formats={formats} setFormats={setFormats}
          />
        )}
        {step === 2 && (
          <Step2
            coachingApproach={coachingApproach} setCoachingApproach={setCoachingApproach}
            missedSession={missedSession} setMissedSession={setMissedSession}
            sessionStructure={sessionStructure} setSessionStructure={setSessionStructure}
            motivationApproach={motivationApproach} setMotivationApproach={setMotivationApproach}
          />
        )}
        {step === 3 && (
          <Step3
            responseTime={responseTime} setResponseTime={setResponseTime}
            checkinFreq={checkinFreq} setCheckinFreq={setCheckinFreq}
            commChannel={commChannel} setCommChannel={setCommChannel}
          />
        )}
        {step === 4 && (
          <Step4 specialties={specialties} setSpecialties={setSpecialties} userId={userId} />
        )}
        {step === 5 && (
          <Step5
            idealClient={idealClient} setIdealClient={setIdealClient}
            successfulRelationship={successfulRelationship} setSuccessfulRelationship={setSuccessfulRelationship}
            workingWithMe={workingWithMe} setWorkingWithMe={setWorkingWithMe}
          />
        )}
        {step === 6 && <Step6 onSelectPlan={selectPlan} saving={saving} />}

        {/* Navigation */}
        {step !== 6 && (
          <div className="flex items-center justify-between px-8 pb-8 pt-2">
            {step > 1 ? (
              <button
                onClick={() => router.push('/onboarding/trainer/' + (step - 1))}
                className="text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
              >
                â Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={saveAndAdvance}
              disabled={!canAdvance() || saving}
              className="bg-[#03243F] hover:bg-[#041f33] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              {saving ? 'Savingâ¦' : step === 5 ? 'Continue to Plan â' : 'Next â'}
            </button>
          </div>
        )}
      </div>

      {/* Skip link for already-onboarded trainers */}
      <div className="max-w-xl mx-auto mt-6 text-center">
        <button
          onClick={() => router.push('/dashboard/trainer')}
          className="text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          Skip for now â Go to dashboard
        </button>
      </div>
    </main>
  )
}
