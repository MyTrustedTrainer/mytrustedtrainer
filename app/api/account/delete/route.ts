import { createClient } from '@supabase/supabase-js'
  import { createClient as createServerClient } from '@/lib/supabase/server'
  import { NextResponse } from 'next/server'

  export async function POST() {
    try {
          // Authenticate the request
          const supabase = await createServerClient()
                const { data: { user }, error: authError } = await supabase.auth.getUser()
                if (authError || !user) {
                  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
          }
          const userId = user.id

                // Admin client using service role key
                const admin = createClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
                )

                // Get trainer profile IDs belonging to this user
                const { data: trainerRows } = await admin
                  .from('trainer_profiles')
                  .select('id')
                  .eq('user_id', userId)
                const trainerIds: string[] = (trainerRows ?? []).map((r: { id: string }) => r.id)

                      // Delete all related rows
                      if (trainerIds.length > 0) {
                        await admin.from('certifications').delete().in('trainer_id', trainerIds)
                                await admin.from('packages').delete().in('trainer_id', trainerIds)
                                await admin.from('trainer_specialties').delete().in('trainer_id', trainerIds)
                                await admin.from('trainer_scores').delete().in('trainer_id', trainerIds)
                                await admin.from('reviews').delete().in('trainer_id', trainerIds)
                                await admin.from('profile_views').delete().in('trainer_id', trainerIds)
                          }

          await admin.from('platform_connections').delete().eq('user_id', userId)
                await admin.from('leads').delete().eq('trainer_user_id', userId)
                await admin.from('leads').delete().eq('client_user_id', userId)
                await admin.from('saved_trainers').delete().eq('client_user_id', userId)
                await admin.from('trainer_profiles').delete().eq('user_id', userId)
                await admin.from('client_profiles').delete().eq('user_id', userId)

                // Delete the auth user
                const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
                if (deleteError) {
                  return NextResponse.json(
                    { error: 'Failed to delete account: ' + deleteError.message },
                    { status: 500 }
                          )
          }

          return NextResponse.json({ success: true })
    } catch (err) {
          console.error('Delete account error:', err)
                return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
    }
}
