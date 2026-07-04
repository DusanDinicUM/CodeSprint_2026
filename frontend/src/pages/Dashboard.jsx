import { useEffect, useRef, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../api/client'
import { useTranslations } from '../i18n'
import ProgressBar from '../components/ProgressBar'

const StatCard = ({ label, value, accent }) => (
  <div className="ledger-tape p-5">
    <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">{label}</p>
    <p className={`text-3xl font-display tabular ${accent || ''}`}>{value}</p>
  </div>
)

const TIME_WINDOWS = [
  { key: 'minute', label: 'Last hour', tickFormat: (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  { key: 'hour', label: 'Last 24h', tickFormat: (d) => d.toLocaleTimeString([], { hour: '2-digit' }) },
  { key: 'day', label: 'Last 30 days', tickFormat: (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric' }) },
]

export default function Dashboard({ locale }) {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [timeWindow, setTimeWindow] = useState('hour')
  const t = useTranslations(locale)
  const refreshRef = useRef(() => {})

  useEffect(() => {
    async function refresh() {
      const [statsData, historyData] = await Promise.all([
        api.dashboard.stats(),
        api.dashboard.history(timeWindow),
      ])
      setStats(statsData)
      setHistory(historyData)
    }
    refreshRef.current = refresh
    refresh()
  }, [timeWindow])

  useEffect(() => {
    // Real-time updates (C3.1): listen on the dashboard websocket and
    // refresh (stats + the currently selected chart window) whenever the
    // backend broadcasts a donation. Kept in its own effect (mount-only) so
    // switching time windows doesn't tear down and reconnect the socket.
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const token = localStorage.getItem('access_token')
    const ws = new WebSocket(`${proto}://${window.location.host}/api/dashboard/ws?token=${encodeURIComponent(token)}`)
    ws.onmessage = () => refreshRef.current()

    const poll = setInterval(() => refreshRef.current(), 15000) // fallback if sockets are blocked on the network
    return () => { ws.close(); clearInterval(poll) }
  }, [])

  if (!stats) return <div className="p-8 text-ink/60">Loading dashboard…</div>

  const activeWindow = TIME_WINDOWS.find((w) => w.key === timeWindow)
  const chartData = history.map((b) => ({ ...b, label: activeWindow.tickFormat(new Date(b.bucket_start)) }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl mb-6">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('dashboard.total')} value={`€${stats.total_amount_eur.toLocaleString()}`} accent="text-teal" />
        <StatCard label={t('dashboard.donors')} value={stats.donor_count} accent="text-teal" />
        <StatCard label={t('dashboard.average')} value={`€${stats.average_donation_eur.toLocaleString()}`} accent="text-gold" />
        <StatCard label="Failed" value={stats.failed} accent="text-coral" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-ink/70">Donation activity</p>
        <div className="flex gap-1">
          {TIME_WINDOWS.map((w) => (
            <button
              key={w.key}
              onClick={() => setTimeWindow(w.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${timeWindow === w.key ? 'bg-ink text-paper' : 'border border-line hover:bg-ink/5'}`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
      <div className="ledger-tape p-5 h-72 mb-8">
        {/* Per-bucket amounts, not a running total (M2.3) - a small recent
            donation stays visible as its own bar no matter how large the
            all-time total in the stat tile above gets. */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value, name) => (name === 'total_eur' ? [`€${value}`, 'Raised'] : [value, 'Donations'])} />
            <Bar dataKey="total_eur" fill="#1F7A6C" radius={[2, 2, 0, 0]} />
          </BarChart>
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
            <div className="mb-2"><ProgressBar percent={c.progress_pct} /></div>
            <p className="text-sm text-ink/60 tabular">€{c.raised_amount_eur.toLocaleString()} of €{c.goal_amount.toLocaleString()} ({c.progress_pct}%)</p>
          </div>
        ))}
        {stats.campaigns.length === 0 && <p className="text-ink/50">No campaigns yet.</p>}
      </div>
    </div>
  )
}
