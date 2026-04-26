import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckSquare, Star } from 'lucide-react'

export default async function CheckinsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/client/dashboard/checkins')

  const { data: leads } = await supabase
    .from('leads')
    .select('trainer_id, trainer_profiles(full_name, profile_photo_url, slug)')
    .eq('client_id', user.id)
    .eq('status', 'converted')

  const { data: checkins } = await supabase
    .from('checkins')
    .select(
      'id, trainer_id, created_at, energy_rating, session_rating, response_speed_rating, trainer_profiles(full_name)'
    )
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const trainerList = leads ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1
        className="text-2xl font-bold text-[#03243F] mb-2"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        Check-ins
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Rate your weekly experience. Ratings are always private and anonymous.
      </p>

      {trainerList.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Submit This Week
          </h2>
          <div className="flex flex-wrap gap-3">
            {trainerList.map((lead: any) => {
              const trainer = lead.trainer_profiles
              return (
                <Link
                  key={lead.trainer_id}
                  href={`/client/checkin/${lead.trainer_id}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#18A96B] hover:bg-[#159a5f] text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  Check in with {trainer?.full_name?.split(' ')[0] ?? 'Trainer'}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          History
        </h2>
        {!checkins?.length ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              No check-ins yet. Submit your first rating above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {checkins.map((ci: any) => {
              const date = new Date(ci.created_at).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })
              const trainer = ci.trainer_profiles as any
              return (
                <div
                  key={ci.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-[#03243F] text-sm">
                      {trainer?.full_name ?? 'Trainer'}
                    </p>
                    <p className="text-xs text-slate-400">{date}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    {ci.energy_rating != null && (
                      <span>
                        Energy:{' '}
                        <span className="text-[#F4A636]">
                          {'★'.repeat(ci.energy_rating)}{'☆'.repeat(5 - ci.energy_rating)}
                        </span>
                      </span>
                    )}
                    {ci.session_rating != null && (
                      <span>
                        Session:{' '}
                        <span className="text-[#F4A636]">
                          {'★'.repeat(ci.session_rating)}{'☆'.repeat(5 - ci.session_rating)}
                        </span>
                      </span>
                    )}
                    {ci.response_speed_rating != null && (
                      <span>
                        Response:{' '}
                        <span className="text-[#F4A636]">
                          {'★'.repeat(ci.response_speed_rating)}{'☆'.repeat(5 - ci.response_speed_rating)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
