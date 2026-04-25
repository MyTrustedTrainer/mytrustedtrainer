'use client'

import { useState } from 'react'
import { X, Send, CheckCircle } from 'lucide-react'

export default function AddExistingClientModal() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const sendInvite = async () => {
    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send invite.')
      } else {
        setSent(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSending(false)
  }

  const close = () => {
    setOpen(false)
    setEmail('')
    setSent(false)
    setError('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-[#03243F] hover:bg-[#04304f] text-white rounded-xl text-sm font-semibold transition-colors"
      >
        + Add Existing Client
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2
                className="text-lg font-bold text-[#03243F]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Add Existing Client
              </h2>
              <button
                onClick={close}
                className="p-1.5 text-slate-400 hover:text-[#03243F] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {!sent ? (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Enter your client&apos;s email. They&apos;ll receive an invite link to connect
                    with you on MyTrustedTrainer — no unlock fee required.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@email.com"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
                      onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <button
                      onClick={sendInvite}
                      disabled={!email || sending}
                      className="w-full py-2.5 bg-[#18A96B] hover:bg-[#159a5f] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {sending ? (
                        'Sending…'
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Invite
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-[#18A96B] mx-auto mb-3" />
                  <h3 className="font-bold text-[#03243F] mb-1">Invite Sent!</h3>
                  <p className="text-sm text-slate-500 mb-5">
                    We&apos;ve sent an invite to <span className="font-medium">{email}</span>.
                    They&apos;ll appear in your client list once they accept.
                  </p>
                  <button
                    onClick={close}
                    className="px-5 py-2 border border-slate-200 text-slate-600 hover:border-[#03243F] rounded-xl text-sm font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
