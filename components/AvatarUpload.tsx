'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AvatarUploadProps {
  uid: string
  url: string | null
  name: string
  size?: number
  onUpload: (url: string) => void
  table: 'trainer_profiles' | 'client_profiles'
}

export default function AvatarUpload({ uid, url, name, size = 96, onUpload, table }: AvatarUploadProps) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(url)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return }
    setUploading(true)
    try {
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      const ext = file.name.split('.').pop()
      const filePath = uid + '/avatar.' + ext
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const finalUrl = publicUrl + '?t=' + Date.now()
      const { error: updateError } = await supabase.from(table).update({ avatar_url: finalUrl }).eq('user_id', uid)
      if (updateError) throw updateError
      setPreviewUrl(finalUrl)
      onUpload(finalUrl)
    } catch (err: any) {
      alert('Upload failed: ' + err.message)
      setPreviewUrl(url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" style={{ width: size, height: size }} onClick={() => !uploading && fileInputRef.current?.click()}>
        <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#18A96B] to-[#03243F] flex items-center justify-center text-white font-bold select-none" style={{ fontSize: size * 0.33 }}>
          {previewUrl ? (
            <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          )}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} disabled={uploading} />
      <button type="button" onClick={() => !uploading && fileInputRef.current?.click()} disabled={uploading} className="text-xs text-[#18A96B] hover:underline disabled:opacity-50">
        {uploading ? 'Uploading...' : previewUrl ? 'Change photo' : 'Upload photo'}
      </button>
    </div>
  )
}
