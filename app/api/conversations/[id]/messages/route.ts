import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/conversations/[id]/messages - get messages for a conversation
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Mark messages as read for the other party
    const trainerProfile = await supabase.from('trainer_profiles').select('id').eq('user_id', user.id).single()
    const senderType = trainerProfile.data ? 'client' : 'trainer'

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', params.id)
      .eq('sender_type', senderType)
      .eq('is_read', false)

    return NextResponse.json({ messages: messages || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/conversations/[id]/messages - send a message
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { message } = body
    if (!message?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

    // Determine sender type
    const { data: trainerProfile } = await supabase
      .from('trainer_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const senderType = trainerProfile ? 'trainer' : 'client'

    const { data: msg, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: params.id,
        sender_type: senderType,
        sender_id: user.id,
        body: message.trim(),
        is_read: false
      })
      .select()
      .single()

    if (msgError) throw msgError

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', params.id)

    return NextResponse.json({ message: msg })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
