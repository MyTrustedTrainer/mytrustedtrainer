'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function TrainerDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [views, setViews] = useState(0)
  const [loading, setLoading] = useState(true)

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
      if (profile) {
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .eq('trainer_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10)
        setLeads(leadsData || [])
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
            <span className="text-gray-400 text-sm">Trainer Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            {profile && (
              <a href={`/trainers/${profile.slug}`} target="_blank" 
                className="text-sm text-[#18A96B] hover:underline">
                View Public Profile →
              </a>
            )}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
              className="text-sm text-gray-300 hover:text-white"
            >Sign Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!profile ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>
              Complete Your Profile
            </h2>
            <p className="text-gray-600 mb-6">Set up your trainer profile to start getting leads.</p>
            <a href="/dashboard/trainer/setup" className="bg-[#18A96B] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#15906A] transition-colors inline-block">
              Set Up Profile
            </a>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">Profile Views</p>
                <p className="text-3xl font-bold text-[#03243F]">{views}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">Total Leads</p>
                <p className="text-3xl font-bold text-[#18A96B]">{leads.length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">Overall Score</p>
                <p className="text-3xl font-bold text-[#F4A636]">
                  {profile.trainer_scores?.overall_score?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-1">Plan</p>
                <p className="text-3xl font-bold text-[#03243F] capitalize">{profile.plan}</p>
                {profile.plan === 'free' && (
                  <a href="/for-trainers" className="text-xs text-[#18A96B] hover:underline mt-1 block">Upgrade →</a>
                )}
              </div>
            </div>

            {/* Recent Leads */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h3 className="text-xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>Recent Leads</h3>
              {leads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No leads yet. Keep your profile active to attract clients.</p>
              ) : (
                <div className="space-y-4">
                  {leads.map(lead => (
                    <div key={lead.id} className="border border-gray-100 rounded-xl p-4 flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-[#03243F]">{lead.name}</p>
                        <p className="text-sm text-gray-600">{lead.email} {lead.phone ? '· ' + lead.phone : ''}</p>
                        {lead.message && <p className="text-sm text-gray-500 mt-1">{lead.message}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          lead.status === 'new' ? 'bg-green-100 text-green-700' :
                          lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                          lead.status === 'converted' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{lead.status}</span>
                        <p className="text-xs text-gray-400 mt-1">{new Date(lead.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-[#03243F] mb-4" style={{fontFamily:'Playfair Display'}}>Profile Completion</h3>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                <div 
                  className="bg-[#18A96B] h-3 rounded-full transition-all"
                  style={{width: `${profile.profile_complete_pct || 0}%`}}
                />
              </div>
              <p className="text-sm text-gray-600">{profile.profile_complete_pct || 0}% complete</p>
              <a href="/dashboard/trainer/edit" className="inline-block mt-4 bg-[#03243F] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[#04305a] transition-colors">
                Edit Profile
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}