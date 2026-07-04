import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM = {
  name: '', charity_name: '', description: '', logo_emoji: '',
  goal_amount: '', suggested_amounts: '5,10,25', start_date: '', end_date: '', is_active: true,
}

function toDateInput(iso) {
  return iso ? iso.slice(0, 10) : ''
}

/**
 * Create/Edit/Delete screen for campaigns (M2.2).
 */
export default function Admin() {
  const [campaigns, setCampaigns] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const { hasRole } = useAuth()

  function load() {
    api.campaigns.list().then(setCampaigns).catch(console.error)
  }
  useEffect(load, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      goal_amount: Number(form.goal_amount) || 0,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    }
    if (editingId) await api.campaigns.update(editingId, payload)
    else await api.campaigns.create(payload)
    setForm(EMPTY_FORM)
    setEditingId(null)
    load()
  }

  function startEdit(campaign) {
    setEditingId(campaign.id)
    setForm({
      name: campaign.name,
      charity_name: campaign.charity_name || '',
      description: campaign.description || '',
      logo_emoji: campaign.logo_emoji || '',
      goal_amount: String(campaign.goal_amount),
      suggested_amounts: campaign.suggested_amounts,
      start_date: toDateInput(campaign.start_date),
      end_date: toDateInput(campaign.end_date),
      is_active: campaign.is_active,
    })
  }

  async function handleDelete(id) {
    if (!confirm('Delete this campaign? This cannot be undone.')) return
    await api.campaigns.remove(id)
    load()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl mb-6">Manage campaigns</h1>

      <form onSubmit={handleSubmit} className="ledger-tape p-5 mb-8 grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Campaign name</label>
          <input
            required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Charity name</label>
          <input
            required value={form.charity_name} onChange={(e) => setForm({ ...form, charity_name: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Description / cause</label>
          <input
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo (emoji stand-in)</label>
          <input
            value={form.logo_emoji} onChange={(e) => setForm({ ...form, logo_emoji: e.target.value })}
            placeholder="🎗️" className="w-full border border-line rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Goal amount (EUR)</label>
          <input
            required type="number" min="0" step="0.01" value={form.goal_amount}
            onChange={(e) => setForm({ ...form, goal_amount: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Suggested amounts (comma-separated)</label>
          <input
            required value={form.suggested_amounts} onChange={(e) => setForm({ ...form, suggested_amounts: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start date</label>
          <input
            type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End date</label>
          <input
            type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2"
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-4 mt-1">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Accepting donations
          </label>
          <button type="submit" className="ml-auto bg-ink text-paper rounded-md px-4 py-2 font-medium hover:opacity-90">
            {editingId ? 'Save changes' : 'Create campaign'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM) }} className="text-sm font-medium text-ink/60 hover:underline">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="ledger-tape divide-y divide-line">
        {campaigns.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-5 py-3 gap-3">
            <div>
              <p className="font-medium">{c.logo_emoji} {c.name} <span className="text-ink/50 font-normal">— {c.charity_name}</span></p>
              <p className="text-sm text-ink/60">
                €{c.raised_amount_eur.toLocaleString()} raised of €{c.goal_amount.toLocaleString()} ({c.progress_pct}%) · {c.donor_count} donors
                {!c.is_active && <span className="text-coral"> · inactive</span>}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              {hasRole('manager') && (
                <button onClick={() => startEdit(c)} className="text-sm font-medium text-teal hover:underline">Edit</button>
              )}
              {hasRole('admin') && (
                <button onClick={() => handleDelete(c.id)} className="text-sm font-medium text-coral hover:underline">Delete</button>
              )}
            </div>
          </div>
        ))}
        {campaigns.length === 0 && <p className="px-5 py-8 text-center text-ink/50">No campaigns yet — create the first one above.</p>}
      </div>
    </div>
  )
}
