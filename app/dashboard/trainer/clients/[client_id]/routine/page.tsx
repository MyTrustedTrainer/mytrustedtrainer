'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronUp, ChevronDown, Trash2, Save, Calendar, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Step {
  id?: string
  step_number: number
  title: string
  description: string
  scheduled_date: string
  duration_minutes: number
  completed: boolean
}

interface Routine {
  id: string
  title: string
  description: string
  created_at: string
}

export default function RoutineBuilderPage() {
  const params = useParams()
  const leadId = params.client_id as string
  const supabase = createClient()

  const [routine, setRoutine] = useState<Routine | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedTemplate, setSavedTemplate] = useState(false)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [showNewRoutine, setShowNewRoutine] = useState(false)
  const [newRoutineTitle, setNewRoutineTitle] = useState('')
  const [newRoutineDesc, setNewRoutineDesc] = useState('')
  const [trainerId, setTrainerId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    setTrainerId(user.id)

    const { data: routines } = await supabase
      .from('routines')
      .select('id, title, description, created_at')
      .eq('trainer_id', user.id)
      .eq('client_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (routines && routines.length > 0) {
      const r = routines[0]
      setRoutine(r)
      const { data: stepData } = await supabase
        .from('routine_steps')
        .select('*')
        .eq('routine_id', r.id)
        .order('step_number')
      setSteps(stepData || [])
    }
    setLoading(false)
  }

  const createRoutine = async () => {
    if (!trainerId || !newRoutineTitle.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('routines')
      .insert({
        trainer_id: trainerId,
        client_id: leadId,
        title: newRoutineTitle.trim(),
        description: newRoutineDesc.trim(),
        is_template: false,
      })
      .select()
      .single()
    if (!error && data) {
      setRoutine(data)
      setSteps([])
      setShowNewRoutine(false)
    }
    setSaving(false)
  }

  const addStep = async () => {
    if (!routine) return
    const newStep = {
      routine_id: routine.id,
      step_number: steps.length + 1,
      title: '',
      description: '',
      scheduled_date: null,
      duration_minutes: 60,
      completed: false,
    }
    setSaving(true)
    const { data, error } = await supabase
      .from('routine_steps')
      .insert(newStep)
      .select()
      .single()
    if (!error && data) {
      setSteps([...steps, data])
      setSelectedStep(steps.length)
    }
    setSaving(false)
  }

  const updateStep = async (
    idx: number,
    field: keyof Step,
    value: string | number | boolean
  ) => {
    const step = steps[idx]
    const newSteps = [...steps]
    newSteps[idx] = { ...step, [field]: value }
    setSteps(newSteps)
    if (step.id) {
      await supabase
        .from('routine_steps')
        .update({ [field]: value })
        .eq('id', step.id)
    }
  }

  const deleteStep = async (idx: number) => {
    const step = steps[idx]
    if (step.id) {
      await supabase.from('routine_steps').delete().eq('id', step.id)
    }
    const newSteps = steps
      .filter((_, i) => i !== idx)
      .map((s, i) => ({ ...s, step_number: i + 1 }))
    setSteps(newSteps)
    if (selectedStep === idx) setSelectedStep(null)
    else if (selectedStep !== null && selectedStep > idx) setSelectedStep(selectedStep - 1)
  }

  const moveStep = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= steps.length) return
    const newSteps = [...steps]
    ;[newSteps[idx], newSteps[newIdx]] = [newSteps[newIdx], newSteps[idx]]
    newSteps[idx] = { ...newSteps[idx], step_number: idx + 1 }
    newSteps[newIdx] = { ...newSteps[newIdx], step_number: newIdx + 1 }
    setSteps(newSteps)
    if (newSteps[idx].id) {
      await supabase
        .from('routine_steps')
        .update({ step_number: idx + 1 })
        .eq('id', newSteps[idx].id!)
    }
    if (newSteps[newIdx].id) {
      await supabase
        .from('routine_steps')
        .update({ step_number: newIdx + 1 })
        .eq('id', newSteps[newIdx].id!)
    }
    setSelectedStep(newIdx)
  }

  const saveAsTemplate = async () => {
    if (!routine || !trainerId) return
    setSaving(true)
    const { data: templateRoutine } = await supabase
      .from('routines')
      .insert({
        trainer_id: trainerId,
        client_id: null,
        title: `${routine.title} (Template)`,
        description: routine.description,
        is_template: true,
      })
      .select()
      .single()

    if (templateRoutine && steps.length > 0) {
      await supabase.from('routine_steps').insert(
        steps.map((s, i) => ({
          routine_id: templateRoutine.id,
          step_number: i + 1,
          title: s.title,
          description: s.description,
          duration_minutes: s.duration_minutes,
          completed: false,
        }))
      )
    }

    setSavedTemplate(true)
    setTimeout(() => setSavedTemplate(false), 3000)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="w-6 h-6 border-2 border-[#18A96B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/dashboard/trainer/clients/${leadId}?tab=routine`}
          className="text-sm text-slate-400 hover:text-[#03243F] transition-colors"
        >
          ← Client
        </Link>
        <span className="text-slate-300">/</span>
        <h1
          className="text-xl font-bold text-[#03243F]"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Routine Builder
        </h1>
      </div>

      {/* No routine + not creating */}
      {!routine && !showNewRoutine && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center max-w-lg">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#03243F] mb-2">No Routine Yet</h2>
          <p className="text-sm text-slate-500 mb-5">
            Create a custom training routine for this client.
          </p>
          <button
            onClick={() => setShowNewRoutine(true)}
            className="px-5 py-2.5 bg-[#18A96B] hover:bg-[#159a5f] text-white font-semibold rounded-xl text-sm transition-colors"
          >
            + Create Routine
          </button>
        </div>
      )}

      {/* New routine form */}
      {showNewRoutine && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6 max-w-lg">
          <h2 className="text-sm font-semibold text-[#03243F] mb-4">New Routine</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Routine title (e.g. 8-Week Strength Program)"
              value={newRoutineTitle}
              onChange={(e) => setNewRoutineTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
            />
            <textarea
              placeholder="Description (optional)"
              value={newRoutineDesc}
              onChange={(e) => setNewRoutineDesc(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={createRoutine}
                disabled={!newRoutineTitle.trim() || saving}
                className="px-4 py-2 bg-[#18A96B] hover:bg-[#159a5f] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewRoutine(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:border-slate-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routine builder — two-panel */}
      {routine && (
        <div className="flex gap-6 max-w-5xl">
          {/* Left: Step list */}
          <div className="w-72 flex-shrink-0 space-y-3">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-semibold text-[#03243F] text-sm">{routine.title}</h2>
                {routine.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{routine.description}</p>
                )}
              </div>

              <div className="divide-y divide-slate-50">
                {steps.map((step, i) => (
                  <div
                    key={step.id || i}
                    onClick={() => setSelectedStep(i)}
                    className={`p-3 cursor-pointer flex items-center gap-2 transition-colors ${
                      selectedStep === i ? 'bg-[#18A96B]/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        step.completed
                          ? 'bg-[#18A96B] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#03243F] truncate">
                        {step.title || 'Untitled step'}
                      </p>
                      {step.scheduled_date && (
                        <p className="text-xs text-slate-400">
                          {new Date(step.scheduled_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveStep(i, -1)
                        }}
                        className="p-0.5 hover:text-[#03243F] text-slate-300 transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveStep(i, 1)
                        }}
                        className="p-0.5 hover:text-[#03243F] text-slate-300 transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-slate-100">
                <button
                  onClick={addStep}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[#18A96B] hover:bg-[#18A96B]/5 rounded-lg transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <button
              onClick={saveAsTemplate}
              disabled={saving || steps.length === 0}
              className="w-full py-2.5 border border-slate-200 text-slate-600 hover:border-[#03243F] hover:text-[#03243F] disabled:opacity-50 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {savedTemplate ? 'Saved as Template ✓' : 'Save as Template'}
            </button>
            <button
              disabled
              className="w-full py-2.5 border border-slate-100 text-slate-300 rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Calendar className="w-4 h-4" />
              Push to Google Calendar
              <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">
                Soon
              </span>
            </button>
          </div>

          {/* Right: Step editor */}
          <div className="flex-1">
            {selectedStep === null ? (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-16 text-center h-full flex flex-col items-center justify-center min-h-64">
                <p className="text-slate-400 text-sm">
                  Select a step to edit, or add a new one.
                </p>
              </div>
            ) : steps[selectedStep] ? (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#03243F]">
                    Step {selectedStep + 1}
                  </h3>
                  <button
                    onClick={() => deleteStep(selectedStep)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                    title="Delete step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={steps[selectedStep].title}
                    onChange={(e) => updateStep(selectedStep, 'title', e.target.value)}
                    placeholder="e.g. Leg Day — Squat Focus"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Description (visible to client)
                  </label>
                  <textarea
                    value={steps[selectedStep].description}
                    onChange={(e) => updateStep(selectedStep, 'description', e.target.value)}
                    rows={3}
                    placeholder="What should the client know about this session?"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={
                        steps[selectedStep].scheduled_date
                          ? steps[selectedStep].scheduled_date.slice(0, 10)
                          : ''
                      }
                      onChange={(e) =>
                        updateStep(selectedStep, 'scheduled_date', e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={steps[selectedStep].duration_minutes}
                      onChange={(e) =>
                        updateStep(
                          selectedStep,
                          'duration_minutes',
                          parseInt(e.target.value) || 60
                        )
                      }
                      min={15}
                      step={15}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={steps[selectedStep].completed}
                    onChange={(e) => updateStep(selectedStep, 'completed', e.target.checked)}
                    className="w-4 h-4 rounded accent-[#18A96B]"
                  />
                  <label htmlFor="completed" className="text-sm text-slate-600 cursor-pointer">
                    Mark as completed
                  </label>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
