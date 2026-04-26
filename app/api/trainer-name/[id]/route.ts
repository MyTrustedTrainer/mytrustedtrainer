import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data } = await supabase
    .from('trainer_profiles')
    .select('full_name')
    .eq('id', params.id)
    .maybeSingle()
  return NextResponse.json({ name: data?.full_name ?? null })
}
