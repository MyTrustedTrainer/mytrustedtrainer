←'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SPECIALTIES = [
  'Weight Loss','Strength Training','HIIT','Yoga','Pilates','CrossFit',
  'Sports Performance','Bodybuilding','Cardio','Flexibility','Senior Fitness',
  'Youth Athletics','Prenatal Fitness','Rehabilitation','Nutrition Coaching'
]

export default function TrainerEditProfile() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({
    full_name: '', tagline: '', bio: '', phone: '', email: '', website: '',
    instagram: '', facebook: '', youtube: '', tiktok: '', zip: ''
  })
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase
        .from('trainer_profiles')
        .select('*, trainer_specialties(*)')
        .eq('user_id', user.id)
        .single()
      if (p) {
        setProfile(p)
        setForm({
          full_name: p.full_name || '', tagline: p.tagline || '', bio: p.bio || '',
          phone: p.phone || '', email: p.email || '', website: p.website || '',
          instagram: p.instagram || '', facebook: p.facebook || '',
          youtube: p.youtube || '', tiktok: p.tiktok || '', zip: p.zip || ''
        })
        setSelectedSpecialties(p.trainer_specialties?.map((s: any) => s.specialty) || [])
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
      // Calculate completion %
      const fields = [form.full_name, form.bio, form.tagline, form.phone, form.email]
      const filled = fields.filter(Boolean).length
      const pct = Math.round((filled / fields.length) * 100)

      if (profile) {
        await supabase.from('trainer_profiles')
          .update({ ...form, profile_complete_pct: pct })
          .eq('id', profile.id)
        // Sync specialties
        await supabase.from('trainer_specialties').delete().eq('trainer_id', profile.id)
        if (selectedSpecialties.length > 0) {
          await supabase.from('trainer_specialties').insert(
            selectedSpecialties.map(s => ({ trainer_id: profile.id, specialty: s }))
          )
        }
      } else {
        // Create new profile
        const slug = form.full_name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
        const { data: newProfile } = await supabase.from('trainer_profiles')
          .insert({ ...form, user_id: user.id, slug, profile_complete_pct: pct })
          .select().single()
        if (newProfile && selectedSpecialties.length > 0) {
          await supabase.from('trainer_specialties').insert(
            selectedSpecialties.map(s => ({ trainer_id: newProfile.id, specialty: s }))
          )
        }
      }
      setMessage('Profile saved successfully!')
      setTimeout(() => router.push('/dashboard/trainer'), 1500)
    } catch (err: any) {
      setMessage('Error saving: ' + err.message)
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-[#03243F] flex items-center justify-center"><div className="text-white">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#03243F] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold" style={{fontFamily:'Playfair Display'}}>
            <span className="text-[#18A96B]">My</span>TrustedTrainer
          </span>
          <a href="/dashboard/trainer" className="text-gray-300 hover:text-white text-sm">← Back to Dashboard</a>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#03243F] mb-8" style={{fontFamily:'Playfair Display'}}>Edit Your Profile</h1>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#03243F] mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input type="text" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})}
                  placeholder="e.g. Certified NASM Trainer | Weight Loss Specialist"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                  rows={4} placeholder="Tell potential clients about yourself..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#03243F] mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {label:'Email', field:'email', type:'email'},
                {label:'Phone', field:'phone', type:'tel'},
                {label:'Website', field:'website', type:'url'},
                {label:'ZIP Code', field:'zip', type:'text'},
              ].map(({label, field, type}) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={(form as any)[field]} onChange={e => setForm({...form, [field]: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#03243F] mb-4">Social Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {label:'Instagram', field:'instagram', placeholder:'@username'},
                {label:'Facebook', field:'facebook', placeholder:'Profile URL'},
                {label:'YouTube', field:'youtube', placeholder:'Channel URL'},
                {label:'TikTok', field:'tiktok', placeholder:'@username'},
              ].map(({label, field, placeholder}) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={(form as any)[field]} onChange={e => setForm({...form, [field]: e.target.value})}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#18A96B]" />
                </div>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#03243F] mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map(s => (
                <button type="button" key={s}
                  onClick={() => setSelectedSpecialties(prev => 
                    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                  )}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSpecialties.includes(s)
                      ? 'bg-[#18A96B] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full bg-[#18A96B] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#15906A] disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
