import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useTranslations } from '../../i18n'

/**
 * Public landing page (M1.1): donors pick which cause to support.
 * No login required - this is the front door of the donation app.
 */
export default function CampaignPicker({ locale }) {
  const [campaigns, setCampaigns] = useState(null)
  const t = useTranslations(locale)

  useEffect(() => {
    api.campaigns.list().then((data) => setCampaigns(data.filter((c) => c.is_active))).catch(() => setCampaigns([]))
  }, [])

  return (
    <div className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl">⚡ {t('app.name')}</h1>
          <Link to="/staff/login" className="text-sm text-ink/50 hover:underline">Charity staff login</Link>
        </div>
        <p className="text-ink/60 mb-8">{t('donate.pickCampaign')}</p>

        {campaigns === null && <p className="text-ink/50">Loading campaigns…</p>}
        {campaigns?.length === 0 && <p className="text-ink/50">No active campaigns right now — check back soon.</p>}

        <div className="grid sm:grid-cols-2 gap-5">
          {campaigns?.map((c) => (
            <Link key={c.id} to={`/donate/${c.id}`} className="ledger-tape p-5 block hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">{c.logo_emoji || '💛'}</div>
              <p className="font-display text-lg">{c.name}</p>
              <p className="text-sm text-ink/60 mb-3">{c.charity_name}</p>
              <div className="h-2 rounded-full bg-line overflow-hidden mb-2">
                <div className="h-full bg-teal" style={{ width: `${Math.min(c.progress_pct, 100)}%` }} />
              </div>
              <p className="text-xs text-ink/60 tabular">
                €{c.raised_amount_eur.toLocaleString()} {t('donate.raised')} · €{c.goal_amount.toLocaleString()} {t('donate.goal')} · {c.donor_count} {t('donate.donors')}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
