import { useEffect, useState } from 'react'
import { api } from '../api/client'

/**
 * Audit log (M2.7): every mutating admin action, newest first. Admin-only,
 * mirroring the backend's require_role(Role.ADMIN) on GET /audit.
 */
export default function Audit() {
  const [logs, setLogs] = useState(null)

  useEffect(() => {
    api.audit.list().then(setLogs).catch(console.error)
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl mb-6">Audit log</h1>

      <div className="ledger-tape overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Action</th>
              <th className="text-left px-4 py-3 font-medium">Target</th>
              <th className="text-left px-4 py-3 font-medium">Details</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3 font-medium">{log.action}</td>
                <td className="px-4 py-3 text-ink/70">{log.target_type}{log.target_id ? ` · ${log.target_id.slice(0, 8)}` : ''}</td>
                <td className="px-4 py-3 text-ink/70">{log.details || '—'}</td>
                <td className="px-4 py-3 tabular text-ink/60">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {logs?.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-ink/50">No admin actions logged yet.</td></tr>
            )}
          </tbody>
        </table>
        {!logs && <p className="px-4 py-8 text-center text-ink/50">Loading…</p>}
      </div>
    </div>
  )
}
