'use client'
import { useState } from 'react'
import Link from 'next/link'
export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-[#03243F] text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}>
            <span className="text-[#18A96B]">My</span>TrustedTrainer
          </Link>
          <Link href="/" className="text-gray-300 hover:text-white text-sm">Back to Home</Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>Contact Us</h1>
        <p className="text-gray-500 mb-8">Questions, feedback, or want to list your training business? We would love to hear from you.</p>
        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">Message Sent!</div>
            <p className="text-green-700">We will get back to you at {form.email} within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); setSent(true) }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B] resize-none" />
            </div>
            <button type="submit" className="w-full bg-[#18A96B] text-white py-4 rounded-xl font-semibold hover:bg-[#15906A]">Send Message</button>
          </form>
        )}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-gray-500 text-sm">Email us at <a href="mailto:support@mytrustedtrainer.com" className="text-[#18A96B] hover:underline">support@mytrustedtrainer.com</a></p>
        </div>
      </div>
    </div>
  )
}