/**
 * MyTrustedTrainer — Matching Algorithm
 * Session 06
 *
 * Takes a client compatibility profile and a trainer compatibility profile,
 * returns a score 0.0–10.0 with a full breakdown object.
 *
 * Six weighted dimensions:
 *   DIM 1 — Communication   weight 0.20
 *   DIM 2 — Intensity        weight 0.25  (highest — intensity mismatch is #1 quit reason)
 *   DIM 3 — Accountability   weight 0.20
 *   DIM 4 — Schedule         weight 0.15
 *   DIM 5 — Goal-Format      weight 0.10
 *   DIM 6 — Personality      weight 0.10
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClientCompatibilityProfile {
  client_id: string
  motivation_style?: string
  response_to_pressure?: string
  communication_preference?: string
  schedule_commitment?: string
  goal_type?: string
  experience_level?: string
  accountability_need?: string
  coaching_relationship_style?: string
  raw_answers?: Record<string, string>
  budget_range?: string
  training_format?: string
}

export interface TrainerCompatibilityProfile {
  trainer_id: string
  coaching_style?: string
  handles_missed_sessions?: string
  session_structure?: string
  motivation_approach?: string
  communication_frequency?: string
  push_intensity?: string
  ideal_client_description?: string
  training_formats?: string[]
  specialties?: string[]
  price_per_session?: number
}

export interface DimensionScore {
  score: number
  weight: number
  weighted: number
  explanation: string
}

export interface MatchBreakdown {
  communication: DimensionScore
  intensity: DimensionScore
  accountability: DimensionScore
  schedule: DimensionScore
  goal_format: DimensionScore
  personality: DimensionScore
}

export interface MatchResult {
  score: number
  breakdown: MatchBreakdown
}

// ─── Lookup Tables ────────────────────────────────────────────────────────────

const COMM_MATRIX: Record<string, Record<string, number>> = {
  frequent_checkins: { daily: 1.0, every_few_days: 0.8, weekly: 0.5, when_they_reach_out: 0.1 },
  just_show_up: { daily: 0.3, every_few_days: 0.6, weekly: 0.9, when_they_reach_out: 1.0 },
}

const INTENSITY_MATRIX: Record<string, Record<string, number>> = {
  push_hard: { drill_sergeant: 1.0, supportive_coach: 0.4, accountability_partner: 0.7, educator: 0.5 },
  supportive: { drill_sergeant: 0.1, supportive_coach: 1.0, accountability_partner: 0.8, educator: 0.9 },
}

const FEEDBACK_MATRIX: Record<string, Record<string, number>> = {
  straight_feedback: { data_progress: 0.9, personal_encouragement: 0.5, challenging: 1.0, celebrating_wins: 0.6 },
  encouraging: { data_progress: 0.5, personal_encouragement: 1.0, challenging: 0.3, celebrating_wins: 0.9 },
}

const ACCOUNTABILITY_MATRIX: Record<string, Record<string, number>> = {
  check_in_on_me: { follow_up_hour: 1.0, check_in_day: 0.8, wait_client: 0.2, address_next: 0.1 },
  reach_out_when_ready: { follow_up_hour: 0.2, check_in_day: 0.4, wait_client: 1.0, address_next: 0.9 },
}

const SCHEDULE_MATRIX: Record<string, Record<string, number>> = {
  very_consistent: { highly_structured: 1.0, flexible: 0.7, mix: 0.9 },
  chaotic: { highly_structured: 0.2, flexible: 1.0, mix: 0.8 },
}

// ─── Dimension Scorers ────────────────────────────────────────────────────────

function scoreCommunication(client: ClientCompatibilityProfile, trainer: TrainerCompatibilityProfile): DimensionScore {
  const weight = 0.20
  const cp = client.communication_preference ?? 'just_show_up'
  const tf = trainer.communication_frequency ?? 'weekly'
  const score = COMM_MATRIX[cp]?.[tf] ?? 0.5
  const trainerDesc: Record<string, string> = {
    daily: 'checks in daily', every_few_days: 'checks in every few days',
    weekly: 'checks in weekly', when_they_reach_out: 'waits for you to reach out',
  }
  return {
    score, weight, weighted: score * weight,
    explanation: cp === 'frequent_checkins'
      ? `You want regular check-ins — this trainer ${trainerDesc[tf] ?? 'has a different style'}.`
      : `You prefer to train without constant communication — this trainer ${trainerDesc[tf] ?? 'has a different style'}.`,
  }
}

function scoreIntensity(client: ClientCompatibilityProfile, trainer: TrainerCompatibilityProfile): DimensionScore {
  const weight = 0.25
  const ms = client.motivation_style ?? 'supportive'
  const cs = trainer.coaching_style ?? 'supportive_coach'
  const rp = client.response_to_pressure ?? 'encouraging'
  const ma = trainer.motivation_approach ?? 'personal_encouragement'
  const intensityScore = INTENSITY_MATRIX[ms]?.[cs] ?? 0.5
  const feedbackScore = FEEDBACK_MATRIX[rp]?.[ma] ?? 0.5
  const score = intensityScore * 0.6 + feedbackScore * 0.4
  const trainerDesc: Record<string, string> = {
    drill_sergeant: 'is a high-intensity drill sergeant',
    supportive_coach: 'takes a supportive coaching approach',
    accountability_partner: 'acts as an accountability partner',
    educator: 'leads with education and reasoning',
  }
  return {
    score, weight, weighted: score * weight,
    explanation: ms === 'push_hard'
      ? `You need a trainer who pushes hard — this trainer ${trainerDesc[cs] ?? 'has a different approach'}.`
      : `You work best with a supportive approach — this trainer ${trainerDesc[cs] ?? 'has a different approach'}.`,
  }
}

function scoreAccountability(client: ClientCompatibilityProfile, trainer: TrainerCompatibilityProfile): DimensionScore {
  const weight = 0.20
  const an = client.accountability_need ?? 'reach_out_when_ready'
  const hm = trainer.handles_missed_sessions ?? 'check_in_day'
  const score = ACCOUNTABILITY_MATRIX[an]?.[hm] ?? 0.5
  const trainerDesc: Record<string, string> = {
    follow_up_hour: 'follows up within the hour', check_in_day: 'checks in the same day',
    wait_client: 'waits for you to reach back out', address_next: 'addresses it at the next session',
  }
  return {
    score, weight, weighted: score * weight,
    explanation: an === 'check_in_on_me'
      ? `You want your trainer to check in if you miss a session — this trainer ${trainerDesc[hm] ?? 'has a different approach'}.`
      : `You prefer to reconnect on your own terms — this trainer ${trainerDesc[hm] ?? 'has a different approach'}.`,
  }
}

function scoreSchedule(client: ClientCompatibilityProfile, trainer: TrainerCompatibilityProfile): DimensionScore {
  const weight = 0.15
  const sc = client.schedule_commitment ?? 'very_consistent'
  const ss = trainer.session_structure ?? 'mix'
  const score = SCHEDULE_MATRIX[sc]?.[ss] ?? 0.5
  const trainerDesc: Record<string, string> = {
    highly_structured: 'runs highly structured sessions',
    flexible: 'adapts to whatever you need',
    mix: 'balances structure with flexibility',
  }
  return {
    score, weight, weighted: score * weight,
    explanation: sc === 'very_consistent'
      ? `Your schedule is consistent — this trainer ${trainerDesc[ss] ?? 'has a set approach'}.`
      : `Your schedule can be unpredictable — this trainer ${trainerDesc[ss] ?? 'has a set approach'}.`,
  }
}

function scoreGoalFormat(client: ClientCompatibilityProfile, trainer: TrainerCompatibilityProfile): DimensionScore {
  const weight = 0.10
  const clientGoal = client.goal_type ?? ''
  const clientFormat = client.training_format ?? ''
  const trainerFormats = trainer.training_formats ?? []
  const trainerSpecialties = trainer.specialties ?? []
  const goalSpecialtyMap: Record<string, string[]> = {
    lose_weight: ['Weight Loss', 'HIIT', 'Nutrition', 'Running'],
    build_muscle: ['Muscle Building', 'Powerlifting', 'Strength'],
    athletic_performance: ['Athletic Performance', 'Running', 'HIIT'],
    general_health: ['General Fitness', 'Mobility', 'Senior Fitness', 'Flexibility'],
  }
  const relevantSpecialties = goalSpecialtyMap[clientGoal] ?? []
  const specialtyOverlap = trainerSpecialties.filter(s =>
    relevantSpecialties.some(r => s.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(s.toLowerCase()))
  ).length
  const specialtyScore = relevantSpecialties.length > 0 ? Math.min(specialtyOverlap / relevantSpecialties.length, 1.0) : 0.5
  const formatMap: Record<string, string[]> = {
    in_person: ['In-Person'], virtual: ['Virtual'],
    either: ['In-Person', 'Virtual'], mix: ['In-Person', 'Virtual', 'Outdoor'],
  }
  const wantedFormats = formatMap[clientFormat] ?? []
  const formatOverlap = wantedFormats.filter(f =>
    trainerFormats.some(tf => tf.toLowerCase().includes(f.toLowerCase()))
  ).length
  const formatScore = wantedFormats.length > 0 ? formatOverlap / wantedFormats.length : 0.5
  const score = specialtyScore * 0.5 + formatScore * 0.5
  const goalLabel: Record<string, string> = {
    lose_weight: 'weight loss', build_muscle: 'building muscle',
    athletic_performance: 'athletic performance', general_health: 'general health',
  }
  return {
    score, weight, weighted: score * weight,
    explanation: `Your goal is ${goalLabel[clientGoal] ?? 'fitness'} — this trainer's specialties and formats ${score >= 0.7 ? 'align well' : score >= 0.4 ? 'partially align' : 'may not fully match'}.`,
  }
}

function scorePersonality(client: ClientCompatibilityProfile, trainer: TrainerCompatibilityProfile): DimensionScore {
  const weight = 0.10
  const stopWords = new Set(['i', 'me', 'my', 'a', 'an', 'the', 'to', 'of', 'and', 'in', 'is', 'it', 'for', 'that', 'this', 'with', 'on', 'at', 'by', 'as', 'be', 'was', 'are', 'or', 'do'])
  const clientText = Object.entries(client.raw_answers ?? {})
    .filter(([k]) => ['q17', 'q18', 'q19', 'q20'].includes(k))
    .map(([, v]) => v).join(' ').toLowerCase()
  const trainerText = (trainer.ideal_client_description ?? '').toLowerCase()
  let score = 0.5
  if (clientText.length > 0 && trainerText.length > 0) {
    const clientWords = clientText.split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w))
    const trainerWords = new Set(trainerText.split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w)))
    if (clientWords.length > 0) {
      const matches = clientWords.filter(w => trainerWords.has(w)).length
      score = Math.max(Math.min(matches / clientWords.length, 1.0), 0.2)
    }
  }
  return {
    score, weight, weighted: score * weight,
    explanation: score >= 0.6
      ? 'The way you describe your goals aligns closely with what this trainer looks for in clients.'
      : score >= 0.35
      ? "There's some alignment between what you're looking for and this trainer's ideal client."
      : "Your goals and this trainer's ideal client profile don't overlap much — but that's not always predictive.",
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function calculateMatchScore(
  client: ClientCompatibilityProfile,
  trainer: TrainerCompatibilityProfile,
): MatchResult {
  const communication = scoreCommunication(client, trainer)
  const intensity = scoreIntensity(client, trainer)
  const accountability = scoreAccountability(client, trainer)
  const schedule = scoreSchedule(client, trainer)
  const goal_format = scoreGoalFormat(client, trainer)
  const personality = scorePersonality(client, trainer)

  const weightedSum =
    communication.weighted + intensity.weighted + accountability.weighted +
    schedule.weighted + goal_format.weighted + personality.weighted

  const score = Math.round(Math.min(Math.max(weightedSum * 10, 0), 10) * 10) / 10

  return { score, breakdown: { communication, intensity, accountability, schedule, goal_format, personality } }
    }
