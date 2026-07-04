import { useEffect, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../api/client'
import { useTranslations } from '../i18n'

const StatCard = ({ label, value, accent }) => (
  <div className="ledger-tape p-5">
    <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">{label}</p>
    <p className={`text-3xl font-display tabular ${accent || ''}`}>{value}</p>
  </div>
)

export default function Dashboard({ locale }) {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const t = useTranslations(locale)
  const wsRef = useRef(null)

  async function refresh() {
    const data = await api.dashboard.stats()
    setStats(data)
    setHistory((prev) => [...prev.slice(-19), { time: new Date().toLocaleTimeString(), total: data.total_amount_eur }])
  }

  useEffect(() => {
    refresh()

    // Real-time updates (C3.1): listen on the dashboard websocket and
    // refresh whenever the backend broadcasts a transaction change.
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${window.location.host}/api/dashboard/ws`)
    wsRef.current = ws
    ws.onmessage = () => refresh()

    const poll = setInterval(refresh, 15000) // fallback if sockets are blocked on the network
    return () => { ws.close(); clearInterval(poll) }
  }, [])

  if (!stats) return <div className="p-8 text-ink/60">Loading dashboard…</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl mb-6">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('dashboard.total')} value={`€${stats.total_amount_eur.toLocaleString()}`} accent="text-teal" />
        <StatCard label={t('dashboard.donors')} value={stats.donor_count} accent="text-teal" />
        <StatCard label={t('dashboard.average')} value={`€${stats.average_donation_eur.toLocaleString()}`} accent="text-gold" />
        <StatCard label="Failed" value={stats.failed} accent="text-coral" />
      </div>
      <div className="ledger-tape p-5 h-72 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#1F7A6C" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="font-display text-xl mb-4">{t('dashboard.campaigns')}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {stats.campaigns.map((c) => (
          <div key={c.campaign_id} className="ledger-tape p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{c.name}</p>
              <span className="text-sm text-ink/60">{c.donor_count} donors</span>
            </div>
            <div className="h-2 rounded-full bg-line overflow-hidden mb-2">
              <div className="h-full bg-teal" style={{ width: `${Math.min(c.progress_pct, 100)}%` }} />
            </div>
            <p className="text-sm text-ink/60 tabular">€{c.raised_amount_eur.toLocaleString()} of €{c.goal_amount.toLocaleString()} ({c.progress_pct}%)</p>
          </div>
        ))}
        {stats.campaigns.length === 0 && <p className="text-ink/50">No campaigns yet.</p>}
      </div>
    </div>
  )
}
