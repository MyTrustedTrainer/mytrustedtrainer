import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Check if trainer profile exists
  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (trainer) redirect('/dashboard/trainer')
  
  // Check for signup role in metadata
  const role = user.user_metadata?.role
  if (role === 'trainer') redirect('/dashboard/trainer')
  
  // Default trainer dashboard
  redirect('/dashboard/trainer')
}