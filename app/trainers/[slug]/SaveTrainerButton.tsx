'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  trainerId: string
  initialSaved: boolean
}

export default function SaveTrainerButton({ trainerId, initialSaved }: Props) {
  const [saved, setSaved]     = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const supabase              = createClient()

  const toggle = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: cp } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!cp) return

      if (saved) {
        await supabase
          .from('saved_trainers')
          .delete()
          .eq('client_id', cp.id)
          .eq('trainer_id', trainerId)
        setSaved(false)
      } else {
        await supabase
          .from('saved_trainers')
          .insert({ client_id: cp.id, trainer_id: trainerId })
        setSaved(true)
      }
    } catch (err) {
      console.error('save trainer error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
        saved
          ? 'bg-[#18A96B]/10 border-[#18A96B] text-[#18A96B]'
          : 'bg-transparent border-white/30 text-white hover:border-white/60'
      } disabled:opacity-60`}
    >
      <Heart className={`w-4 h-4 transition-all ${saved ? 'fill-[#18A96B] text-[#18A96B]' : ''}`} />
      {saved ? 'Saved' : 'Save Trainer'}
    </button>
  )
}
