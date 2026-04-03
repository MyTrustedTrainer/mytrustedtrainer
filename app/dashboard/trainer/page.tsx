'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AvatarUpload from '@/components/AvatarUpload'

const FREE_LEAD_LIMIT = 3

function LeadCard({ lead, index, isFree, onUnlock }: { lead: any, index: number, isFree: boolean, onUnlock: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const isLocked = isFree && index >= FREE_LEAD_LIMIT

  if (isLocked) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
        {/* Blurred preview */}
        <div className="p-5 filter blur-sm select-none pointer-events-none">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-400">?</div>
            <div className="flex-1">
              <div className="h-5 bg-gray-300 rounded w-32 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-48 mb-1" />
              <div className="h-4 bg-gray-200 rounded w-40" />
            </div>
          </div>
        </div>

        {/* Unlock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-amber-100/90 to-transparent p-4">
          <div className="bg-white rounded-2xl shadow-lg p-5 text-center max-w-xs w-full border border-amber-200">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <p className="font-bold text-[#03243F] mb-1">New Lead Waiting</p>
            <p className="text-sm text-gray-600 mb-4">You've used your 3 free leads. Unlock this one for $15 or upgrade to Pro for unlimited leads.</p>
            <div className="space-y-2">
              <button onClick={() => onUnlock(lead.id)} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                Unlock for $15
              </button>
              <a href="/for-trainers" className="block w-full border-2 border-[#18A96B] text-[#18A96B] py-2.5 rounded-xl font-semibold text-sm text-center hover:bg-[#18A96B] hover:text-white transition-colors">
                Upgrade to Pro — $49/mo
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Hot new badge */}
      {lead.status === 'new' && (
        <div className="bg-gradient-to-r from-[#18A96B] to-emerald-400 px-4 py-1.5 flex items-center gap-2">
          <span className="text-white text-xs font-bold tracking-wide">🔥 NEW LEAD</span>
          <span className="text-emerald-100 text-xs">· {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#18A96B] to-[#03243F] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {lead.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-bold text-[#03243F] text-lg">{lead.name}</h4>
              <span className={"text-xs px-2.5 py-1 rounded-full font-medium " + (lead.status === 'new' ? 'bg-green-100 text-green-700' : lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' : lead.status === 'converted' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600')}>
                {lead.status}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {lead.email}
              </span>
              {lead.phone && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {lead.phone}
                </span>
              )}
            </div>

            {lead.message && (
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-sm text-gray-700 italic">"{lead.message}"</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <a href={"mailto:" + lead.email + "?subject=Re: Your message on MyTrustedTrainer"} className="flex-1 text-center bg-[#03243F] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#04305a] transition-colors">
                Reply via Email
              </a>
              {lead.phone && (
                <a href={"tel:" + lead.phone} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                  Call
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
  const [activeTab, setActiveTab] = useState<'leads'|'messages'>('leads')
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

  async function handleUnlockLead(leadId: string) {
    // Redirect to Stripe for $15 payment
    setUnlockingLead(leadId)
    try {
      const res = await fetch('/api/unlock-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      alert('Payment error. Please try again.')
    } finally {
      setUnlockingLead(null)
    }
  }

  const isFree = profile?.plan === 'free'
  const newLeadsCount = leads.filter(l => l.status === 'new').length
  const unreadMessages = conversations.reduce((acc, c) => {
    const unread = (c.messages || []).filter((m: any) => m.sender_type === 'client' && !m.is_read).length
    return acc + unread
  }, 0)

  if (loading) return (
    <div className="min-h-screen bg-[#03243F] flex items-center justify-center">
      <div className="text-white text-xl">Loading dashboard...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#03243F] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold" style={{fontFamily:'Playfair Display'}}>
              <span className="text-[#18A96B]">My</span>TrustedTrainer
            </span>
            <span className="text-gray-400 text-sm hidden sm:block">Trainer Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            {profile && (
              <a href={"/trainers/" + profile.slug} target="_blank" className="text-sm text-[#18A96B] hover:underline">
                View Profile →
              </a>
            )}
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-sm text-gray-300 hover:text-white">Sign Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!profile ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>Complete Your Profile</h2>
            <p className="text-gray-600 mb-6">Set up your trainer profile to start getting leads.</p>
            <a href="/dashboard/trainer/edit" className="bg-[#18A96B] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#15906A] transition-colors inline-block">Set Up Profile</a>
          </div>
        ) : (
          <>
            {/* Profile header row */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row items-start md:items-center gap-6">
              <AvatarUpload
                uid={user.id}
                url={avatarUrl}
                name={profile.full_name || user.email}
                size={80}
                table="trainer_profiles"
                onUpload={(url) => setAvatarUrl(url)}
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#03243F]" style={{fontFamily:'Playfair Display'}}>{profile.full_name}</h1>
                {profile.tagline && <p className="text-gray-500">{profile.tagline}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <span className={"px-3 py-1 rounded-full text-sm font-semibold " + (profile.plan === 'elite' ? 'bg-purple-100 text-purple-700' : profile.plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600')}>
                    {profile.plan?.toUpperCase()} PLAN
                  </span>
                  {isFree && (
                    <a href="/for-trainers" className="text-sm text-[#18A96B] font-semibold hover:underline">Upgrade to Pro →</a>
                  )}
                </div>
              </div>
              <a href="/dashboard/trainer/edit" className="bg-[#03243F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#04305a] transition-colors">Edit Profile</a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Profile Views</p>
                <p className="text-3xl font-bold text-[#03243F]">{views}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Total Leads</p>
                <p className="text-3xl font-bold text-[#18A96B]">{leads.length}</p>
                {isFree && <p className="text-xs text-gray-400">{Math.min(leads.length, FREE_LEAD_LIMIT)}/{FREE_LEAD_LIMIT} free used</p>}
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Avg Rating</p>
                <p className="text-3xl font-bold text-[#F4A636]">{profile.trainer_scores?.overall_score?.toFixed(1) || 'N/A'}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Unread Msgs</p>
                <p className="text-3xl font-bold text-[#03243F]">{unreadMessages}</p>
              </div>
            </div>

            {/* Free tier upgrade prompt */}
            {isFree && leads.length >= FREE_LEAD_LIMIT && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 mb-6 flex items-center gap-4 text-white">
                <div className="text-3xl">🚀</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">You have {leads.length - FREE_LEAD_LIMIT} locked lead{leads.length - FREE_LEAD_LIMIT !== 1 ? 's' : ''}!</h3>
                  <p className="text-amber-100 text-sm">Upgrade to Pro for unlimited leads, featured placement, and full analytics.</p>
                </div>
                <a href="/for-trainers" className="bg-white text-amber-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-50 transition-colors whitespace-nowrap">
                  Upgrade Now
                </a>
              </div>
            )}

            {/* Tab nav */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
              <button onClick={() => setActiveTab('leads')} className={"px-5 py-2 rounded-lg text-sm font-semibold transition-colors " + (activeTab === 'leads' ? 'bg-white shadow text-[#03243F]' : 'text-gray-500 hover:text-gray-700')}>
                Leads {newLeadsCount > 0 && <span className="ml-1.5 bg-[#18A96B] text-white text-xs px-1.5 py-0.5 rounded-full">{newLeadsCount}</span>}
              </button>
              <button onClick={() => setActiveTab('messages')} className={"px-5 py-2 rounded-lg text-sm font-semibold transition-colors " + (activeTab === 'messages' ? 'bg-white shadow text-[#03243F]' : 'text-gray-500 hover:text-gray-700')}>
                Messages {unreadMessages > 0 && <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadMessages}</span>}
              </button>
            </div>

            {/* Leads Tab */}
            {activeTab === 'leads' && (
              <div className="space-y-4">
                {leads.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <div className="text-5xl mb-4">📬</div>
                    <h3 className="text-xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>No leads yet</h3>
                    <p className="text-gray-500 mb-4">Complete your profile to start appearing in search results.</p>
                    <a href="/dashboard/trainer/edit" className="inline-block bg-[#18A96B] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#15906A] transition-colors">Complete Profile</a>
                  </div>
                ) : (
                  leads.map((lead, i) => (
                    <LeadCard key={lead.id} lead={lead} index={i} isFree={isFree} onUnlock={handleUnlockLead} />
                  ))
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-3">
                {conversations.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <div className="text-5xl mb-4">💬</div>
                    <h3 className="text-xl font-bold text-[#03243F] mb-2" style={{fontFamily:'Playfair Display'}}>No messages yet</h3>
                    <p className="text-gray-500">When prospects message you through your profile, they'll appear here.</p>
                  </div>
                ) : (
                  conversations.map(conv => {
                    const lastMsg = conv.messages?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                    const unread = conv.messages?.filter((m: any) => m.sender_type === 'client' && !m.is_read).length || 0
                    return (
                      <a key={conv.id} href={"/dashboard/trainer/messages/" + conv.id} className={"block bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow border-l-4 " + (unread > 0 ? 'border-[#18A96B]' : 'border-transparent')}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#18A96B] to-[#03243F] flex items-center justify-center text-white font-bold">
                              {conv.client_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-[#03243F]">{conv.client_name}</p>
                              <p className="text-xs text-gray-400">{conv.client_email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {unread > 0 && (
                              <span className="bg-[#18A96B] text-white text-xs px-2 py-0.5 rounded-full font-bold">{unread} new</span>
                            )}
                            <span className="text-xs text-gray-400">{lastMsg ? new Date(lastMsg.created_at).toLocaleDateString() : ''}</span>
                          </div>
                        </div>
                        {lastMsg && (
                          <p className="text-sm text-gray-500 truncate pl-13">
                            {lastMsg.sender_type === 'trainer' ? 'You: ' : ''}{lastMsg.body}
                          </p>
                        )}
                      </a>
                    )
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
