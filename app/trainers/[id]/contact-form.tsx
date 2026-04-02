'use client'
import { useState } from 'react'

export default function ContactForm({ trainerId, trainerName }: { trainerId: string, trainerName: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_id: trainerId, ...form })
      })
      if (!res.ok) throw new Error('Failed to send message')
      setSent(true)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (sent) return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="font-bold text-[#03243F] mb-1">Message Sent!</h3>
      <p className="text-sm text-gray-500">{trainerName} will be in touch soon.</p>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-xl font-bold text-[#03243F] mb-1" style={{fontFamily:'Playfair Display'}}>Contact Trainer</h3>
      <p className="text-sm text-gray-500 mb-4">Free to reach out — no obligations</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Your name" required value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
        <input type="email" placeholder="Email address" required value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
        <input type="tel" placeholder="Phone (optional)" value={form.phone}
          onChange={e => setForm({...form, phone: e.target.value})}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
        <textarea placeholder="Tell them your fitness goals..." rows={3} value={form.message}
          onChange={e => setForm({...form, message: e.target.value})}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B] resize-none" />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-[#18A96B] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#15906A] disabled:opacity-50 transition-colors">
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}