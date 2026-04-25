import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock, Star } from 'lucide-react'
import Link from 'next/link'

export default async function MyProgramPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/client/dashboard/my-program')

  // Find active trainer relationships (converted leads)
  const { data: leads } = await supabase
    .from('leads')
    .select('id, trainer_id, trainer_profiles(full_name, profile_photo_url, slug)')
    .eq('client_id', user.id)
    .eq('status', 'converted')
    .limit(1)

  const lead = leads?.[0]

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <h1
            className="text-2xl font-bold text-[#03243F] mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            My Program
          </h1>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-slate-500 text-sm mb-4">
              No active trainer relationships yet.
            </p>
            <Link
              href="/client/matches"
              className="inline-block px-5 py-2.5 bg-[#18A96B] hover:bg-[#159a5f] text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Find Your Trainer →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Get routine for this lead
  const { data: routines } = await supabase
    .from('routines')
    .select('id, title, description, created_at')
    .eq('client_id', lead.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const routine = routines?.[0]
  let steps: any[] = []

  if (routine) {
    const { data: stepData } = await supabase
      .from('routine_steps')
      .select(
        'id, step_number, title, description, scheduled_date, duration_minutes, completed'
      )
      .eq('routine_id', routine.id)
      .order('step_number')
    steps = stepData || []
  }

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const trainer = (lead as any).trainer_profiles

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-bold text-[#03243F]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            My Program
          </h1>
          {trainer && (
            <p className="text-slate-500 text-sm mt-1">
              Assigned by{' '}
              <Link
                href={`/trainers/${trainer.slug}`}
                className="text-[#18A96B] hover:underline font-medium"
              >
                {trainer.full_name}
              </Link>
            </p>
          )}
        </div>

        {!routine ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-slate-500 text-sm">
              Your trainer hasn&apos;t assigned a routine yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Routine header */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-[#03243F] text-lg mb-1">{routine.title}</h2>
              {routine.description && (
                <p className="text-sm text-slate-500">{routine.description}</p>
              )}
              <p className="text-xs text-slate-400 mt-2">
                {steps.length} step{steps.length !== 1 ? 's' : ''} ·{' '}
                {steps.filter((s) => s.completed).length} completed
              </p>
            </div>

            {/* Progress bar */}
            {steps.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Progress</span>
                  <span>
                    {steps.filter((s) => s.completed).length}/{steps.length}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#18A96B] rounded-full transition-all"
                    style={{
                      width: `${
                        steps.length > 0
                          ? (steps.filter((s) => s.completed).length / steps.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step list */}
            {steps.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center">
                <p className="text-slate-400 text-sm">No steps added yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step) => {
                  const stepDate = step.scheduled_date
                    ? new Date(step.scheduled_date)
                    : null
                  const isThisWeek = stepDate
                    ? stepDate >= weekStart && stepDate <= weekEnd
                    : false

                  return (
                    <div
                      key={step.id}
                      className={`bg-white rounded-xl border shadow-sm p-5 ${
                        step.completed
                          ? 'border-[#18A96B]/30'
                          : isThisWeek
                          ? 'border-[#F4A636]/40 ring-1 ring-[#F4A636]/20'
                          : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.completed
                              ? 'bg-[#18A96B] text-white'
                              : isThisWeek
                              ? 'bg-[#F4A636]/20 text-[#F4A636]'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : isThisWeek ? (
                            <Star className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-[#03243F] text-sm">
                              {step.title || `Step ${step.step_number}`}
                            </h3>
                            {isThisWeek && !step.completed && (
                              <span className="text-[10px] bg-[#F4A636]/10 text-[#F4A636] font-bold px-2 py-0.5 rounded-full">
                                THIS WEEK
                              </span>
                            )}
                            {step.completed && (
                              <span className="text-[10px] bg-[#18A96B]/10 text-[#18A96B] font-bold px-2 py-0.5 rounded-full">
                                DONE
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-sm text-slate-500 mt-0.5">{step.description}</p>
                          )}
                          <div className="flex gap-3 mt-2 text-xs text-slate-400">
                            {stepDate && (
                              <span>
                                {stepDate.toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                            {step.duration_minutes && (
                              <span>{step.duration_minutes} min</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
