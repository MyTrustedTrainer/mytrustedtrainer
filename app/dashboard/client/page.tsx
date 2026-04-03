'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AvatarUpload from '@/components/AvatarUpload'

export default function ClientDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [savedTrainers, setSavedTrainers] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile'|'messages'|'saved'>('profile')
  const [form, setForm] = useState({ full_name: '', phone: '', fitness_goals: '', age: '', gender: '', experience_level: '' })
  
  // Chat state
  const [openConvId, setOpenConvId] = useState<string | null>(null)
  const [openMessages, setOpenMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      setForm(f => ({ ...f, full_name: user.user_metadata?.full_name || '' }))

      const { data: p } = await supabase.from('client_profiles').select('*').eq('user_id', user.id).single()
      if (p) {
        setProfile(p)
        setAvatarUrl(p.avatar_url || null)
        setForm({
          full_name: p.full_name || user.user_metadata?.full_name || '',
          phone: p.phone || '', fitness_goals: p.fitness_goals || '',
          age: p.age ? String(p.age) : '', gender: p.gender || '', experience_level: p.experience_level || '',
        })
      }

      const { data: saved } = await supabase.from('saved_trainers').select('*, trainer_profiles(full_name, slug, tagline, avatar_url, plan)').eq('client_id', user.id)
      setSavedTrainers(saved || [])

      const { data: convs } = await supabase
        .from('conversations')
        .select('*, trainer_profiles(id, full_name, slug, avatar_url), messages(id, body, sender_type, created_at, is_read)')
        .eq('client_user_id', user.id)
        .order('last_message_at', { ascending: false })
      setConversations(convs || [])

      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [openMessages])

  async function openConversation(conv: any) {
    setOpenConvId(conv.id)
    const { data: msgs } = await supabase.from('messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: true })
    setOpenMessages(msgs || [])
    // Mark trainer messages as read
    await supabase.from('messages').update({ is_read: true }).eq('conversation_id', conv.id).eq('sender_type', 'trainer').eq('is_read', false)
  }

  async function sendReply() {
    if (!newMsg.trim() || !openConvId || sendingMsg) return
    setSendingMsg(true)
    try {
      const res = await fetch('/api/conversations/' + openConvId + '/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMsg.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOpenMessages(prev => [...prev, data.message])
      setNewMsg('')
    } catch (err: any) { alert(err.message) }
    finally { setSendingMsg(false) }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMessage('')
    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) return
      const payload = { user_id: u.id, full_name: form.full_name, phone: form.phone, fitness_goals: form.fitness_goals, age: form.age ? parseInt(form.age) : null, gender: form.gender, experience_level: form.experience_level }
      if (profile) { await supabase.from('client_profiles').update(payload).eq('user_id', u.id) }
      else { await supabase.from('client_profiles').insert(payload); setProfile(payload) }
      setMessage('Profile saved!')
    } catch (err: any) { setMessage('Error: ' + err.message) }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#03243F] flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )

  const unreadCount = conversations.reduce((acc, c) => {
    return acc + (c.messages || []).filter((m: any) => m.sender_type === 'trainer' && !m.is_read).length
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#03243F] text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold" style={{fontFamily:'Playfair Display'}}>
            <span className="text-[#18A96B]">My</span>TrustedTrainer
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/search" className="text-sm text-[#18A96B] hover:underline">Find Trainers</Link>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-sm text-gray-300 hover:text-white">Sign Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-6">
          <AvatarUpload uid={user.id} url={avatarUrl} name={form.full_name || user.email} size={72} table="client_profiles" onUpload={(url) => setAvatarUrl(url)} />
          <div>
            <h1 className="text-2xl font-bold text-[#03243F]" style={{fontFamily:'Playfair Display'}}>{form.full_name || 'My Account'}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">Free Client Account</span>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {[
            { id: 'profile', label: 'My Profile' },
            { id: 'messages', label: 'Messages' + (unreadCount > 0 ? ' (' + unreadCount + ')' : '') },
            { id: 'saved', label: 'Saved Trainers' },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setOpenConvId(null) }}
              className={"px-5 py-2 rounded-lg text-sm font-semibold transition-colors " + (activeTab === tab.id ? 'bg-white shadow text-[#03243F]' : 'text-gray-500 hover:text-gray-700')}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-[#03243F] mb-6" style={{fontFamily:'Playfair Display'}}>Edit Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{ label: 'Full Name', field: 'full_name', type: 'text' }, { label: 'Phone', field: 'phone', type: 'tel' }, { label: 'Age', field: 'age', type: 'number' }].map(({ label, field, type }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type={type} value={(form as any)[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]">
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select value={form.experience_level} onChange={e => setForm({ ...form, experience_level: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]">
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="athlete">Athlete</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Goals</label>
                  <textarea value={form.fitness_goals} onChange={e => setForm({ ...form, fitness_goals: e.target.value })} rows={3} placeholder="What are you looking to achieve?" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B] resize-none" />
                </div>
              </div>
              {message && <div className={"p-3 rounded-xl text-sm " + (message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700')}>{message}</div>}
              <button type="submit" disabled={saving} className="w-full bg-[#18A96B] text-white py-3 rounded-xl font-semibold hover:bg-[#15906A] disabled:opacity-50 transition-colors">{saving ? 'Saving...' : 'Save Profile'}</button>
            </form>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div>
            {!openConvId ? (
              <div className="space-y-3">
                {conversations.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <div className="text-5xl mb-4">💬</div>
                    <h3 className="text-xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>No conversations yet</h3>
                    <p className="text-gray-500 mb-4">Start chatting with trainers from their profile pages.</p>
                    <Link href="/search" className="inline-block bg-[#18A96B] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#15906A] transition-colors">Find Trainers</Link>
                  </div>
                ) : (
                  conversations.map(conv => {
                    const lastMsg = conv.messages?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                    const unread = conv.messages?.filter((m: any) => m.sender_type === 'trainer' && !m.is_read).length || 0
                    const trainer = conv.trainer_profiles
                    return (
                      <button key={conv.id} onClick={() => openConversation(conv)} className={"w-full text-left bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow border-l-4 " + (unread > 0 ? 'border-[#18A96B]' : 'border-transparent')}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#18A96B] to-[#03243F] overflow-hidden flex items-center justify-center text-white font-bold">
                              {trainer?.avatar_url ? <img src={trainer.avatar_url} alt="" className="w-full h-full object-cover" /> : trainer?.full_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-[#03243F]">{trainer?.full_name || 'Trainer'}</p>
                              {lastMsg && <p className="text-xs text-gray-400">{new Date(lastMsg.created_at).toLocaleDateString()}</p>}
                            </div>
                          </div>
                          {unread > 0 && <span className="bg-[#18A96B] text-white text-xs px-2 py-0.5 rounded-full font-bold">{unread} new</span>}
                        </div>
                        {lastMsg && (
                          <p className="text-sm text-gray-500 truncate">
                            {lastMsg.sender_type === 'client' ? 'You: ' : (trainer?.full_name?.split(' ')[0] || 'Trainer') + ': '}{lastMsg.body}
                          </p>
                        )}
                        {unread > 0 && (
                          <div className="mt-2 inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            {trainer?.full_name?.split(' ')[0]} replied!
                          </div>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            ) : (
              // Open conversation thread
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Thread header */}
                <div className="bg-[#03243F] text-white p-4 flex items-center gap-3">
                  <button onClick={() => setOpenConvId(null)} className="text-gray-300 hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div>
                    <p className="font-semibold">{conversations.find(c => c.id === openConvId)?.trainer_profiles?.full_name}</p>
                    <p className="text-xs text-gray-400">Trainer</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {openMessages.map(msg => (
                    <div key={msg.id} className={"flex " + (msg.sender_type === 'client' ? 'justify-end' : 'justify-start')}>
                      <div className={"max-w-[75%] px-4 py-2.5 rounded-2xl text-sm " + (msg.sender_type === 'client' ? 'bg-[#18A96B] text-white rounded-br-sm' : 'bg-white text-[#03243F] shadow-sm rounded-bl-sm')}>
                        {msg.body}
                        <div className={"text-[10px] mt-1 " + (msg.sender_type === 'client' ? 'text-green-100' : 'text-gray-400')}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendReply() }} placeholder="Type your message..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                  <button onClick={sendReply} disabled={sendingMsg || !newMsg.trim()} className="bg-[#18A96B] text-white px-4 py-2.5 rounded-xl hover:bg-[#15906A] disabled:opacity-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved Trainers Tab */}
        {activeTab === 'saved' && (
          <div>
            {savedTrainers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-5xl mb-4">🏋️</div>
                <h3 className="text-xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>No saved trainers</h3>
                <p className="text-gray-500 mb-4">Save trainers from their profiles to keep track of your favorites.</p>
                <Link href="/search" className="inline-block bg-[#18A96B] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#15906A] transition-colors">Find Trainers</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedTrainers.map((s: any) => (
                  <div key={s.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#18A96B] to-[#03243F] overflow-hidden flex items-center justify-center text-white font-bold text-lg">
                      {s.trainer_profiles?.avatar_url ? <img src={s.trainer_profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : s.trainer_profiles?.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#03243F]">{s.trainer_profiles?.full_name}</p>
                      {s.trainer_profiles?.tagline && <p className="text-xs text-gray-500 truncate">{s.trainer_profiles.tagline}</p>}
                    </div>
                    <Link href={"/trainers/" + s.trainer_profiles?.slug} className="text-sm text-[#18A96B] font-semibold hover:underline">View</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
