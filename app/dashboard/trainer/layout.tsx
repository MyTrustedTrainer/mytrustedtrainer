import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TrainerSidebar from './TrainerSidebar'

export default async function TrainerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/dashboard/trainer')

  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select('id, full_name, profile_photo_url, plan_tier, slug')
    .eq('id', user.id)
    .maybeSingle()

  if (!trainer) redirect('/onboarding/trainer/1')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <TrainerSidebar trainer={trainer} />
      <main className="flex-1 md:ml-60 min-h-screen">
        {children}
      </main>
    </div>
  )
}
