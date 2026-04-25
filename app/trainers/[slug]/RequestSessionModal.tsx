'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  trainerId: string
  trainerName: string
}

export default function RequestSessionModal({ trainerId, trainerName }: Props) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm]       = useState({
    name: '', email: '', phone: '', goal: '', budget_range: '', message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_id: trainerId, ...form }),
      })
      if (res.ok) setSuccess(true)
    } catch (err) {
      console.error('lead create error:', err)
    } finally {
      setLoading(false)
    }
  }

  const close = () => { setOpen(false); setSuccess(false) }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 bg-[#18A96B] hover:bg-[#159a5f] text-white font-semibold rounded-xl transition-colors text-sm"
      >
        Request a Session
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2
                className="font-bold text-[#03243F] text-lg leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Request a Session
                <span className="block text-sm font-normal text-slate-500 mt-0.5">with {trainerName}</span>
              </h2>
              <button onClick={close} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              /* Success state */
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#18A96B]/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#18A96B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#03243F] text-xl mb-2">Request Sent!</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {trainerName} will be notified and can review your inquiry.
                  You&apos;ll typically hear back within 24 hours.
                </p>
                <button
                  onClick={close}
                  className="mt-5 px-6 py-2.5 bg-[#03243F] hover:bg-[#04304f] text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Primary Goal *</label>
                  <select
                    required
                    value={form.goal}
                    onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30 bg-white"
                  >
                    <option value="">Select a goal</option>
                    <option>Lose weight</option>
                    <option>Build muscle</option>
                    <option>Athletic performance</option>
                    <option>General health &amp; fitness</option>
                    <option>Rehabilitation / injury recovery</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Budget / Session</label>
                  <select
                    value={form.budget_range}
                    onChange={e => setForm(f => ({ ...f, budget_range: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30 bg-white"
                  >
                    <option value="">Select range</option>
                    <option>Under $40/session</option>
                    <option>$40–$70/session</option>
                    <option>$70–$100/session</option>
                    <option>$100+/session</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30 resize-none"
                    placeholder="Anything else you'd like them to know…"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#18A96B] hover:bg-[#159a5f] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {loading ? 'Sending…' : 'Send Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
