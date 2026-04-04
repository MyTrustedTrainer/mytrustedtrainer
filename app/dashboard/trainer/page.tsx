'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AvatarUpload from '@/components/AvatarUpload'

const FREE_LEAD_LIMIT = 3

// Pending Chat Request Card - trainer must claim or ignore
function PendingChatCard({ conv, onClaim, onIgnore, isFree, claimedCount }: {
    conv: any, onClaim: (id: string) => void, onIgnore: (id: string) => void, isFree: boolean, claimedCount: number
}) {
    const [claiming, setClaiming] = useState(false)
    const [ignoring, setIgnoring] = useState(false)
    const needsPayment = isFree && claimedCount >= FREE_LEAD_LIMIT

  async function handleClaim() {
        setClaiming(true)
        try {
                if (needsPayment) {
                          const res = await fetch('/api/conversations/' + conv.id + '/claim', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ confirm_pay: true })
                          })
                          const data = await res.json()
                          if (data.checkout_url) { window.location.href = data.checkout_url; return }
                }
                await onClaim(conv.id)
        } finally {
                setClaiming(false)
        }
  }

  async function handleIgnore() {
        setIgnoring(true)
        await onIgnore(conv.id)
        setIgnoring(false)
  }

  return (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-amber-300 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-4 py-2 flex items-center gap-2">
                      <span className="text-white text-xs font-bold tracking-wide">💬 NEW CHAT REQUEST</span>span>
                      <span className="text-amber-100 text-xs">· {new Date(conv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>span>
              </div>div>
              <div className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                  {conv.client_name?.charAt(0).toUpperCase()}
                                </div>div>
                                <div className="flex-1">
                                            <h4 className="font-bold text-[#03243F] text-lg">{conv.client_name}</h4>h4>
                                            <p className="text-sm text-gray-500">{conv.client_email}</p>p>
                                            <p className="text-xs text-gray-400 mt-1">Wants to start a live chat with you</p>p>
                                </div>div>
                      </div>div>
              
                {needsPayment ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                                <p className="text-xs text-amber-800 font-semibold mb-1">You've used all 3 free leads</p>p>
                                <p className="text-xs text-amber-700">Accept this chat for <strong>$15</strong>strong> one-time, or upgrade to Pro for unlimited leads.</p>p>
                    </div>div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                                <p className="text-xs text-green-800">Free lead ({claimedCount + 1} of {FREE_LEAD_LIMIT}). No cost to accept.</p>p>
                    </div>div>
                      )}
              
                      <div className="flex gap-2">
                                <button
                                              onClick={handleClaim}
                                              disabled={claiming}
                                              className="flex-1 bg-[#18A96B] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#15906A] disabled:opacity-50 transition-colors"
                                            >
                                  {claiming ? 'Accepting...' : needsPayment ? 'Accept for $15' : 'Accept Chat — Free'}
                                </button>button>
                        {!needsPayment && (
                      <a href="/for-trainers" className="px-3 py-2.5 bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-200 transition-colors text-center">
                                    Go Pro
                      </a>a>
                                )}
                                <button
                                              onClick={handleIgnore}
                                              disabled={ignoring}
                                              className="px-3 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                            >
                                  {ignoring ? '...' : 'Ignore'}
                                </button>button>
                      </div>div>
              </div>div>
        </div>div>
      )
}

// Active conversation card (claimed)
function ConversationCard({ conv }: { conv: any }) {
    const lastMsg = conv.messages?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        const unread = conv.messages?.filter((m: any) => m.sender_type === 'client' && !m.is_read).length || 0
            return (
                  <a href={'/dashboard/trainer/messages/' + conv.id}
                          className={'block bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow border-l-4 ' + (unread > 0 ? 'border-[#18A96B]' : 'border-transparent')}>
                        <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#18A96B] to-[#03243F] flex items-center justify-center text-white font-bold">
                                            {conv.client_name?.charAt(0).toUpperCase()}
                                          </div>div>
                                          <div>
                                                      <p className="font-semibold text-[#03243F]">{conv.client_name}</p>p>
                                                      <p className="text-xs text-gray-400">{conv.client_email}</p>p>
                                          </div>div>
                                </div>div>
                                <div className="flex items-center gap-2">
                                  {unread > 0 && <span className="bg-[#18A96B] text-white text-xs px-2 py-0.5 rounded-full font-bold">{unread} new</span>span>}
                                          <span className="text-xs text-gray-400">{lastMsg ? new Date(lastMsg.created_at).toLocaleDateString() : ''}</span>span>
                                </div>div>
                        </div>div>
                    {lastMsg && (
                                    <p className="text-sm text-gray-500 truncate pl-13">
                                      {lastMsg.sender_type === 'trainer' ? 'You: ' : ''}{lastMsg.body}
                                    </p>p>
                        )}
                  </a>a>
                )
}

function LeadCard({ lead, index, isFree, onUnlock }: { lead: any, index: number, isFree: boolean, onUnlock: (id: string) => void }) {
    const isLocked = isFree && index >= FREE_LEAD_LIMIT
        if (isLocked) {
              return (
                      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
                              <div className="p-5 filter blur-sm select-none pointer-events-none">
                                        <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-400">?</div>div>
                                                    <div className="flex-1">
                                                                  <div className="h-5 bg-gray-300 rounded w-32 mb-2" />
                                                                  <div className="h-4 bg-gray-200 rounded w-48 mb-1" />
                                                                  <div className="h-4 bg-gray-200 rounded w-40" />
                                                    </div>div>
                                        </div>div>
                              </div>div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-amber-100/90 to-transparent p-4">
                                        <div className="bg-white rounded-2xl shadow-lg p-5 text-center max-w-xs w-full border border-amber-200">
                                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>svg>
                                                    </div>div>
                                                    <p className="font-bold text-[#03243F] mb-1">New Lead Waiting</p>p>
                                                    <p className="text-sm text-gray-600 mb-4">You have used your 3 free leads. Unlock this one for $15 or upgrade to Pro.</p>p>
                                                    <div className="space-y-2">
                                                                  <button onClick={() => onUnlock(lead.id)} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">Unlock for $15</button>button>
                                                                  <a href="/for-trainers" className="block w-full border-2 border-[#18A96B] text-[#18A96B] py-2.5 rounded-xl font-semibold text-sm text-center hover:bg-[#18A96B] hover:text-white transition-colors">Upgrade to Pro — $49/mo</a>a>
                                                    </div>div>
                                        </div>div>
                              </div>div>
                      </div>div>
                    )
        }
    return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {lead.status === 'new' && (
                    <div className="bg-gradient-to-r from-[#18A96B] to-emerald-400 px-4 py-1.5 flex items-center gap-2">
                              <span className="text-white text-xs font-bold tracking-wide">🔥 NEW LEAD</span>span>
                              <span className="text-emerald-100 text-xs">· {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>span>
                    </div>div>
                )}
                <div className="p-5">
                        <div className="flex items-start gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#18A96B] to-[#03243F] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{lead.name.charAt(0).toUpperCase()}</div>div>
                                  <div className="flex-1 min-w-0">
                                              <div className="flex items-start justify-between gap-2 mb-1">
                                                            <h4 className="font-bold text-[#03243F] text-lg">{lead.name}</h4>h4>
                                                            <span className={"text-xs px-2.5 py-1 rounded-full font-medium " + (lead.status === 'new' ? 'bg-green-100 text-green-700' : lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' : lead.status === 'converted' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600')}>{lead.status}</span>span>
                                              </div>div>
                                              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                                            <span>{lead.email}</span>span>
                                              </div>div>
                                    {lead.message && <div className="bg-gray-50 rounded-xl p-3 mb-3"><p className="text-sm text-gray-700 italic">"{lead.message}"</p>p></div>div>}
                                              <a href={'mailto:' + lead.email + '?subject=Re: Your message on MyTrustedTrainer'}
                                                              className="block text-center bg-[#03243F] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#04305a] transition-colors">
                                                            Reply via Email
                                              </a>a>
                                  </div>div>
                        </div>div>
                </div>div>
          </div>div>
        )
}

export default function TrainerDashboard() {
    const supabase = createClient()
        const router = useRouter()
            const [user, setUser] = useState<any>(null)
                const [profile, setProfile] = useState<any>(null)
                    const [leads, setLeads] = useState<any[]>([])
                        const [conversations, setConversations] = useState<any[]>([])
                            const [views, setViews] = useState(0)
                                const [loading, setLoading] = useState(true)
                                    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
                                        const [activeTab, setActiveTab] = useState<'leads'|'chats'>('chats')
                                            const [unlockingLead, setUnlockingLead] = useState<string | null>(null)
                                              
                                                useEffect(() => {
                                                      async function load() {
                                                              const { data: { user } } = await supabase.auth.getUser()
                                                                      if (!user) { router.push('/login'); return }
                                                              setUser(user)
                                                                      const { data: profile } = await supabase
                                                                                .from('trainer_profiles')
                                                                                .select('*, trainer_scores(*)')
                                                                                .eq('user_id', user.id)
                                                                                .single()
                                                                              setProfile(profile)
                                                                                      setAvatarUrl(profile?.avatar_url || null)
                                                                                              if (profile) {
                                                                                                        const { data: leadsData } = await supabase
                                                                                                                    .from('leads')
                                                                                                                    .select('*')
                                                                                                                    .eq('trainer_id', profile.id)
                                                                                                                    .order('created_at', { ascending: false })
                                                                                                                  setLeads(leadsData || [])
                                                                                                                            const { data: convData } = await supabase
                                                                                                                                        .from('conversations')
                                                                                                                                        .select('*, messages(id, body, sender_type, created_at, is_read)')
                                                                                                                                        .eq('trainer_id', profile.id)
                                                                                                                                        .order('last_message_at', { ascending: false })
                                                                                                                                      setConversations(convData || [])
                                                                                                                                                const { count } = await supabase
                                                                                                                                                            .from('profile_views')
                                                                                                                                                            .select('*', { count: 'exact', head: true })
                                                                                                                                                            .eq('trainer_id', profile.id)
                                                                                                                                                          setViews(count || 0)
                                                                                                }
                                                              setLoading(false)
                                                      }
                                                      load()
                                                }, [])
                                                  
                                                    async function handleClaimConversation(convId: string) {
                                                          const res = await fetch('/api/conversations/' + convId + '/claim', {
                                                                  method: 'POST',
                                                                  headers: { 'Content-Type': 'application/json' },
                                                                  body: JSON.stringify({})
                                                          })
                                                                const data = await res.json()
                                                                      if (data.success) {
                                                                              setConversations(prev => prev.map(c => c.id === convId ? { ...c, lead_claim_status: 'claimed', is_unlocked: true } : c))
                                                                                      // Switch to the chat
                                                                              router.push('/dashboard/trainer/messages/' + convId)
                                                                      }
                                                    }
  
    async function handleIgnoreConversation(convId: string) {
          await fetch('/api/conversations/' + convId + '/claim', { method: 'DELETE' })
                setConversations(prev => prev.map(c => c.id === convId ? { ...c, lead_claim_status: 'ignored' } : c))
    }
  
    async function handleUnlockLead(leadId: string) {
          setUnlockingLead(leadId)
                try {
                        const res = await fetch('/api/unlock-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead_id: leadId }) })
                                const data = await res.json()
                                        if (data.url) window.location.href = data.url
                } catch (err) { alert('Payment error. Please try again.') }
          finally { setUnlockingLead(null) }
    }
  
    const isFree = profile?.plan === 'free' || !profile?.plan
        const claimedConversations = conversations.filter(c => c.lead_claim_status === 'claimed')
            const pendingConversations = conversations.filter(c => c.lead_claim_status === 'pending')
                const claimedCount = claimedConversations.length
                    const newLeadsCount = leads.filter(l => l.status === 'new').length
                        const unreadMessages = claimedConversations.reduce((acc, c) => {
                              const unread = (c.messages || []).filter((m: any) => m.sender_type === 'client' && !m.is_read).length
                                    return acc + unread
                        }, 0)
                          
                            if (loading) return <div className="min-h-screen bg-[#03243F] flex items-center justify-center"><div className="text-white text-xl">Loading dashboard...</div>div></div>div>
                              
                                return (
                                  <div className="min-h-screen bg-gray-50">
                                        <header className="bg-[#03243F] text-white">
                                                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                                                          <div className="flex items-center gap-3">
                                                                      <span className="text-2xl font-bold" style={{fontFamily:'Playfair Display'}}><span className="text-[#18A96B]">My</span>span>TrustedTrainer</span>span>
                                                                      <span className="text-gray-400 text-sm hidden sm:block">Trainer Dashboard</span>span>
                                                          </div>div>
                                                          <div className="flex items-center gap-4">
                                                            {profile && <a href={'/trainers/' + profile.slug} target="_blank" className="text-sm text-[#18A96B] hover:underline">View Profile</a>a>}
                                                                      <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-sm text-gray-300 hover:text-white">Sign Out</button>button>
                                                          </div>div>
                                                </div>div>
                                        </header>header>
                                  
                                        <div className="max-w-7xl mx-auto px-4 py-8">
                                          {!profile ? (
                                              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                                                          <h2 className="text-2xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>Complete Your Profile</h2>h2>
                                                          <a href="/dashboard/trainer/edit" className="bg-[#18A96B] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#15906A] transition-colors inline-block">Set Up Profile</a>a>
                                              </div>div>
                                            ) : (
                                              <>
                                                          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                                                        <AvatarUpload uid={user.id} url={avatarUrl} name={profile.full_name || user.email} size={80} table="trainer_profiles" onUpload={(url) => setAvatarUrl(url)} />
                                                                        <div className="flex-1">
                                                                                        <h1 className="text-2xl font-bold text-[#03243F]" style={{fontFamily:'Playfair Display'}}>{profile.full_name}</h1>h1>
                                                                          {profile.tagline && <p className="text-gray-500">{profile.tagline}</p>p>}
                                                                                        <div className="flex items-center gap-3 mt-2">
                                                                                                          <span className={"px-3 py-1 rounded-full text-sm font-semibold " + (profile.plan === 'elite' ? 'bg-purple-100 text-purple-700' : profile.plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600')}>
                                                                                                            {(profile.plan || 'free').toUpperCase()} PLAN
                                                                                                            </span>span>
                                                                                          {isFree && <a href="/for-trainers" className="text-sm text-[#18A96B] font-semibold hover:underline">Upgrade to Pro</a>a>}
                                                                                          </div>div>
                                                                        </div>div>
                                                                        <a href="/dashboard/trainer/edit" className="bg-[#03243F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#04305a] transition-colors">Edit Profile</a>a>
                                                          </div>div>
                                              
                                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                                        <div className="bg-white rounded-2xl shadow-sm p-5">
                                                                                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Profile Views</p>p>
                                                                                        <p className="text-3xl font-bold text-[#03243F]">{views}</p>p>
                                                                        </div>div>
                                                                        <div className="bg-white rounded-2xl shadow-sm p-5">
                                                                                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Chats Claimed</p>p>
                                                                                        <p className="text-3xl font-bold text-[#18A96B]">{claimedCount}</p>p>
                                                                          {isFree && <p className="text-xs text-gray-400">{Math.min(claimedCount, FREE_LEAD_LIMIT)}/{FREE_LEAD_LIMIT} free</p>p>}
                                                                        </div>div>
                                                                        <div className="bg-white rounded-2xl shadow-sm p-5">
                                                                                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Avg Rating</p>p>
                                                                                        <p className="text-3xl font-bold text-[#F4A636]">{profile.trainer_scores?.overall_score?.toFixed(1) || 'N/A'}</p>p>
                                                                        </div>div>
                                                                        <div className="bg-white rounded-2xl shadow-sm p-5">
                                                                                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Unread Msgs</p>p>
                                                                                        <p className="text-3xl font-bold text-[#03243F]">{unreadMessages}</p>p>
                                                                        </div>div>
                                                          </div>div>
                                              
                                                {pendingConversations.length > 0 && (
                                                              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 mb-6 flex items-center gap-4 text-white">
                                                                              <div className="text-3xl">💬</div>div>
                                                                              <div className="flex-1">
                                                                                                <h3 className="font-bold text-lg">{pendingConversations.length} pending chat request{pendingConversations.length !== 1 ? 's' : ''}!</h3>h3>
                                                                                                <p className="text-amber-100 text-sm">Clients are waiting. Accept to start a live chat.</p>p>
                                                                              </div>div>
                                                              </div>div>
                                                          )}
                                              
                                                          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
                                                                        <button onClick={() => setActiveTab('chats')}
                                                                                          className={"px-5 py-2 rounded-lg text-sm font-semibold transition-colors " + (activeTab === 'chats' ? 'bg-white shadow text-[#03243F]' : 'text-gray-500 hover:text-gray-700')}>
                                                                                        Chats {(pendingConversations.length + unreadMessages) > 0 && <span className="ml-1.5 bg-[#18A96B] text-white text-xs px-1.5 py-0.5 rounded-full">{pendingConversations.length + unreadMessages}</span>span>}
                                                                        </button>button>
                                                                        <button onClick={() => setActiveTab('leads')}
                                                                                          className={"px-5 py-2 rounded-lg text-sm font-semibold transition-colors " + (activeTab === 'leads' ? 'bg-white shadow text-[#03243F]' : 'text-gray-500 hover:text-gray-700')}>
                                                                                        Leads {newLeadsCount > 0 && <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{newLeadsCount}</span>span>}
                                                                        </button>button>
                                                          </div>div>
                                              
                                                {activeTab === 'chats' && (
                                                              <div className="space-y-4">
                                                                {pendingConversations.length > 0 && (
                                                                                  <div>
                                                                                                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pending Requests</h3>h3>
                                                                                                      <div className="space-y-4">
                                                                                                        {pendingConversations.map(conv => (
                                                                                                            <PendingChatCard key={conv.id} conv={conv} onClaim={handleClaimConversation} onIgnore={handleIgnoreConversation} isFree={isFree} claimedCount={claimedCount} />
                                                                                                          ))}
                                                                                                        </div>div>
                                                                                    </div>div>
                                                                              )}
                                                                {claimedConversations.length > 0 && (
                                                                                  <div>
                                                                                    {pendingConversations.length > 0 && <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-6">Active Chats</h3>h3>}
                                                                                                      <div className="space-y-3">
                                                                                                        {claimedConversations.map(conv => <ConversationCard key={conv.id} conv={conv} />)}
                                                                                                        </div>div>
                                                                                    </div>div>
                                                                              )}
                                                                {conversations.length === 0 && (
                                                                                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                                                                                      <div className="text-5xl mb-4">💬</div>div>
                                                                                                      <h3 className="text-xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>No chats yet</h3>h3>
                                                                                                      <p className="text-gray-500">When clients message you through your profile, they will appear here.</p>p>
                                                                                    </div>div>
                                                                              )}
                                                              </div>div>
                                                          )}
                                              
                                                {activeTab === 'leads' && (
                                                              <div className="space-y-4">
                                                                {leads.length === 0 ? (
                                                                                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                                                                                      <div className="text-5xl mb-4">📬</div>div>
                                                                                                      <h3 className="text-xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>No leads yet</h3>h3>
                                                                                                      <a href="/dashboard/trainer/edit" className="inline-block bg-[#18A96B] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#15906A] transition-colors">Complete Profile</a>a>
                                                                                    </div>div>
                                                                                ) : leads.map((lead, i) => (
                                                                                  <LeadCard key={lead.id} lead={lead} index={i} isFree={isFree} onUnlock={handleUnlockLead} />
                                                                                ))}
                                                              </div>div>
                                                          )}
                                              </>>
                                            )}
                                        </div>div>
                                  </div>div>
                                )
                              }</></div>
