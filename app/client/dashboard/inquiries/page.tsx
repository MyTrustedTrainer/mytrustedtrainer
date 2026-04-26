import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  invited: 'bg-amber-100 text-amber-700',
  pending: 'bg-slate-100 text-slate-600',
  unlocked: 'bg-blue-100 text-blue-700',
  converted: 'bg-green-100 text-green-700',
}

export default async function InquiriesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/client/dashboard/inquiries')

  const { data: leads } = await supabase
    .from('leads')
    .select(
      'id, status, message, created_at, updated_at, trainer_profiles(full_name, profile_photo_url, slug)'
    )
    .eq('client_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1
        className="text-2xl font-bold text-[#03243F] mb-6"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        Inquiries
      </h1>

      {!leads?.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">
            No inquiries yet. Find a trainer you love and reach out.
          </p>
          <Link
            href="/client/matches"
            className="inline-block px-5 py-2.5 bg-[#18A96B] hover:bg-[#159a5f] text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Browse Matches →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead: any) => {
            const trainer = lead.trainer_profiles
            const date = new Date(lead.updated_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
            const statusColor =
              STATUS_COLORS[lead.status] ?? 'bg-slate-100 text-slate-600'
            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden shrink-0">
                  {trainer?.profile_photo_url ? (
                    <img
                      src={trainer.profile_photo_url}
                      alt={trainer.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#03243F] font-bold text-sm">
                      {trainer?.full_name?.[0] ?? '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#03243F] text-sm">
                      {trainer?.full_name ?? 'Trainer'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </div>
                  {lead.message && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{lead.message}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">{date}</p>
                </div>
                {trainer?.slug && (
                  <Link
                    href={`/trainers/${trainer.slug}`}
                    className="shrink-0 text-xs font-semibold text-[#03243F] hover:text-[#18A96B] transition-colors"
                  >
                    View →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
