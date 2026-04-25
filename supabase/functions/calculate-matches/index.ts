// Supabase Edge Function: calculate-matches
// Path: supabase/functions/calculate-matches/index.ts
//
// Input:  POST { client_id: string }
// Output: { count, scores, total_trainers_evaluated, limited_availability }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Algorithm (inlined — Edge Functions cannot import from /lib) ─────────────

interface ClientProfile {
  client_id: string
  motivation_style?: string
  response_to_pressure?: string
  communication_preference?: string
  schedule_commitment?: string
  goal_type?: string
  accountability_need?: string
  raw_answers?: Record<string, string>
  training_format?: string
}

interface TrainerProfile {
  trainer_id: string
  coaching_style?: string
  handles_missed_sessions?: string
  session_structure?: string
  motivation_approach?: string
  communication_frequency?: string
  ideal_client_description?: string
  training_formats?: string[]
  specialties?: string[]
}

const COMM: Record<string, Record<string, number>> = {
  frequent_checkins: { daily: 1.0, every_few_days: 0.8, weekly: 0.5, when_they_reach_out: 0.1 },
  just_show_up: { daily: 0.3, every_few_days: 0.6, weekly: 0.9, when_they_reach_out: 1.0 },
}
const INTENSITY: Record<string, Record<string, number>> = {
  push_hard: { drill_sergeant: 1.0, supportive_coach: 0.4, accountability_partner: 0.7, educator: 0.5 },
  supportive: { drill_sergeant: 0.1, supportive_coach: 1.0, accountability_partner: 0.8, educator: 0.9 },
}
const FEEDBACK: Record<string, Record<string, number>> = {
  straight_feedback: { data_progress: 0.9, personal_encouragement: 0.5, challenging: 1.0, celebrating_wins: 0.6 },
  encouraging: { data_progress: 0.5, personal_encouragement: 1.0, challenging: 0.3, celebrating_wins: 0.9 },
}
const ACCT: Record<string, Record<string, number>> = {
  check_in_on_me: { follow_up_hour: 1.0, check_in_day: 0.8, wait_client: 0.2, address_next: 0.1 },
  reach_out_when_ready: { follow_up_hour: 0.2, check_in_day: 0.4, wait_client: 1.0, address_next: 0.9 },
}
const SCHED: Record<string, Record<string, number>> = {
  very_consistent: { highly_structured: 1.0, flexible: 0.7, mix: 0.9 },
  chaotic: { highly_structured: 0.2, flexible: 1.0, mix: 0.8 },
}

function score(client: ClientProfile, trainer: TrainerProfile) {
  const comm = COMM[client.communication_preference ?? 'just_show_up']?.[trainer.communication_frequency ?? 'weekly'] ?? 0.5
  const intens = (INTENSITY[client.motivation_style ?? 'supportive']?.[trainer.coaching_style ?? 'supportive_coach'] ?? 0.5) * 0.6
    + (FEEDBACK[client.response_to_pressure ?? 'encouraging']?.[trainer.motivation_approach ?? 'personal_encouragement'] ?? 0.5) * 0.4
  const acct = ACCT[client.accountability_need ?? 'reach_out_when_ready']?.[trainer.handles_missed_sessions ?? 'check_in_day'] ?? 0.5
  const sched = SCHED[client.schedule_commitment ?? 'very_consistent']?.[trainer.session_structure ?? 'mix'] ?? 0.5

  // Goal-format
  const goalMap: Record<string, string[]> = {
    lose_weight: ['Weight Loss', 'HIIT', 'Nutrition', 'Running'],
    build_muscle: ['Muscle Building', 'Powerlifting', 'Strength'],
    athletic_performance: ['Athletic Performance', 'Running', 'HIIT'],
    general_health: ['General Fitness', 'Mobility', 'Senior Fitness', 'Flexibility'],
  }
  const rel = goalMap[client.goal_type ?? ''] ?? []
  const sOvlp = rel.length > 0
    ? Math.min((trainer.specialties ?? []).filter(s => rel.some(r => s.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(s.toLowerCase()))).length / rel.length, 1)
    : 0.5
  const fmtMap: Record<string, string[]> = {
    in_person: ['In-Person'], virtual: ['Virtual'],
    either: ['In-Person', 'Virtual'], mix: ['In-Person', 'Virtual', 'Outdoor'],
  }
  const wanted = fmtMap[client.training_format ?? ''] ?? []
  const fOvlp = wanted.length > 0
    ? wanted.filter(f => (trainer.training_formats ?? []).some(tf => tf.toLowerCase().includes(f.toLowerCase()))).length / wanted.length
    : 0.5
  const goalFmt = sOvlp * 0.5 + fOvlp * 0.5

  // Personality
  const stop = new Set(['i','me','my','a','an','the','to','of','and','in','is','it','for','that','this','with','on','at','by','as','be','was','are','or','do'])
  const cText = Object.entries(client.raw_answers ?? {}).filter(([k]) => ['q17','q18','q19','q20'].includes(k)).map(([,v]) => v).join(' ').toLowerCase()
  const tText = (trainer.ideal_client_description ?? '').toLowerCase()
  let pers = 0.5
  if (cText && tText) {
    const cWords = cText.split(/\W+/).filter(w => w.length > 3 && !stop.has(w))
    const tWords = new Set(tText.split(/\W+/).filter(w => w.length > 3 && !stop.has(w)))
    if (cWords.length > 0) pers = Math.max(Math.min(cWords.filter(w => tWords.has(w)).length / cWords.length, 1), 0.2)
  }

  const weighted = comm * 0.20 + intens * 0.25 + acct * 0.20 + sched * 0.15 + goalFmt * 0.10 + pers * 0.10
  const finalScore = Math.round(Math.min(Math.max(weighted * 10, 0), 10) * 10) / 10

  return {
    score: finalScore,
    breakdown: {
      communication: { score: comm, weight: 0.20, weighted: comm * 0.20 },
      intensity:      { score: intens, weight: 0.25, weighted: intens * 0.25 },
      accountability: { score: acct, weight: 0.20, weighted: acct * 0.20 },
      schedule:       { score: sched, weight: 0.15, weighted: sched * 0.15 },
      goal_format:    { score: goalFmt, weight: 0.10, weighted: goalFmt * 0.10 },
      personality:    { score: pers, weight: 0.10, weighted: pers * 0.10 },
    },
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { client_id } = await req.json()
    if (!client_id) return new Response(JSON.stringify({ error: 'client_id required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    // Fetch client
    const { data: cp, error: cpErr } = await sb.from('client_profiles')
      .select('id, city, state, raw_answers, goals, preferred_formats, compatibility_complete')
      .eq('id', client_id).single()
    if (cpErr || !cp) return new Response(JSON.stringify({ error: 'Client not found' }), { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } })

    const { data: cc } = await sb.from('client_compatibility_profiles').select('*').eq('client_id', client_id).single()

    // Fetch trainers in same city
    const { data: trainers, error: tErr } = await sb.from('trainer_profiles')
      .select('id, city, training_formats, price_per_session, trainer_compatibility_profiles(coaching_style, handles_missed_sessions, session_structure, motivation_approach, communication_frequency, ideal_client_description, raw_answers), trainer_specialties(specialty)')
      .eq('is_published', true).eq('city', cp.city)
    if (tErr) return new Response(JSON.stringify({ error: 'Trainer fetch failed', detail: tErr.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    if (!trainers?.length) return new Response(JSON.stringify({ count: 0, scores: [], total_trainers_evaluated: 0, limited_availability: false }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })

    const rawAnswers = ((cp.raw_answers ?? cc?.raw_answers ?? {}) as Record<string, string>)

    const clientProf: ClientProfile = {
      client_id,
      motivation_style: cc?.motivation_style ?? rawAnswers['q1'],
      response_to_pressure: cc?.response_to_pressure ?? rawAnswers['q5'],
      communication_preference: cc?.communication_preference ?? rawAnswers['q7'],
      schedule_commitment: cc?.schedule_commitment ?? rawAnswers['q6'],
      goal_type: cc?.goal_type ?? rawAnswers['q9'],
      accountability_need: cc?.accountability_need ?? rawAnswers['q3'],
      training_format: rawAnswers['q15'],
      raw_answers: rawAnswers,
    }

    const results: Array<{ trainer_id: string; score: number; breakdown: object }> = []
    const upserts: object[] = []

    for (const t of trainers) {
      const tcp = (t.trainer_compatibility_profiles as Record<string, string>[] | null)?.[0] ?? {}
      const specialties = (t.trainer_specialties as { specialty: string }[] | null)?.map((s) => s.specialty) ?? []
      const trainerProf: TrainerProfile = {
        trainer_id: t.id,
        coaching_style: tcp['coaching_style'],
        handles_missed_sessions: tcp['handles_missed_sessions'],
        session_structure: tcp['session_structure'],
        motivation_approach: tcp['motivation_approach'],
        communication_frequency: tcp['communication_frequency'],
        ideal_client_description: tcp['ideal_client_description'],
        training_formats: t.training_formats ?? [],
        specialties,
      }
      const res = score(clientProf, trainerProf)
      results.push({ trainer_id: t.id, ...res })
      upserts.push({ trainer_id: t.id, client_id, score: res.score, breakdown: res.breakdown, calculated_at: new Date().toISOString() })
    }

    // Upsert all
    await sb.from('match_scores').upsert(upserts, { onConflict: 'trainer_id,client_id' })

    const qualified = results.filter(r => r.score >= 5.0).sort((a, b) => b.score - a.score)
    const final = qualified.length >= 5 ? qualified : results.sort((a, b) => b.score - a.score).slice(0, 5)

    return new Response(JSON.stringify({
      count: final.length,
      total_trainers_evaluated: trainers.length,
      scores: final,
      limited_availability: qualified.length < 5,
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error', detail: String(err) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
