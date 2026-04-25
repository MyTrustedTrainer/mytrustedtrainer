'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, ExternalLink, Upload } from 'lucide-react'

const FORMATS = ['In-Person', 'Virtual', 'Outdoor', 'Group', 'Corporate']

export default function MyProfilePage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [slug, setSlug] = useState<string | null>(null)
  const [trainerId, setTrainerId] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    tagline: '',
    bio: '',
    city: '',
    state: '',
    price_per_session: '',
    training_formats: [] as string[],
    profile_photo_url: '',
  })

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: trainer } = await supabase
      .from('trainer_profiles')
      .select('id, full_name, tagline, bio, city, state, price_per_session, training_formats, profile_photo_url, slug')
      .eq('id', user.id)
      .maybeSingle()

    if (trainer) {
      setTrainerId(trainer.id)
      setSlug(trainer.slug)
      setForm({
        full_name: trainer.full_name || '',
        tagline: trainer.tagline || '',
        bio: trainer.bio || '',
        city: trainer.city || '',
        state: trainer.state || '',
        price_per_session: trainer.price_per_session?.toString() || '',
        training_formats: trainer.training_formats || [],
        profile_photo_url: trainer.profile_photo_url || '',
      })
    }
    setLoading(false)
  }

  const toggleFormat = (f: string) => {
    setForm((prev) => ({
      ...prev,
      training_formats: prev.training_formats.includes(f)
        ? prev.training_formats.filter((x) => x !== f)
        : [...prev.training_formats, f],
    }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !trainerId) return
    const ext = file.name.split('.').pop()
    const path = `${trainerId}/avatar.${ext}`
    const { error } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
      setForm((prev) => ({ ...prev, profile_photo_url: data.publicUrl }))
    }
  }

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    await supabase
      .from('trainer_profiles')
      .update({
        full_name: form.full_name,
        tagline: form.tagline,
        bio: form.bio,
        city: form.city,
        state: form.state,
        price_per_session: form.price_per_session ? Number(form.price_per_session) : null,
        training_formats: form.training_formats,
        profile_photo_url: form.profile_photo_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="w-6 h-6 border-2 border-[#18A96B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[#03243F]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            My Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Your public trainer profile seen by clients.
          </p>
        </div>
        {slug && (
          <a
            href={`/trainers/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[#1652DB] hover:underline font-medium"
          >
            View public profile <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="space-y-5">
        {/* Photo */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Profile Photo</p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#18A96B]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {form.profile_photo_url ? (
                <img src={form.profile_photo_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#18A96B]">
                  {(form.full_name || 'T')[0].toUpperCase()}
                </span>
              )}
            </div>
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-[#03243F] hover:text-[#03243F] transition-colors">
              <Upload className="w-4 h-4" />
              Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Basic Info</p>

          <div>
            <label className="block text-sm font-medium text-[#03243F] mb-1">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#03243F] mb-1">Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
              placeholder="One-line description shown on your card"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#03243F] mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              rows={4}
              placeholder="Tell clients about your background and approach..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30 resize-none"
            />
          </div>
        </div>

        {/* Location & pricing */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Location & Pricing</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#03243F] mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#03243F] mb-1">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                maxLength={2}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#03243F] mb-1">Price per Session ($)</label>
            <input
              type="number"
              value={form.price_per_session}
              onChange={(e) => setForm((p) => ({ ...p, price_per_session: e.target.value }))}
              min={0}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18A96B]/30"
            />
          </div>
        </div>

        {/* Training formats */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Training Formats</p>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((f) => {
              const active = form.training_formats.includes(f)
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFormat(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    active
                      ? 'bg-[#18A96B]/10 border-[#18A96B] text-[#18A96B]'
                      : 'border-slate-200 text-slate-600 hover:border-[#03243F]'
                  }`}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3 bg-[#18A96B] hover:bg-[#159a5f] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved!
            </>
          ) : saving ? (
            'Saving…'
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  )
}
