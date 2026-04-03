'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SPECIALTIES = ['Weight Loss','Strength Training','HIIT','Yoga','Pilates','CrossFit','Sports Performance','Bodybuilding','Cardio','Flexibility','Senior Fitness','Youth Athletics','Prenatal Fitness','Rehabilitation','Nutrition Coaching']
const AVAILABILITY_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function calcCompletion(form: any, specialties: string[]) {
  const fields = [form.full_name, form.bio, form.tagline, form.phone, form.email, form.zip, form.price_per_session, form.training_format]
  const filled = fields.filter(Boolean).length
  const hasSpecialties = specialties.length > 0 ? 1 : 0
  return Math.round(((filled + hasSpecialties) / (fields.length + 1)) * 100)
}

export default function TrainerEditProfile() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('basics')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [form, setForm] = useState({
    full_name: '', tagline: '', bio: '', phone: '', email: '',
    website: '', instagram: '', facebook: '', youtube: '', tiktok: '',
    zip: '', price_per_session: '', training_format: 'both',
    availability_days: [] as string[], availability_note: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('trainer_profiles').select('*, trainer_specialties(*)').eq('user_id', user.id).single()
      if (p) {
        setProfile(p)
        setForm({
          full_name: p.full_name || '', tagline: p.tagline || '', bio: p.bio || '',
          phone: p.phone || '', email: p.email || '', website: p.website || '',
          instagram: p.instagram || '', facebook: p.facebook || '',
          youtube: p.youtube || '', tiktok: p.tiktok || '', zip: p.zip || '',
          price_per_session: p.price_per_session ? String(p.price_per_session) : '',
          training_format: p.training_format || 'both',
          availability_days: p.availability_days || [], availability_note: p.availability_note || '',
        })
        setSelectedSpecialties(p.trainer_specialties?.map((s: any) => s.specialty) || [])
      } else {
        const { data: { user: u } } = await supabase.auth.getUser()
        setForm(f => ({ ...f, email: u?.email || '' }))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const pct = calcCompletion(form, selectedSpecialties)
      const profileData = {
        full_name: form.full_name, tagline: form.tagline, bio: form.bio,
        phone: form.phone, email: form.email, website: form.website,
        instagram: form.instagram, facebook: form.facebook, youtube: form.youtube,
        tiktok: form.tiktok, zip: form.zip,
        price_per_session: form.price_per_session ? parseFloat(form.price_per_session) : null,
        training_format: form.training_format, availability_days: form.availability_days,
        availability_note: form.availability_note, profile_complete_pct: pct,
      }
      let profileId = profile?.id
      if (profile) {
        const { error } = await supabase.from('trainer_profiles').update(profileData).eq('id', profile.id)
        if (error) throw error
      } else {
        const slug = form.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
        const { data: newProfile, error } = await supabase.from('trainer_profiles').insert({ ...profileData, user_id: user.id, slug, plan: 'free' }).select().single()
        if (error) throw error
        setProfile(newProfile)
        profileId = newProfile.id
      }
      if (profileId) {
        await supabase.from('trainer_specialties').delete().eq('trainer_id', profileId)
        if (selectedSpecialties.length > 0) {
          await supabase.from('trainer_specialties').insert(selectedSpecialties.map(s => ({ trainer_id: profileId, specialty: s })))
        }
      }
      setMessage('Profile saved successfully!')
      setTimeout(() => router.push('/dashboard/trainer'), 1500)
    } catch (err: any) {
      setMessage('Error saving: ' + err.message)
    }
    setSaving(false)
  }

  const completionPct = calcCompletion(form, selectedSpecialties)
  const tabs = [{id:'basics',label:'Basics'},{id:'contact',label:'Contact & Social'},{id:'training',label:'Training & Pricing'},{id:'availability',label:'Availability'},{id:'specialties',label:'Specialties'}]

  if (loading) return <div className="min-h-screen bg-[#03243F] flex items-center justify-center"><div className="text-white">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#03243F] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold" style={{fontFamily:'Playfair Display'}}><span className="text-[#18A96B]">My</span>TrustedTrainer</span>
          <a href="/dashboard/trainer" className="text-gray-300 hover:text-white text-sm">Back to Dashboard</a>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[#03243F]" style={{fontFamily:'Playfair Display'}}>{profile ? 'Edit Your Profile' : 'Create Your Profile'}</h1>
          <span className="text-sm text-gray-500">{completionPct}% complete</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div className="bg-[#18A96B] h-2 rounded-full transition-all" style={{width: completionPct + '%'}} />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max py-2 px-3 rounded-lg text-sm font-medium ${activeTab === tab.id ? 'bg-white shadow text-[#03243F]' : 'text-gray-500'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSave}>
          {activeTab === 'basics' && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold text-[#03243F]">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input type="text" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} placeholder="e.g. NASM Certified | Weight Loss Specialist"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={5} placeholder="Tell potential clients about your experience..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
              </div>
            </div>
          )}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold text-[#03243F]">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([{label:'Email *',field:'email',type:'email'},{label:'Phone',field:'phone',type:'tel'},{label:'Website',field:'website',type:'url'},{label:'ZIP Code',field:'zip',type:'text'}] as {label:string,field:string,type:string}[]).map(({label,field,type}) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type={type} value={(form as any)[field]} onChange={e => setForm({...form,[field]:e.target.value})} required={field==='email'}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                  </div>
                ))}
              </div>
              <h2 className="text-xl font-semibold text-[#03243F] pt-2">Social Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([{label:'Instagram',field:'instagram',ph:'@username'},{label:'Facebook',field:'facebook',ph:'Profile URL'},{label:'YouTube',field:'youtube',ph:'Channel URL'},{label:'TikTok',field:'tiktok',ph:'@username'}] as {label:string,field:string,ph:string}[]).map(({label,field,ph}) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type="text" value={(form as any)[field]} onChange={e => setForm({...form,[field]:e.target.value})} placeholder={ph}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'training' && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold text-[#03243F]">Training & Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Session ($)</label>
                  <input type="number" value={form.price_per_session} onChange={e => setForm({...form, price_per_session: e.target.value})} placeholder="65" min="0" step="5"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Training Format</label>
                  <select value={form.training_format} onChange={e => setForm({...form, training_format: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]">
                    <option value="in-person">In-Person Only</option>
                    <option value="online">Online Only</option>
                    <option value="both">In-Person & Online</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'availability' && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold text-[#03243F]">Availability</h2>
              <p className="text-sm text-gray-500">Select your generally available days:</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_DAYS.map(day => (
                  <button type="button" key={day}
                    onClick={() => setForm(f => ({...f, availability_days: f.availability_days.includes(day) ? f.availability_days.filter(d => d !== day) : [...f.availability_days, day]}))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${form.availability_days.includes(day) ? 'bg-[#18A96B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {day}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional notes</label>
                <textarea value={form.availability_note} onChange={e => setForm({...form, availability_note: e.target.value})} rows={3} placeholder="e.g. Early mornings preferred..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
              </div>
            </div>
          )}
          {activeTab === 'specialties' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#03243F] mb-2">Specialties</h2>
              <p className="text-sm text-gray-500 mb-4">Select all that apply.</p>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => (
                  <button type="button" key={s} onClick={() => setSelectedSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedSpecialties.includes(s) ? 'bg-[#18A96B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
              {selectedSpecialties.length > 0 && <p className="text-sm text-[#18A96B] mt-3">{selectedSpecialties.length} selected</p>}
            </div>
          )}
          {message && <div className={`mt-4 p-4 rounded-xl ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{message}</div>}
          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 bg-[#18A96B] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#15906A] disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <a href="/dashboard/trainer" className="px-6 py-4 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  )
                    }
