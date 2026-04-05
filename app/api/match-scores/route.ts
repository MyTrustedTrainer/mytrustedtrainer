import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Match Score Algorithm
 * Scores each trainer 1–10 across 10 dimensions against the client's profile.
 * Weighted average produces a single compatibility score.
 *
 * GET /api/match-scores
 * Returns the caller's match scores (or computes them if stale).
 *
 * POST /api/match-scores
 * Body: { trainer_id?: string }
 * Re-computes scores (admin or the client themselves).
 */

const WEIGHTS: Record<string, number> = {
  goals: 2.5,
  schedule: 2.0,
  coaching_style: 1.5,
  experience_level: 1.0,
  preferred_location: 1.0,
  budget_range: 1.0,
  gender_preference: 0.5,
  communication_style: 0.5,
}
const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((s, w) => s + w, 0)

function scoreGoals(
  clientGoals: string[],
  trainerSpecializations: string[]
): number {
  if (!clientGoals?.length || !trainerSpecializations?.length) return 5
  const matches = clientGoals.filter((g) =>
    trainerSpecializations.some((s) =>
      s.toLowerCase().includes(g.toLowerCase().split('/')[0].trim()) ||
      g.toLowerCase().includes(s.toLowerCase())
    )
  ).length
  return Math.min(10, Math.round((matches / clientGoals.length) * 10))
}

function scoreSchedule(
  clientSchedule: string[],
  trainerAvailability: string[]
): number {
  if (!clientSchedule?.length || !trainerAvailability?.length) return 5
  const overlap = clientSchedule.filter((s) =>
    trainerAvailability.includes(s)
  ).length
  const ratio = overlap / Math.max(clientSchedule.length, 1)
  return Math.max(1, Math.round(ratio * 10))
}

function scoreTextMatch(clientVal: string | null, trainerVal: string | null): number {
  if (!clientVal || !trainerVal) return 5
  if (clientVal === 'No preference' || trainerVal === 'No preference') return 8
  const sim = clientVal.toLowerCase() === trainerVal.toLowerCase() ? 10 : 5
  return sim
}

function scoreBudget(clientBudget: string | null, trainerRate: number | null): number {
  if (!clientBudget || !trainerRate) return 5
  const ranges: Record<string, [number, number]> = {
    'Under $40/session': [0, 40],
    '$40–$60/session': [40, 60],
    '$60–$80/session': [60, 80],
    '$80–$100/session': [80, 100],
    '$100+/session': [100, 999],
  }
  const range = ranges[clientBudget]
  if (!range) return 5
  if (trainerRate >= range[0] && trainerRate <= range[1]) return 10
  const diff = Math.min(
    Math.abs(trainerRate - range[0]),
    Math.abs(trainerRate - range[1])
  )
  return Math.max(1, 10 - Math.floor(diff / 10))
}

function computeMatchScore(client: Record<string, unknown>, trainer: Record<string, unknown>): number {
  const scores: Record<string, number> = {
    goals: scoreGoals(
      client.goals as string[],
      trainer.specializations as string[]
    ),
    schedule: scoreSchedule(
      client.schedule as string[],
      trainer.availability as string[]
    ),
    coaching_style: scoreTextMatch(
      client.coaching_style as string,
      trainer.coaching_style as string
    ),
    experience_level: scoreTextMatch(
      client.experience_level as string,
      trainer.experience_level as string
    ),
    preferred_location: scoreTextMatch(
      client.preferred_location as string,
      trainer.preferred_location as string
    ),
    budget_range: scoreBudget(
      client.budget_range as string,
      trainer.hourly_rate as number
    ),
    gender_preference: scoreTextMatch(
      client.gender_preference as string,
      trainer.gender as string
    ),
    communication_style: scoreTextMatch(
      client.communication_style as string,
      trainer.communication_style as string
    ),
  }

  const weightedSum = Object.entries(scores).reduce((sum, [dim, score]) => {
    return sum + score * (WEIGHTS[dim] || 1)
  }, 0)

  const raw = weightedSum / TOTAL_WEIGHT
  return Math.min(10, Math.max(1, Math.round(raw * 10) / 10))
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Get client profile
  const { data: clientProfile } = await supabase
    .from('client_compatibility_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!clientProfile) {
    return NextResponse.json({ error: 'Complete your compatibility questionnaire first', redirect: '/onboarding/client' }, { status: 400 })
  }

  // Get existing match scores
  const { data: scores } = await supabase
    .from('match_scores')
    .select('*, trainer_profiles(id, full_name, slug, avatar_url, specializations, hourly_rate, city)')
    .eq('client_id', user.id)
    .order('score', { ascending: false })

  return NextResponse.json({ scores: scores || [] })
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Get client profile
  const { data: clientProfile } = await supabase
    .from('client_compatibility_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!clientProfile) {
    return NextResponse.json({ error: 'No client profile found' }, { status: 400 })
  }

  // Get all trainer compatibility profiles
  const { data: trainers } = await supabase
    .from('trainer_compatibility_profiles')
    .select('*, trainer_profiles(id, full_name, slug, avatar_url, specializations, hourly_rate, city, gender)')

  if (!trainers?.length) {
    return NextResponse.json({ computed: 0 })
  }

  // Compute scores for each trainer
  const upserts = trainers.map((t) => {
    const trainerData = {
      ...(t.trainer_profiles as Record<string, unknown>),
      ...t,
    }
    const score = computeMatchScore(clientProfile as Record<string, unknown>, trainerData)
    return {
      client_id: user.id,
      trainer_id: t.trainer_id,
      score,
      computed_at: new Date().toISOString(),
    }
  })

  const { error } = await supabase
    .from('match_scores')
    .upsert(upserts, { onConflict: 'client_id,trainer_id' })

  if (error) {
    console.error('Match score upsert error:', error)
    return NextResponse.json({ error: 'Failed to compute scores' }, { status: 500 })
  }

  return NextResponse.json({ computed: upserts.length })
}
