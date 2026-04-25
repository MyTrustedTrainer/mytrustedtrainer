// supabase/functions/calculate-badges/index.ts
// Badge Engine — runs nightly at 3am, calculates all 5 badge types from checkins data only.
// Rule: badge calculations pull exclusively from the checkins table.
// No trainer can influence their own badge status directly.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BADGE_DEFINITIONS = {
  lightning_response: {
    label: 'Lightning Response',
    description: 'Avg response speed rating ≥ 4.5 from at least 3 check-ins in the last 30 days.',
  },
  consistency: {
    label: 'Consistency',
    description: 'Avg session rating ≥ 4.3 from at least 5 check-ins in the last 60 days.',
  },
  value: {
    label: 'Best Value',
    description: 'Price at or below city median with avg session rating ≥ 4.0 from at least 3 check-ins.',
  },
  trajectory: {
    label: 'Trajectory',
    description: 'Client progress averages 0.5+ above platform average within first 90 days — min 3 clients with 90-day data.',
  },
  top_rated_local: {
    label: 'Top Rated Local',
    description: 'Highest avg session rating in city (min 5 check-ins). Only one trainer per city holds this badge at a time.',
  },
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: trainers, error: trainersError } = await supabase
      .from('trainer_profiles')
      .select('id, city, state, price_per_session')

    if (trainersError) throw trainersError
    if (!trainers?.length) return new Response(JSON.stringify({ message: 'No trainers found' }), { status: 200 })

    const results: Record<string, any> = {}

    for (const trainer of trainers) {
      const trainerId = trainer.id
      results[trainerId] = {}

      // BADGE 1: LIGHTNING RESPONSE
      const { data: responseData } = await supabase
        .from('checkins')
        .select('response_speed_rating')
        .eq('trainer_id', trainerId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .not('response_speed_rating', 'is', null)

      const responseCount = responseData?.length ?? 0
      const responseAvg = responseCount > 0
        ? (responseData!.reduce((sum, r) => sum + r.response_speed_rating, 0) / responseCount) : 0
      const lightningMet = responseCount >= 3 && responseAvg >= 4.5
      await awardOrRevoke(supabase, trainerId, 'lightning_response', lightningMet, {
        avg_response_speed: responseAvg, checkin_count: responseCount, threshold: 4.5, window_days: 30,
      })
      results[trainerId].lightning_response = { met: lightningMet, avg: responseAvg, count: responseCount }

      // BADGE 2: CONSISTENCY
      const { data: sessionData } = await supabase
        .from('checkins')
        .select('session_rating')
        .eq('trainer_id', trainerId)
        .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
        .not('session_rating', 'is', null)

      const sessionCount = sessionData?.length ?? 0
      const sessionAvg = sessionCount > 0
        ? sessionData!.reduce((sum, r) => sum + r.session_rating, 0) / sessionCount : 0
      const consistencyMet = sessionCount >= 5 && sessionAvg >= 4.3
      await awardOrRevoke(supabase, trainerId, 'consistency', consistencyMet, {
        avg_session_rating: sessionAvg, checkin_count: sessionCount, threshold: 4.3, window_days: 60,
      })
      results[trainerId].consistency = { met: consistencyMet, avg: sessionAvg, count: sessionCount }

      // BADGE 3: VALUE
      let valueMet = false
      const trainerPrice = trainer.price_per_session
      if (trainerPrice && trainer.city) {
        const { data: cityTrainers } = await supabase
          .from('trainer_profiles')
          .select('price_per_session')
          .eq('city', trainer.city)
          .not('price_per_session', 'is', null)
        if (cityTrainers && cityTrainers.length > 0) {
          const prices = cityTrainers.map((t) => t.price_per_session).sort((a, b) => a - b)
          const mid = Math.floor(prices.length / 2)
          const cityMedian = prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2
          const { data: allTimeData } = await supabase
            .from('checkins').select('session_rating')
            .eq('trainer_id', trainerId).not('session_rating', 'is', null)
          const allTimeCount = allTimeData?.length ?? 0
          const allTimeAvg = allTimeCount > 0
            ? allTimeData!.reduce((sum, r) => sum + r.session_rating, 0) / allTimeCount : 0
          valueMet = allTimeCount >= 3 && trainerPrice <= cityMedian && allTimeAvg >= 4.0
          await awardOrRevoke(supabase, trainerId, 'value', valueMet, {
            trainer_price: trainerPrice, city_median_price: cityMedian,
            avg_session_rating: allTimeAvg, checkin_count: allTimeCount,
          })
        }
      } else {
        await awardOrRevoke(supabase, trainerId, 'value', false, { reason: 'no_price_or_city' })
      }
      results[trainerId].value = { met: valueMet }

      // BADGE 4: TRAJECTORY
      const { data: trainerClients } = await supabase
        .from('checkins')
        .select('client_id, created_at, energy_rating, session_rating')
        .eq('trainer_id', trainerId)
        .not('energy_rating', 'is', null).not('session_rating', 'is', null)

      let trajectoryMet = false
      if (trainerClients && trainerClients.length > 0) {
        const byClient: Record<string, typeof trainerClients> = {}
        for (const row of trainerClients) {
          if (!byClient[row.client_id]) byClient[row.client_id] = []
          byClient[row.client_id].push(row)
        }
        const clientAvgs: number[] = []
        for (const [, rows] of Object.entries(byClient)) {
          const sorted = rows.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          const firstDate = new Date(sorted[0].created_at)
          const cutoff = new Date(firstDate.getTime() + 90 * 24 * 60 * 60 * 1000)
          const within90 = sorted.filter((r) => new Date(r.created_at) <= cutoff)
          if (within90.length > 0) {
            const avg = within90.reduce((sum, r) => sum + (r.energy_rating + r.session_rating) / 2, 0) / within90.length
            clientAvgs.push(avg)
          }
        }
        if (clientAvgs.length >= 3) {
          const trainerTrajectoryAvg = clientAvgs.reduce((a, b) => a + b, 0) / clientAvgs.length
          const { data: platformData } = await supabase
            .from('checkins')
            .select('client_id, trainer_id, created_at, energy_rating, session_rating')
            .not('energy_rating', 'is', null).not('session_rating', 'is', null)
          let platformAvg = 0
          if (platformData && platformData.length > 0) {
            const platformByTC: Record<string, typeof platformData> = {}
            for (const row of platformData) {
              const key = row.trainer_id + '::' + row.client_id
              if (!platformByTC[key]) platformByTC[key] = []
              platformByTC[key].push(row)
            }
            const platformClientAvgs: number[] = []
            for (const [, rows] of Object.entries(platformByTC)) {
              const sorted = rows.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              const firstDate = new Date(sorted[0].created_at)
              const cutoff = new Date(firstDate.getTime() + 90 * 24 * 60 * 60 * 1000)
              const within90 = sorted.filter((r) => new Date(r.created_at) <= cutoff)
              if (within90.length > 0) {
                const avg = within90.reduce((sum, r) => sum + (r.energy_rating + r.session_rating) / 2, 0) / within90.length
                platformClientAvgs.push(avg)
              }
            }
            if (platformClientAvgs.length > 0)
              platformAvg = platformClientAvgs.reduce((a, b) => a + b, 0) / platformClientAvgs.length
          }
          trajectoryMet = trainerTrajectoryAvg >= platformAvg + 0.5
          await awardOrRevoke(supabase, trainerId, 'trajectory', trajectoryMet, {
            trainer_trajectory_avg: trainerTrajectoryAvg, platform_avg: platformAvg,
            clients_with_90_day_data: clientAvgs.length,
          })
        } else {
          await awardOrRevoke(supabase, trainerId, 'trajectory', false, {
            reason: 'insufficient_clients', clients_with_90_day_data: clientAvgs.length,
          })
        }
      } else {
        await awardOrRevoke(supabase, trainerId, 'trajectory', false, { reason: 'no_checkins' })
      }
      results[trainerId].trajectory = { met: trajectoryMet }
    }

    // BADGE 5: TOP RATED LOCAL — one per city
    const cities = [...new Set(trainers.filter((t) => t.city).map((t) => t.city))]
    for (const city of cities) {
      const cityTrainerIds = trainers.filter((t) => t.city === city).map((t) => t.id)
      const cityRankings: { trainer_id: string; avg: number; count: number }[] = []
      for (const tid of cityTrainerIds) {
        const { data: cityData } = await supabase
          .from('checkins').select('session_rating')
          .eq('trainer_id', tid).not('session_rating', 'is', null)
        if (cityData && cityData.length >= 5) {
          const avg = cityData.reduce((sum, r) => sum + r.session_rating, 0) / cityData.length
          cityRankings.push({ trainer_id: tid, avg, count: cityData.length })
        }
      }
      if (cityRankings.length === 0) continue
      cityRankings.sort((a, b) => b.avg - a.avg)
      const topTrainer = cityRankings[0]
      for (const { trainer_id: tid, avg, count } of cityRankings) {
        const isTop = tid === topTrainer.trainer_id
        await awardOrRevoke(supabase, tid, 'top_rated_local', isTop, {
          city, avg_session_rating: avg, checkin_count: count,
          city_rank: cityRankings.findIndex((r) => r.trainer_id === tid) + 1,
        })
        if (results[tid]) results[tid].top_rated_local = { met: isTop, avg, rank: cityRankings.findIndex((r) => r.trainer_id === tid) + 1 }
      }
      for (const tid of cityTrainerIds) {
        if (!cityRankings.find((r) => r.trainer_id === tid)) {
          await awardOrRevoke(supabase, tid, 'top_rated_local', false, { city, reason: 'insufficient_checkins' })
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, trainers_processed: trainers.length, results }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (err) {
    console.error('Badge engine error:', err)
    return new Response(JSON.stringify({ error: String(err) }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 })
  }
})

async function awardOrRevoke(
  supabase: any, trainerId: string,
  badgeKey: keyof typeof BADGE_DEFINITIONS,
  criteriaMet: boolean, snapshot: Record<string, any>
) {
  const def = BADGE_DEFINITIONS[badgeKey]
  const { data: existing } = await supabase
    .from('trainer_badges').select('id, is_active')
    .eq('trainer_id', trainerId).eq('badge_key', badgeKey).maybeSingle()

  if (criteriaMet && !existing?.is_active) {
    await supabase.from('trainer_badges').upsert({
      trainer_id: trainerId, badge_key: badgeKey, badge_label: def.label,
      awarded_at: new Date().toISOString(), is_active: true, revoked_at: null,
    }, { onConflict: 'trainer_id,badge_key' })
  } else if (!criteriaMet && existing?.is_active) {
    await supabase.from('trainer_badges')
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq('trainer_id', trainerId).eq('badge_key', badgeKey)
  }

  await supabase.from('badge_criteria_log').insert({
    trainer_id: trainerId, badge_key: badgeKey,
    metric_value: snapshot.avg_response_speed ?? snapshot.avg_session_rating ?? snapshot.trainer_trajectory_avg ?? null,
    meets_criteria: criteriaMet,
  })
}
