'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

interface ViewPoint { date: string; views: number }
interface LeadPoint { week: string; leads: number }

export default function AnalyticsPage() {
  const [viewData, setViewData] = useState<ViewPoint[]>([])
  const [leadData, setLeadData] = useState<LeadPoint[]>([])
  const [stats, setStats] = useState({ avgScore: '—', totalMessages: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const now = new Date()
    const { data: views } = await supabase
      .from('profile_views').select('viewed_at')
      .eq('trainer_id', user.id).gte('viewed_at', thirtyDaysAgo.toISOString())
    const viewsByDay: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i)
      viewsByDay[d.toISOString().slice(0, 10)] = 0
    }
    views?.forEach((v) => { const k = v.viewed_at.slice(0, 10); if (k in viewsByDay) viewsByDay[k]++ })
    setViewData(Object.entries(viewsByDay).map(([date, views]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), views,
    })))
    const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000)
    const { data: leads } = await supabase
      .from('leads').select('created_at')
      .eq('trainer_id', user.id).gte('created_at', eightWeeksAgo.toISOString())
    const leadsByWeek: Record<string, number> = {}
    for (let i = 7; i >= 0; i--) {
      const ws = new Date(now); ws.setDate(ws.getDate() - i * 7)
      leadsByWeek[ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0
    }
    leads?.forEach((l) => {
      const d = new Date(l.created_at)
      const wi = Math.floor((now.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000))
      if (wi < 8) {
        const ws = new Date(now); ws.setDate(ws.getDate() - wi * 7)
        const k = ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (k in leadsByWeek) leadsByWeek[k]++
      }
    })
    setLeadData(Object.entries(leadsByWeek).map(([week, leads]) => ({ week, leads })))
    const { data: scores } = await supabase
      .from('leads').select('match_score_at_time')
      .eq('trainer_id', user.id).not('match_score_at_time', 'is', null)
    const avg = scores && scores.length > 0
      ? (scores.reduce((s, l) => s + (l.match_score_at_time || 0), 0) / scores.length).toFixed(1) : '—'
    const { data: ml } = await supabase.from('leads').select('id').eq('trainer_id', user.id)
    const ids = (ml || []).map((l) => l.id)
    let totalMsgs = 0
    if (ids.length > 0) {
      const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).in('lead_id', ids)
      totalMsgs = count || 0
    }
    setStats({ avgScore: avg, totalMessages: totalMsgs })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="w-6 h-6 border-2 border-[#18A96B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#03243F]" style={{ fontFamily: 'Playfair Display, serif' }}>Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Your profile performance over time.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="text-2xl font-bold text-[#03243F]">{stats.avgScore}</div>
          <div className="text-xs text-slate-500 mt-0.5">Avg Match Score (all leads)</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="text-2xl font-bold text-[#03243F]">{stats.totalMessages}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total Messages Sent</div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-[#03243F] mb-4">Profile Views — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={viewData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Line type="monotone" dataKey="views" stroke="#1652DB" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-[#03243F] mb-4">Leads — Last 8 Weeks</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={leadData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Bar dataKey="leads" fill="#18A96B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
