'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'

interface Thread {
  leadId: string
  clientName: string
  lastMessage: string
  lastAt: string
}

interface Message {
  id: string
  sender_role: string
  body: string
  sent_at: string
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => { loadThreads() }, [])
  useEffect(() => { if (selectedLead) loadMessages(selectedLead) }, [selectedLead])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadThreads = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setTrainerId(user.id)
    const { data: leads } = await supabase
      .from('leads')
      .select('id, goal_summary, created_at')
      .eq('trainer_id', user.id)
      .eq('status', 'unlocked')
      .order('created_at', { ascending: false })
    if (!leads) { setLoading(false); return }
    const threadData: Thread[] = await Promise.all(
      leads.map(async (lead) => {
        const { data: msgs } = await supabase
          .from('messages')
          .select('body, sent_at')
          .eq('lead_id', lead.id)
          .order('sent_at', { ascending: false })
          .limit(1)
        const last = msgs?.[0]
        return {
          leadId: lead.id,
          clientName: lead.goal_summary || 'Client inquiry',
          lastMessage: last?.body || 'No messages yet',
          lastAt: last?.sent_at || lead.created_at,
        }
      })
    )
    setThreads(threadData)
    if (threadData.length > 0 && !selectedLead) setSelectedLead(threadData[0].leadId)
    setLoading(false)
  }

  const loadMessages = async (leadId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('id, sender_role, body, sent_at')
      .eq('lead_id', leadId)
      .order('sent_at', { ascending: true })
    setMessages(data || [])
  }

  const sendMessage = async () => {
    if (!draft.trim() || !selectedLead || !trainerId) return
    setSending(true)
    const body = draft.trim()
    setDraft('')
    await supabase.from('messages').insert({
      lead_id: selectedLead, sender_id: trainerId,
      sender_role: 'trainer', body, sent_at: new Date().toISOString(),
    })
    await loadMessages(selectedLead)
    await loadThreads()
    setSending(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="w-6 h-6 border-2 border-[#18A96B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-[#03243F] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Messages</h1>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <p className="text-slate-500 text-sm">No conversations yet. Unlock a lead to start messaging.</p>
        </div>
      </div>
    )
  }

  const currentThread = threads.find((t) => t.leadId === selectedLead)

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-[#03243F] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Messages</h1>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex" style={{ height: 560 }}>
        <div className="w-64 border-r border-slate-100 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">Conversations</div>
          <div className="flex-1 overflow-y-auto">
            {threads.map((t) => (
              <button key={t.leadId} onClick={() => setSelectedLead(t.leadId)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${selectedLead === t.leadId ? 'bg-[#18A96B]/5 border-l-2 border-l-[#18A96B]' : ''}`}>
                <div className="text-sm font-medium text-[#03243F] truncate">{t.clientName}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{t.lastMessage}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0">
            <div className="text-sm font-semibold text-[#03243F]">{currentThread?.clientName}</div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.length === 0 && <p className="text-center text-slate-400 text-sm py-8">No messages yet. Say hello!</p>}
            {messages.map((msg) => {
              const isTrainer = msg.sender_role === 'trainer'
              return (
                <div key={msg.id} className={`flex ${isTrainer ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isTrainer ? 'bg-[#18A96B] text-white rounded-br-sm' : 'bg-slate-100 text-[#03243F] rounded-bl-sm'}`}>
                    <p>{msg.body}</p>
                    <p className={`text-[10px] mt-1 ${isTrainer ? 'text-white/60' : 'text-slate-400'}`}>
                      {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex gap-3 flex-shrink-0">
            <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message…"
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30" />
            <button onClick={sendMessage} disabled={sending || !draft.trim()}
              className="px-4 py-2.5 bg-[#18A96B] hover:bg-[#159a5f] disabled:opacity-50 text-white rounded-xl transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
