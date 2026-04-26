import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Heart, MapPin, X } from 'lucide-react'

async function unsaveTrainer(formData: FormData) {
  'use server'
  const savedId = formData.get('savedId') as string
  const supabase = createClient()
  await supabase.from('saved_trainers').delete().eq('id', savedId)
  revalidatePath('/client/dashboard/saved')
}

export default async function SavedTrainersPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/client/dashboard/saved')

  const { data: saved } = await supabase
    .from('saved_trainers')
    .select(
      'id, trainer_id, trainer_profiles(full_name, profile_photo_url, slug, city, state, price_per_session)'
    )
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1
        className="text-2xl font-bold text-[#03243F] mb-6"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        Saved Trainers
      </h1>

      {!saved?.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">
            No saved trainers yet. Browse your matches.
          </p>
          <Link
            href="/client/matches"
            className="inline-block px-5 py-2.5 bg-[#18A96B] hover:bg-[#159a5f] text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Find Trainers →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((item: any) => {
            const trainer = item.trainer_profiles
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="relative h-36 bg-slate-100">
                  {trainer?.profile_photo_url ? (
                    <img
                      src={trainer.profile_photo_url}
                      alt={trainer.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#03243F]/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-[#03243F]">
                          {trainer?.full_name?.[0] ?? '?'}
                        </span>
                      </div>
                    </div>
                  )}
                  <form action={unsaveTrainer} className="absolute top-2 right-2">
                    <input type="hidden" name="savedId" value={item.id} />
                    <button
                      type="submit"
                      title="Remove"
                      className="bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </form>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-[#03243F] text-sm">{trainer?.full_name}</p>
                  {trainer?.city && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {trainer.city}, {trainer.state}
                    </p>
                  )}
                  {trainer?.price_per_session && (
                    <p className="text-xs font-semibold text-[#18A96B] mt-1">
                      ${trainer.price_per_session}/session
                    </p>
                  )}
                  {trainer?.slug && (
                    <Link
                      href={`/trainers/${trainer.slug}`}
                      className="mt-3 block text-center py-2 border border-[#03243F] text-[#03243F] hover:bg-[#03243F] hover:text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      View Profile
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
