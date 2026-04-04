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

interface Conversation {
    id: string
    lead_claim_status: 'pending' | 'claimed' | 'ignored'
    client_name: string
}

export default function ContactForm({ trainerId, trainerName }: { trainerId: string, trainerName: string }) {
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [starting, setStarting] = useState(false)
    const [initialMessage, setInitialMessage] = useState('')
    const [error, setError] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const channelRef = useRef<any>(null)

  const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages])

  useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
                setUser(user)
                if (user) loadConversation(user.id)
                else setLoading(false)
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
                                await loadMessages(conv.id)
                                subscribeToMessages(conv.id)
                    }
          }
        } finally {
                setLoading(false)
        }
  }

  async function loadMessages(convId: string) {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true })
        setMessages(data || [])
  }

  function subscribeToMessages(convId: string) {
        if (channelRef.current) channelRef.current.unsubscribe()
        const channel = supabase
          .channel('messages:' + convId)
          .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: 'conversation_id=eq.' + convId
          }, (payload) => {
                    setMessages(prev => {
                                if (prev.find(m => m.id === payload.new.id)) return prev
                                return [...prev, payload.new as Message]
                    })
          })
          .subscribe()
        channelRef.current = channel
  }

  useEffect(() => {
        return () => { channelRef.current?.unsubscribe() }
  }, [])

  async function startChat() {
        if (!initialMessage.trim() || starting) return
        setStarting(true)
        setError('')
        try {
                const res = await fetch('/api/conversations', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ trainer_id: trainerId, message: initialMessage.trim() })
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error)
                setConversation(data.conversation)
                if (data.conversation.lead_claim_status === 'claimed' && data.message) {
                          setMessages([data.message])
                          subscribeToMessages(data.conversation.id)
                }
                setInitialMessage('')
        } catch (err: any) {
                setError(err.message)
        } finally {
                setStarting(false)
        }
  }

  async function sendMessage() {
        if (!newMessage.trim() || sending || !conversation) return
        setSending(true)
        const msgText = newMessage.trim()
        setNewMessage('')
        try {
                const res = await fetch('/api/conversations/' + conversation.id + '/messages', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ message: msgText })
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error)
                setMessages(prev => {
                          if (prev.find(m => m.id === data.message.id)) return prev
                          return [...prev, data.message]
                })
        } catch (err: any) {
                setError(err.message)
                setNewMessage(msgText)
        } finally {
                setSending(false)
        }
  }

  if (loading) {
        return (
                <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                        <div className="w-6 h-6 border-2 border-[#18A96B] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>div>
              )
  }
  
    // NOT LOGGED IN
    if (!user) {
          return (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                          <div className="bg-gradient-to-br from-[#03243F] to-[#04305a] p-5 text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 bg-[#18A96B] rounded-full animate-pulse" />
                                                <span className="text-xs text-green-300 font-medium">Live Chat Available</span>span>
                                    </div>div>
                                    <h3 className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}>Chat with {trainerName}</h3>h3>
                                    <p className="text-gray-300 text-sm mt-1">Free. No obligations. Real-time conversation.</p>p>
                          </div>div>
                          <div className="p-6">
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                                                <span className="text-amber-500 text-xl leading-none">🔒</span>span>
                                                <div>
                                                              <p className="text-sm font-semibold text-amber-800 mb-1">Account required to chat</p>p>
                                                              <p className="text-sm text-amber-700">Create a free account to start a live chat with {trainerName} and get real-time responses.</p>p>
                                                </div>div>
                                    </div>div>
                                    <div className="space-y-2">
                                                <Link href={'/signup?next=/trainers/' + encodeURIComponent(trainerId)}
                                                                className="block w-full bg-[#18A96B] text-white py-3 rounded-xl font-semibold text-sm text-center hover:bg-[#15906A] transition-colors">
                                                              Create Free Account to Chat
                                                </Link>Link>
                                                <Link href={'/login?next=/trainers/' + encodeURIComponent(trainerId)}
                                                                className="block w-full border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm text-center hover:border-gray-300 transition-colors">
                                                              Already have an account? Sign In
                                                </Link>Link>
                                    </div>div>
                          </div>div>
                  </div>div>
                )
    }
  
    // LOGGED IN - no conversation yet
    if (!conversation) {
          return (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                          <div className="bg-gradient-to-br from-[#03243F] to-[#04305a] p-5 text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 bg-[#18A96B] rounded-full animate-pulse" />
                                                <span className="text-xs text-green-300 font-medium">Live Chat</span>span>
                                    </div>div>
                                    <h3 className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}>Start Chat with {trainerName}</h3>h3>
                          </div>div>
                          <div className="p-5">
                                    <p className="text-sm text-gray-600 mb-3">Send your first message to start a live chat. {trainerName} will be notified immediately.</p>p>
                                    <textarea
                                                  placeholder={'Hi ' + trainerName + ', I\'m interested in...'}
                                                  rows={3}
                                                  value={initialMessage}
                                                  onChange={e => setInitialMessage(e.target.value)}
                                                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B] resize-none mb-3"
                                                />
                            {error && <p className="text-red-500 text-xs mb-2">{error}</p>p>}
                                    <button
                                                  onClick={startChat}
                                                  disabled={starting || !initialMessage.trim()}
                                                  className="w-full bg-[#18A96B] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#15906A] disabled:opacity-50 transition-colors"
                                                >
                                      {starting ? 'Starting Chat...' : 'Start Live Chat'}
                                    </button>button>
                          </div>div>
                  </div>div>
                )
    }
  
    // PENDING - waiting for trainer to claim/accept
    if (conversation.lead_claim_status === 'pending') {
          return (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                          <div className="bg-gradient-to-br from-[#03243F] to-[#04305a] p-5 text-white">
                                    <h3 className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}>Chat with {trainerName}</h3>h3>
                          </div>div>
                          <div className="p-6 text-center">
                                    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-7 h-7 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>svg>
                                    </div>div>
                                    <p className="font-semibold text-[#03243F] mb-1">Chat Request Sent!</p>p>
                                    <p className="text-sm text-gray-500 mb-2">Your message has been delivered to {trainerName}. Waiting for them to accept your chat request.</p>p>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-left">
                                                <p className="text-xs text-blue-700">You'll be notified by email when {trainerName} accepts. You can also check back here — the chat will open automatically once accepted.</p>p>
                                    </div>div>
                          </div>div>
                  </div>div>
                )
    }
  
    // IGNORED
    if (conversation.lead_claim_status === 'ignored') {
          return (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                          <div className="bg-gradient-to-br from-[#03243F] to-[#04305a] p-5 text-white">
                                    <h3 className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}>Chat with {trainerName}</h3>h3>
                          </div>div>
                          <div className="p-6 text-center">
                                    <p className="text-gray-500 text-sm mb-4">{trainerName} is not currently available for new chats. You can try searching for other trainers.</p>p>
                                    <Link href="/search" className="block w-full bg-[#03243F] text-white py-3 rounded-xl font-semibold text-sm text-center hover:bg-[#04305a] transition-colors">
                                                Find Other Trainers
                                    </Link>Link>
                          </div>div>
                  </div>div>
                )
    }
  
    // CLAIMED - full live chat interface
    return (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-[#03243F] to-[#04305a] p-5 text-white">
                        <div className="flex items-center gap-2 mb-1">
                                  <div className="w-2 h-2 bg-[#18A96B] rounded-full animate-pulse" />
                                  <span className="text-xs text-green-300 font-medium">Live Chat</span>span>
                        </div>div>
                        <h3 className="text-xl font-bold" style={{fontFamily:'Playfair Display'}}>Chat with {trainerName}</h3>h3>
                </div>div>
            {/* Message thread */}
                <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.length === 0 && (
                      <div className="flex items-center justify-center h-full">
                                  <p className="text-sm text-gray-400 text-center">Chat accepted! Send your first message.</p>p>
                      </div>div>
                        )}
                  {messages.map(msg => (
                      <div key={msg.id} className={'flex ' + (msg.sender_type === 'client' ? 'justify-end' : 'justify-start')}>
                                  <div className={'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ' + (msg.sender_type === 'client' ? 'bg-[#18A96B] text-white rounded-br-sm' : 'bg-white text-[#03243F] shadow-sm rounded-bl-sm')}>
                                    {msg.body}
                                                <div className={'text-[10px] mt-1 ' + (msg.sender_type === 'client' ? 'text-green-100' : 'text-gray-400')}>
                                                  {new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </div>div>
                                  </div>div>
                      </div>div>
                    ))}
                        <div ref={messagesEndRef} />
                </div>div>
            {messages.length > 0 && !messages.some(m => m.sender_type === 'trainer') && (
                    <div className="mx-4 mb-2 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                              <span className="text-lg">⏳</span>span>
                              <p className="text-xs text-amber-800">Waiting for {trainerName} to reply — you'll get notified by email.</p>p>
                    </div>div>
                )}
            {error && <div className="mx-4 mb-2 bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-xs text-red-700">{error}</p>p></div>div>}
                <div className="p-4 border-t border-gray-100">
                        <div className="flex gap-2">
                                  <input
                                                type="text"
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                                                placeholder="Type a message..."
                                                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]"
                                              />
                                  <button
                                                onClick={sendMessage}
                                                disabled={sending || !newMessage.trim()}
                                                className="bg-[#18A96B] text-white px-4 py-2.5 rounded-xl hover:bg-[#15906A] disabled:opacity-50 transition-colors"
                                              >
                                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>svg>
                                  </button>button>
                        </div>div>
                </div>div>
          </div>div>
        )
}</div>
