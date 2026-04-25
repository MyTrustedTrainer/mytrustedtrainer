'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// âââ Question types âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

type QRapid = { id: string; phase: 1; question: string; a: string; b: string }
type QChoice = { id: string; phase: 2; question: string; options: string[] }
type QText   = { id: string; phase: 3; question: string; placeholder: string }
type AnyQ = QRapid | QChoice | QText

// âââ Question data ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const QUESTIONS: AnyQ[] = [
  // ââ Phase 1: Rapid fire â two options, auto-advance on tap ââââââââââââââââââ
  {
    id: 'q1_drive', phase: 1,
    question: 'When working out, you need:',
    a: 'Someone to push me hard',
    b: 'Support for what I already know I need',
  },
  {
    id: 'q2_motivation', phase: 1,
    question: 'What drives you most?',
    a: 'Data and measurable numbers',
    b: 'How I feel and how I look',
  },
  {
    id: 'q3_missed', phase: 1,
    question: 'If you miss a workout:',
    a: 'I want my trainer to check in on me',
    b: "I'll reach back out when I'm ready",
  },
  {
    id: 'q4_structure', phase: 1,
    question: 'Your ideal training style:',
    a: 'Tell me exactly what to do',
    b: 'Flexibility based on how I feel',
  },
  {
    id: 'q5_feedback', phase: 1,
    question: 'How do you want feedback?',
    a: 'Give it to me straight',
    b: 'Be encouraging even when I slip',
  },
  {
    id: 'q6_schedule', phase: 1,
    question: 'Your schedule is:',
    a: 'Very consistent and reliable',
    b: 'Life gets chaotic â I need flexibility',
  },
  {
    id: 'q7_comm', phase: 1,
    question: 'Between sessions:',
    a: 'I like frequent check-ins',
    b: 'I prefer to just show up and train',
  },
  {
    id: 'q8_challenge', phase: 1,
    question: 'Your biggest challenge:',
    a: 'Starting and staying consistent',
    b: 'Pushing hard enough when I am consistent',
  },

  // ââ Phase 2: Considered choice â 3â4 options, back button âââââââââââââââââââ
  {
    id: 'q9_goal', phase: 2,
    question: 'Primary fitness goal:',
    options: ['Lose weight', 'Build muscle', 'Athletic performance', 'General health'],
  },
  {
    id: 'q10_exp', phase: 2,
    question: 'Your experience level:',
    options: ['Complete beginner', 'Some experience', 'Moderately experienced', 'Advanced'],
  },
  {
    id: 'q11_freq', phase: 2,
    question: 'Realistic training frequency:',
    options: ['1â2x / week', '3x / week', '4â5x / week', 'Daily'],
  },
  {
    id: 'q12_rel', phase: 2,
    question: 'Ideal trainer relationship:',
    options: ['Strictly professional', 'Warm and personal', 'Somewhere between', 'Depends on the day'],
  },
  {
    id: 'q13_setback', phase: 2,
    question: 'When you hit a setback:',
    options: ['Need my trainer to re-motivate me', 'Process it myself', 'Analyze what went wrong', 'Go quiet for a while'],
  },
  {
    id: 'q14_budget', phase: 2,
    question: 'Budget per session:',
    options: ['Under $40', '$40â$70', '$70â$100', '$100+'],
  },
  {
    id: 'q15_format', phase: 2,
    question: 'Training format:',
    options: ['In-person only', 'Virtual only', 'Either works', 'Mix of both'],
  },
  {
    id: 'q16_matters', phase: 2,
    question: 'What matters most in a trainer:',
    options: ['Gets results fast', 'Keeps me accountable', 'Makes training enjoyable', 'Understands my specific needs'],
  },

  // ââ Phase 3: Open prompts â textarea, journal feel âââââââââââââââââââââââââââ
  {
    id: 'q17_obstacles', phase: 3,
    question: 'What has gotten in the way of your fitness goals in the past?',
    placeholder: 'Time, motivation, injury, not finding the right fitâ¦',
  },
  {
    id: 'q18_loyalty', phase: 3,
    question: 'What would make you stay with a trainer for years?',
    placeholder: 'Think about your best working relationships â what made them last?',
  },
  {
    id: 'q19_health', phase: 3,
    question: 'Anything about your health history or lifestyle a trainer should know upfront?',
    placeholder: 'Injuries, conditions, schedule constraints, anything relevantâ¦',
  },
  {
    id: 'q20_success', phase: 3,
    question: 'What does success look like for you 6 months from now?',
    placeholder: 'Be specific â the more detail, the better your matches.',
  },
]

const TOTAL = QUESTIONS.length // 20

// âââ Phase accent colours âââââââââââââââââââââââââââââââââââââââââââââââââââââ

const PHASE_COLOR = { 1: '#18A96B', 2: '#F4A636', 3: '#03243F' } as const
const PHASE_LABEL = { 1: 'Quick read', 2: 'Getting specific', 3: 'Your story' } as const

// âââ Main page ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export default function ClientQuizPage() {
  const router = useRouter()

  const [currentQ, setCurrentQ]     = useState(0)
  const [answers, setAnswers]        = useState<Record<string, string>>({})
  const [visible, setVisible]        = useState(true)
  const [animDir, setAnimDir]        = useState<'fwd' | 'back'>('fwd')
  const [loading, setLoading]        = useState(true)
  const [saving, setSaving]          = useState(false)
  const [done, setDone]              = useState(false)

  // ââ Load existing progress on mount âââââââââââââââââââââââââââââââââââââââââ

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/onboarding/client')
        if (res.ok) {
          const data = await res.json()
          const raw = data.raw_answers as Record<string, string> | null
          if (raw && Object.keys(raw).length > 0) {
            setAnswers(raw)
            // Resume from first unanswered question
            const firstUnanswered = QUESTIONS.findIndex((q) => !raw[q.id])
            setCurrentQ(firstUnanswered === -1 ? TOTAL - 1 : firstUnanswered)
          }
        }
      } catch { /* non-fatal â start fresh */ }
      setLoading(false)
    }
    load()
  }, [])

  // ââ Derived values âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

  const q           = QUESTIONS[currentQ]
  const phase       = q.phase
  const progressPct = Math.round(((currentQ + 1) / TOTAL) * 100)
  const accentColor = PHASE_COLOR[phase]
  const phaseLabel  = PHASE_LABEL[phase]

  // ââ Navigation helpers âââââââââââââââââââââââââââââââââââââââââââââââââââââââ

  function goTo(next: number, dir: 'fwd' | 'back' = 'fwd') {
    setAnimDir(dir)
    setVisible(false)
    setTimeout(() => {
      setCurrentQ(next)
      setVisible(true)
    }, 180)
  }

  async function persistProgress(ans: Record<string, string>, complete = false) {
    setSaving(true)
    try {
      await fetch('/api/onboarding/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: ans, complete }),
      })
    } catch { /* non-fatal */ }
    setSaving(false)
  }

  // ââ Phase 1: auto-advance on tap âââââââââââââââââââââââââââââââââââââââââââââ

  function pickPhase1(option: string) {
    const newAns = { ...answers, [q.id]: option }
    setAnswers(newAns)
    // Save every 5 questions (after Q5, Q10, Q15)
    if ((currentQ + 1) % 5 === 0 && currentQ < TOTAL - 1) {
      persistProgress(newAns)
    }
    if (currentQ < TOTAL - 1) {
      goTo(currentQ + 1)
    } else {
      finalize(newAns)
    }
  }

  // ââ Phase 2 & 3 navigation âââââââââââââââââââââââââââââââââââââââââââââââââââ

  function handleNext() {
    const newAns = { ...answers }
    if ((currentQ + 1) % 5 === 0 && currentQ < TOTAL - 1) {
      persistProgress(newAns)
    }
    if (currentQ < TOTAL - 1) {
      goTo(currentQ + 1)
    } else {
      finalize(newAns)
    }
  }

  function handleBack() {
    if (currentQ > 0) goTo(currentQ - 1, 'back')
  }

  async function finalize(ans = answers) {
    await persistProgress(ans, true)
    setDone(true)
    setTimeout(() => router.push('/client/matches'), 2000)
  }

  function canAdvance() {
    const val = answers[q.id] || ''
    if (phase === 3) return val.trim().length >= 10
    return val.length > 0
  }

  // ââ Done screen ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

  if (done) {
    return (
      <main className="min-h-screen bg-[#03243F] flex flex-col items-center justify-center px-4 font-[Outfit]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#18A96B] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="font-[Playfair_Display] text-3xl font-bold text-white mb-3">
            Building your matchesâ¦
          </h2>
          <p className="text-white/60 text-base">
            Finding trainers who fit how you think and train.
          </p>
        </div>
      </main>
    )
  }

  // ââ Loading ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

  if (loading) {
    return (
      <main className="min-h-screen bg-[#03243F] flex items-center justify-center font-[Outfit]">
        <div className="text-white/50">Loadingâ¦</div>
      </main>
    )
  }

  // ââ Main render ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

  return (
    <main className="min-h-screen bg-[#03243F] flex flex-col items-center justify-center px-4 py-12 font-[Outfit]">

      {/* ââ Header / progress ââ */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.svg" alt="MTT" className="h-8 w-auto" />
          <span className="text-white font-[Playfair_Display] text-lg font-bold">
            MyTrustedTrainer
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: accentColor }}>
            {phaseLabel} Â· Q{currentQ + 1} of {TOTAL}
          </span>
          <span className="text-white/40 text-sm">{progressPct}% complete</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, backgroundColor: accentColor }}
          />
        </div>
      </div>

      {/* ââ Question card â animated ââ */}
      <div
        className={`w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-[180ms] ${
          visible
            ? 'opacity-100 translate-y-0'
            : animDir === 'fwd'
            ? 'opacity-0 translate-y-3'
            : 'opacity-0 -translate-y-3'
        }`}
      >
        {/* phase colour strip */}
        <div className="h-1" style={{ backgroundColor: accentColor }} />

        <div className="p-8">
          {/* Question */}
          <h2 className="font-[Playfair_Display] text-xl font-bold text-[#03243F] mb-6 leading-snug">
            {q.question}
          </h2>

          {/* ââ Phase 1: two large tap cards ââ */}
          {phase === 1 && (() => {
            const rq = q as QRapid
            return (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([rq.a, rq.b] as [string, string]).map((opt) => {
                  const selected = answers[q.id] === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => pickPhase1(opt)}
                      className={`text-left p-5 rounded-xl border-2 transition-all text-sm font-medium leading-snug ${
                        selected
                          ? 'border-[#18A96B] bg-[#18A96B]/10 text-[#03243F]'
                          : 'border-slate-200 hover:border-[#18A96B]/50 text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            )
          })()}

          {/* ââ Phase 2: vertical radio list ââ */}
          {phase === 2 && (() => {
            const cq = q as QChoice
            return (
              <div className="space-y-3">
                {cq.options.map((opt) => {
                  const selected = answers[q.id] === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 text-sm ${
                        selected
                          ? 'border-[#F4A636] bg-[#F4A636]/10 text-[#03243F] font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                          selected ? 'border-[#F4A636] bg-[#F4A636]' : 'border-slate-300'
                        }`}
                      />
                      {opt}
                    </button>
                  )
                })}
              </div>
            )
          })()}

          {/* ââ Phase 3: textarea ââ */}
          {phase === 3 && (() => {
            const tq = q as QText
            const val = (answers[q.id] as string) || ''
            return (
              <div>
                <textarea
                  value={val}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  placeholder={tq.placeholder}
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[#03243F] placeholder-slate-400 focus:outline-none focus:border-[#03243F] focus:ring-1 focus:ring-[#03243F] transition resize-none text-sm leading-relaxed"
                />
                <div
                  className={`text-right text-xs mt-1 transition-colors ${
                    val.length < 10 ? 'text-slate-300' : 'text-[#18A96B]'
                  }`}
                >
                  {val.length} chars
                </div>
              </div>
            )
          })()}

          {/* ââ Navigation (phases 2 & 3 only â phase 1 auto-advances) ââ */}
          {phase !== 1 && (
            <div className="flex items-center justify-between mt-8">
              {currentQ > 0 ? (
                <button
                  onClick={handleBack}
                  className="text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
                >
                  â Back
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                disabled={!canAdvance() || saving}
                className="bg-[#03243F] hover:bg-[#041f33] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
              >
                {saving
                  ? 'Savingâ¦'
                  : currentQ === TOTAL - 1
                  ? 'See My Matches â'
                  : 'Next â'}
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-white/30 text-xs mt-8 text-center max-w-sm">
        Your answers are used only to compute match scores. We never sell your data.
      </p>
    </main>
  )
}
