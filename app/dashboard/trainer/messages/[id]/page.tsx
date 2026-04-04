'use client'
import SiteHeader from '@/components/SiteHeader'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function TrainerMessageThread() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const convId = params.id as string
  const [messages, setMessages] = useState<any[]>([])
  const [conversation, setConversation] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Verify this trainer owns this conversation
      const { data: trainerProfile } = await supabase.from('trainer_profiles').select('id').eq('user_id', user.id).single()
      if (!trainerProfile) { router.push('/dashboard/client'); return }

      const { data: conv } = await supabase.from('conversations').select('*').eq('id', convId).eq('trainer_id', trainerProfile.id).single()
      if (!conv) { router.push('/dashboard/trainer'); return }
      setConversation(conv)

      // Load messages
      const { data: msgs } = await supabase.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true })
      setMessages(msgs || [])

      // Mark client messages as read
      await supabase.from('messages').update({ is_read: true }).eq('conversation_id', convId).eq('sender_type', 'client').eq('is_read', false)

      setLoading(false)
    }
    load()
  }, [convId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!newMessage.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/conversations/' + convId + '/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(prev => [...prev, data.message])
      setNewMessage('')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#03243F] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <SiteHeader />
      {/* Thread context bar */}
      <div className="bg-[#03243F] text-white border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard/trainer" className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="w-8 h-8 rounded-lg bg-[#18A96B] flex items-center justify-center text-white font-bold text-sm">
            {conversation?.client_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{conversation?.client_name}</p>
            <p className="text-xs text-gray-400">{conversation?.client_email}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-4 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={"flex " + (msg.sender_type === 'trainer' ? 'justify-end' : 'justify-start')}>
            <div className={"max-w-[75%] px-4 py-3 rounded-2xl text-sm " + (msg.sender_type === 'trainer' ? 'bg-[#18A96B] text-white rounded-br-sm' : 'bg-white text-[#03243F] shadow-sm rounded-bl-sm')}>
              {msg.body}
              <div className={"text-[10px] mt-1 " + (msg.sender_type === 'trainer' ? 'text-green-100' : 'text-gray-400')}>
                {new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-4 flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Type your reply..."
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
          />
          <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="bg-[#18A96B] text-white px-5 py-3 rounded-2xl hover:bg-[#15906A] disabled:opacity-50 transition-colors font-semibold">
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
