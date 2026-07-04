import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useTranslations } from '../i18n'

const STATUS_COLORS = {
  completed: 'text-teal',
  pending: 'text-gold',
  failed: 'text-coral',
  reconciled: 'text-ink',
}

const EMPTY_FILTERS = { status: '', campaign_id: '', date_from: '', date_to: '', min_amount: '', max_amount: '' }

export default function Ledger({ locale }) {
  const [transactions, setTransactions] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sortBy, setSortBy] = useState('created_at')
  const [order, setOrder] = useState('desc')
  const t = useTranslations(locale)

  useEffect(() => { api.campaigns.list().then(setCampaigns).catch(console.error) }, [])

  useEffect(() => {
    const params = { sort_by: sortBy, order }
    Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value })
    api.transactions.list(params).then(setTransactions).catch(console.error)
  }, [filters, sortBy, order])

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function toggleSort(field) {
    if (sortBy === field) setOrder(order === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setOrder('desc') }
  }

  function campaignName(id) {
    return campaigns.find((c) => c.id === id)?.name || '—'
  }

  async function handleExport(format) {
    try {
      await (format === 'csv' ? api.transactions.exportCsv() : api.transactions.exportPdf())
    } catch {
      alert(`Could not export ${format.toUpperCase()}. Please try again.`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="font-display text-2xl">{t('ledger.title')}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('csv')} className="text-sm font-medium border border-line rounded-md px-3 py-1.5 hover:bg-ink/5">
            CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="text-sm font-medium border border-line rounded-md px-3 py-1.5 hover:bg-ink/5">
            PDF
          </button>
        </div>
      </div>

      <div className="ledger-tape p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Status</label>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className="border border-line rounded-md px-2 py-1.5 text-sm">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="reconciled">Reconciled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Campaign</label>
          <select value={filters.campaign_id} onChange={(e) => setFilter('campaign_id', e.target.value)} className="border border-line rounded-md px-2 py-1.5 text-sm">
            <option value="">All campaigns</option>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">From</label>
          <input type="date" value={filters.date_from} onChange={(e) => setFilter('date_from', e.target.value)} className="border border-line rounded-md px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">To</label>
          <input type="date" value={filters.date_to} onChange={(e) => setFilter('date_to', e.target.value)} className="border border-line rounded-md px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Min amount</label>
          <input type="number" min="0" step="0.01" value={filters.min_amount} onChange={(e) => setFilter('min_amount', e.target.value)} className="w-24 border border-line rounded-md px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Max amount</label>
          <input type="number" min="0" step="0.01" value={filters.max_amount} onChange={(e) => setFilter('max_amount', e.target.value)} className="w-24 border border-line rounded-md px-2 py-1.5 text-sm" />
        </div>
        <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-sm font-medium text-ink/60 hover:underline">Clear</button>
      </div>

      <div className="ledger-tape overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line">
            <tr>
              {[['reference', 'Reference'], ['amount', 'Amount'], ['currency', 'Currency'], ['status', 'Status'], ['payer_name', 'Donor'], ['campaign', 'Campaign'], ['created_at', 'Date']].map(([field, label]) => (
                <th key={field} className="text-left px-4 py-3 font-medium">
                  {field === 'campaign'
                    ? label
                    : (
                      <button onClick={() => toggleSort(field)} className="hover:underline">
                        {label} {sortBy === field ? (order === 'asc' ? '↑' : '↓') : ''}
                      </button>
                    )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3 tabular">{tx.reference}</td>
                <td className="px-4 py-3 tabular">{tx.amount.toFixed(2)}</td>
                <td className="px-4 py-3">{tx.currency}</td>
                <td className={`px-4 py-3 font-medium ${STATUS_COLORS[tx.status] || ''}`}>{tx.status}</td>
                <td className="px-4 py-3">{tx.donor_display_name || '—'}</td>
                <td className="px-4 py-3">{campaignName(tx.campaign_id)}</td>
                <td className="px-4 py-3 tabular text-ink/60">{new Date(tx.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-ink/50">No transactions match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
