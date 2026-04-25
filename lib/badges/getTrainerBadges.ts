// lib/badges/getTrainerBadges.ts
// Returns active badges for a given trainer. Server-side only.
// Match scores are always personal — this file never exposes one client's data to another.

import { createClient } from '@/lib/supabase/server'

export type TrainerBadge = {
  badge_key: string
  badge_label: string
  description: string
  awarded_at: string
}

const BADGE_DESCRIPTIONS: Record<string, string> = {
  lightning_response: 'Avg response speed rating ≥ 4.5 from at least 3 check-ins in the last 30 days.',
  consistency: 'Avg session rating ≥ 4.3 from at least 5 check-ins in the last 60 days.',
  value: 'Price at or below city median with avg session rating ≥ 4.0 (min 3 check-ins).',
  trajectory: 'Client progress averages 0.5+ above platform average within first 90 days — min 3 clients.',
  top_rated_local: 'Highest avg session rating in city with at least 5 check-ins. Only one trainer per city holds this badge.',
}

export async function getTrainerBadges(trainerId: string): Promise<TrainerBadge[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('trainer_badges')
    .select('badge_key, badge_label, awarded_at')
    .eq('trainer_id', trainerId)
    .eq('is_active', true)
    .order('awarded_at', { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    badge_key: row.badge_key,
    badge_label: row.badge_label,
    description: BADGE_DESCRIPTIONS[row.badge_key] ?? '',
    awarded_at: row.awarded_at,
  }))
}

// Badge icon mapping for UI components
export const BADGE_ICONS: Record<string, string> = {
  lightning_response: '⚡',
  consistency: '🎯',
  value: '💎',
  trajectory: '📈',
  top_rated_local: '🏆',
}

export const ALL_BADGE_KEYS = [
  'lightning_response',
  'consistency',
  'value',
  'trajectory',
  'top_rated_local',
] as const

export type BadgeKey = typeof ALL_BADGE_KEYS[number]
