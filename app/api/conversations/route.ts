import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/conversations - get all conversations for the current user
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if user is a trainer
    const { data: trainerProfile } = await supabase
      .from('trainer_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let conversations
    if (trainerProfile) {
      // Trainer sees their conversations
      const { data } = await supabase
        .from('conversations')
        .select('*, messages(id, body, sender_type, created_at, is_read)')
        .eq('trainer_id', trainerProfile.id)
        .order('last_message_at', { ascending: false })
      conversations = data
    } else {
      // Client sees their conversations
      const { data } = await supabase
        .from('conversations')
        .select('*, trainer_profiles(id, full_name, slug, avatar_url), messages(id, body, sender_type, created_at, is_read)')
        .eq('client_user_id', user.id)
        .order('last_message_at', { ascending: false })
      conversations = data
    }

    return NextResponse.json({ conversations: conversations || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/conversations - create or get conversation + send first message
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { trainer_id, message, client_name, client_email } = body

    if (!trainer_id || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get or create conversation
    let { data: conv } = await supabase
      .from('conversations')
      .select('*')
      .eq('trainer_id', trainer_id)
      .eq('client_user_id', user.id)
      .single()

    if (!conv) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          trainer_id,
          client_user_id: user.id,
          client_name: client_name || user.user_metadata?.full_name || user.email,
          client_email: client_email || user.email,
          is_unlocked: true,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single()
      if (convError) throw convError
      conv = newConv

      // Also create lead if not exists
      await supabase.from('leads').insert({
        trainer_id,
        client_user_id: user.id,
        name: client_name || user.user_metadata?.full_name || 'Unknown',
        email: client_email || user.email,
        message,
        source: 'chat',
        status: 'new'
      })
    }

    // Insert message
    const { data: msg, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conv.id,
        sender_type: 'client',
        sender_id: user.id,
        body: message,
        is_read: false
      })
      .select()
      .single()
    if (msgError) throw msgError

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conv.id)

    return NextResponse.json({ conversation: conv, message: msg })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
