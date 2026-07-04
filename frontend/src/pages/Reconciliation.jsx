import { useEffect, useState } from 'react'
import { api } from '../api/client'

/**
 * Reconciliation view (M2.6): matches card-payment donations against the
 * (simulated) Mastercard sandbox's own record of those transactions.
 */
export default function Reconciliation() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.reconciliation.get().then(setData).catch(console.error)
  }, [])

  if (!data) return <div className="max-w-5xl mx-auto px-4 py-8 text-ink/60">Loading…</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl mb-6">Reconciliation</h1>

      <section className="mb-8">
        <h2 className="font-medium mb-3">Matched <span className="text-ink/50 font-normal">({data.matched.length})</span></h2>
        <div className="ledger-tape overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Reference</th>
                <th className="text-left px-4 py-2 font-medium">Local amount</th>
                <th className="text-left px-4 py-2 font-medium">Sandbox amount</th>
                <th className="text-left px-4 py-2 font-medium">Match</th>
              </tr>
            </thead>
            <tbody>
              {data.matched.map((r) => (
                <tr key={r.transaction_id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-2 tabular">{r.reference}</td>
                  <td className="px-4 py-2 tabular">{r.local_amount.toFixed(2)}</td>
                  <td className="px-4 py-2 tabular">{r.external_amount?.toFixed(2)}</td>
                  <td className={`px-4 py-2 font-medium ${r.match ? 'text-teal' : 'text-coral'}`}>{r.match ? 'Yes' : 'Amount mismatch'}</td>
                </tr>
              ))}
              {data.matched.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-ink/50">No matched records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-medium mb-3">Unmatched local transactions <span className="text-ink/50 font-normal">({data.unmatched_local.length})</span></h2>
        <p className="text-sm text-ink/50 mb-3">Tap payments never appear here by design - only card payments get a sandbox external ID to reconcile against.</p>
        <div className="ledger-tape overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Reference</th>
                <th className="text-left px-4 py-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.unmatched_local.map((r) => (
                <tr key={r.transaction_id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-2 tabular">{r.reference}</td>
                  <td className="px-4 py-2 tabular">{r.amount.toFixed(2)}</td>
                </tr>
              ))}
              {data.unmatched_local.length === 0 && <tr><td colSpan={2} className="px-4 py-6 text-center text-ink/50">Nothing unmatched.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-3">Unmatched sandbox records <span className="text-ink/50 font-normal">({data.unmatched_external.length})</span></h2>
        <div className="ledger-tape overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className="text-left px-4 py-2 font-medium">External ID</th>
                <th className="text-left px-4 py-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.unmatched_external.map((r) => (
                <tr key={r.external_id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-2 tabular">{r.external_id}</td>
                  <td className="px-4 py-2 tabular">{r.amount?.toFixed(2)}</td>
                </tr>
              ))}
              {data.unmatched_external.length === 0 && <tr><td colSpan={2} className="px-4 py-6 text-center text-ink/50">Nothing unmatched.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
