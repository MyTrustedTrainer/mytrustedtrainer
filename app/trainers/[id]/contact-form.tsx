'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Message {
  id: string
  body: string
  sender_type: 'client' | 'trainer'
  created_at: string
  is_read: boolean
}

export default function ContactForm({ trainerId, trainerName }: { trainerId: string, trainerName: string }) {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [guestForm, setGuestForm] = useState({ name: '', email: '', message: '' })
  const [guestSent, setGuestSent] = useState(false)
  const [guestError, setGuestError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) loadConversation(user.id)
      else setLoading(false)
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversation(userId: string) {
    setLoading(true)
    try {
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('trainer_id', trainerId)
        .eq('client_user_id', userId)
        .single()

      if (conv) {
        setConversationId(conv.id)
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true })
        setMessages(msgs || [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || sending) return
    setSending(true)
    try {
      if (!conversationId) {
        // First message - creates conversation
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trainer_id: trainerId, message: newMessage.trim() })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setConversationId(data.conversation.id)
        setMessages([data.message])
      } else {
        const res = await fetch('/api/conversations/' + conversationId + '/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMessage.trim() })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setMessages(prev => [...prev, data.message])
      }
      setNewMessage('')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  async function sendGuestMessage(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setGuestError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_id: trainerId, name: guestForm.name, email: guestForm.email, message: guestForm.message })
      })
      if (!res.ok) throw new Error('Failed to send')
      setGuestSent(true)
    } catch (err: any) {
      setGuestError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <div className="w-6 h-6 border-2 border-[#18A96B] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  // NOT LOGGED IN - show teaser form + wall
  if (!user) {
    if (guestSent) {
      return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-[#03243F] to-[#04305a] p-5 text-white">
            <h3 className="text-lg font-bold" style={{fontFamily:'Playfair Display'}}>Message Sent!</h3>
          </div>
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="font-semibold text-[#03243F] mb-1">{trainerName} has your message</p>
            <p className="text-sm text-gray-500 mb-4">Create a free account to see their reply and keep chatting.</p>
            <Link href="/signup" className="block w-full bg-[#18A96B] text-white py-3 rounded-xl font-semibold text-sm text-center hover:bg-[#15906A] transition-colors">
              Create Free Account to See Reply
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#03243F] to-[#04305a] p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[#18A96B] rounded-full animate-pulse" />
            <span className="text-xs text-green-300 font-medium">Usually responds within 2 hours</span>
          </div>
          <h3 className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}>Message {trainerName}</h3>
          <p className="text-gray-300 text-sm mt-1">Free. No obligations.</p>
        </div>

        <form onSubmit={sendGuestMessage} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Your name" required value={guestForm.name} onChange={e => setGuestForm({...guestForm, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
            <input type="email" placeholder="Email" required value={guestForm.email} onChange={e => setGuestForm({...guestForm, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
          </div>
          <textarea placeholder={"Hi " + trainerName + ", I'm looking to..."} rows={3} required value={guestForm.message} onChange={e => setGuestForm({...guestForm, message: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B] resize-none" />
          {guestError && <p className="text-red-500 text-xs">{guestError}</p>}
          <button type="submit" disabled={sending} className="w-full bg-[#18A96B] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#15906A] disabled:opacity-50 transition-colors">
            {sending ? 'Sending...' : 'Send Message'}
          </button>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <span className="text-amber-500 text-lg leading-none">🔒</span>
            <div>
              <p className="text-xs font-semibold text-amber-800">Want to see their reply?</p>
              <p className="text-xs text-amber-700">
                <Link href="/signup" className="underline font-medium">Create a free account</Link> to get notified and keep chatting.
              </p>
            </div>
          </div>
        </form>
      </div>
    )
  }

  // LOGGED IN - full chat interface
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-[#03243F] to-[#04305a] p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-[#18A96B] rounded-full animate-pulse" />
          <span className="text-xs text-green-300 font-medium">Live Chat</span>
        </div>
        <h3 className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}>Chat with {trainerName}</h3>
      </div>

      {/* Message thread */}
      <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 text-center">Start the conversation! Ask about their approach, availability, or pricing.</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={"flex " + (msg.sender_type === 'client' ? 'justify-end' : 'justify-start')}>
            <div className={"max-w-[80%] px-4 py-2.5 rounded-2xl text-sm " + (msg.sender_type === 'client' ? 'bg-[#18A96B] text-white rounded-br-sm' : 'bg-white text-[#03243F] shadow-sm rounded-bl-sm')}>
              {msg.body}
              <div className={"text-[10px] mt-1 " + (msg.sender_type === 'client' ? 'text-green-100' : 'text-gray-400')}>
                {new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Trainer response wall if no messages yet from trainer */}
      {messages.length > 0 && !messages.some(m => m.sender_type === 'trainer') && (
        <div className="mx-4 mb-2 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
          <span className="text-lg">⏳</span>
          <p className="text-xs text-amber-800">Waiting for {trainerName} to reply — you'll get an email notification.</p>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder={"Type a message..."}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
          />
          <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="bg-[#18A96B] text-white px-4 py-2.5 rounded-xl hover:bg-[#15906A] disabled:opacity-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
