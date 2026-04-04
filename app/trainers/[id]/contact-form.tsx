'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Message {
  id: string
  body: string
  sender_type: 'client' | 'trainer'
  created_at: string
  is_read: boolean
}

export default function ContactForm({ trainerId, trainerName, trainerUserId }: { trainerId: string, trainerName: string, trainerUserId: string }) {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [conversation, setConversation] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [starting, setStarting] = useState(false)
  const [initialMessage, setInitialMessage] = useState('')
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        if (user.id === trainerUserId) {
          setIsOwnProfile(true)
          setLoading(false)
        } else {
          loadConversation(user.id)
        }
      } else setLoading(false)
    })
  }, [])

  async function loadConversation(userId: string) {
    setLoading(true)
    try {
      const { data: conv } = await supabase
        .from('conversations')
        .select('id, lead_claim_status, client_name')
        .eq('trainer_id', trainerId)
        .eq('client_user_id', userId)
        .single()
      if (conv) {
        setConversation(conv)
        if (conv.lead_claim_status === 'claimed') {
          const { data } = await supabase.from('messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: true })
          setMessages(data || [])
          subscribeToMessages(conv.id)
        }
      }
    } finally { setLoading(false) }
  }

  function subscribeToMessages(convId: string) {
    if (channelRef.current) channelRef.current.unsubscribe()
    const channel = supabase
      .channel('messages:' + convId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + convId },
        payload => { setMessages(prev => { if (prev.find(m => m.id === payload.new.id)) return prev; return [...prev, payload.new as Message] }) }
      )
      .subscribe()
    channelRef.current = channel
  }

  async function startChat() {
    if (!initialMessage.trim()) { setError('Please enter a message to get started.'); return }
    setStarting(true)
    setError('')
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_id: trainerId, initial_message: initialMessage.trim() })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to start chat.'); return }
      setConversation(data.conversation)
      setInitialMessage('')
    } catch { setError('Network error. Please try again.') }
    finally { setStarting(false) }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !conversation) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/conversations/' + conversation.id + '/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send message.'); return }
      setNewMessage('')
      setMessages(prev => {
        if (prev.find(m => m.id === data.message.id)) return prev
        return [...prev, data.message]
      })
    } catch { setError('Network error. Please try again.') }
    finally { setSending(false) }
  }

  // Don't show chat widget when the logged-in trainer is viewing their own profile
  if (isOwnProfile) return null

  if (loading) return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
      <div className="w-6 h-6 border-2 border-[#18A96B] border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  )

  if (!user) return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
      <h3 className="text-lg font-semibold text-[#03243F] mb-2">Chat with {trainerName}</h3>
      <p className="text-gray-500 text-sm mb-4">You need an account to send a message.</p>
      <Link href="/signup" className="block w-full bg-[#18A96B] text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-green-600 transition mb-2">
        Create Account
      </Link>
      <Link href="/login" className="block w-full border border-gray-300 text-[#03243F] py-2 px-4 rounded-lg text-center font-medium hover:bg-gray-50 transition">
        Log In
      </Link>
    </div>
  )

  if (!conversation) return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#03243F] mb-1">Chat with {trainerName}</h3>
      <p className="text-gray-500 text-sm mb-4">Send a message to get started. The trainer will respond when available.</p>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <textarea
        className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#18A96B] mb-3"
        rows={4}
        placeholder="Hi, I'm interested in training with you..."
        value={initialMessage}
        onChange={e => setInitialMessage(e.target.value)}
      />
      <button
        onClick={startChat}
        disabled={starting || !initialMessage.trim()}
        className="w-full bg-[#18A96B] text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
      >
        {starting ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  )

  if (conversation.lead_claim_status === 'pending') return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <span className="text-yellow-600 text-xl">&#x23F3;</span>
      </div>
      <h3 className="text-base font-semibold text-[#03243F] mb-1">Message Sent!</h3>
      <p className="text-gray-500 text-sm">Your message is pending review. {trainerName} will respond soon.</p>
    </div>
  )

  if (conversation.lead_claim_status === 'ignored') return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <span className="text-gray-400 text-xl">&#x2715;</span>
      </div>
      <h3 className="text-base font-semibold text-[#03243F] mb-1">Not Available</h3>
      <p className="text-gray-500 text-sm mb-4">{trainerName} is not available for new clients at this time.</p>
      <Link href="/search" className="text-[#18A96B] text-sm font-medium hover:underline">Find another trainer</Link>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm flex flex-col" style={{ height: '480px' }}>
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#18A96B] rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">{trainerName[0]}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#03243F]">{trainerName}</p>
          <p className="text-xs text-green-500">Active</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={msg.sender_type === 'client' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={msg.sender_type === 'client'
              ? 'bg-[#18A96B] text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs text-sm'
              : 'bg-gray-100 text-[#03243F] rounded-2xl rounded-tl-sm px-4 py-2 max-w-xs text-sm'
            }>
              {msg.body}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="text-red-500 text-xs px-4 pb-1">{error}</p>}
      <div className="p-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          className="bg-[#18A96B] text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-green-600 transition disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
