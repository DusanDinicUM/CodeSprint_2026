import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useTranslations } from '../../i18n'
import ProgressBar from '../../components/ProgressBar'
import { currencySymbol } from '../../utils/currency'

/**
 * Public landing page (M1.1): donors pick which cause to support.
 * No login required - this is the front door of the donation app.
 */
export default function CampaignPicker({ locale }) {
  const [campaigns, setCampaigns] = useState(null)
  const [recentDonations, setRecentDonations] = useState(null)
  const t = useTranslations(locale)

  useEffect(() => {
    api.campaigns.list().then((data) => setCampaigns(data.filter((c) => c.is_active))).catch(() => setCampaigns([]))
    api.donations.recent().then(setRecentDonations).catch(() => setRecentDonations([]))
  }, [])

  return (
    <div className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl mt-6 mb-8">{t('donate.pickCampaign')}</h1>

        {campaigns === null && <p className="text-ink/50">Loading campaigns…</p>}
        {campaigns?.length === 0 && <p className="text-ink/50">No active campaigns right now — check back soon.</p>}

        <div className="grid sm:grid-cols-2 gap-5">
          {campaigns?.map((c) => (
            <Link key={c.id} to={`/donate/${c.id}`} className="ledger-tape p-5 block hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">{c.logo_emoji || '💛'}</div>
              <p className="font-display text-lg">{c.name}</p>
              <p className="text-sm text-ink/60 mb-3">{c.charity_name}</p>
              <div className="mb-2"><ProgressBar percent={c.progress_pct} /></div>
              <p className="text-xs text-ink/60 tabular">
                €{c.raised_amount_eur.toLocaleString()} {t('donate.raised')} · €{c.goal_amount.toLocaleString()} {t('donate.goal')} · {c.donor_count} {t('donate.donors')}
              </p>
            </Link>
          ))}
        </div>

        <h2 className="font-display text-xl mt-10 mb-4">{t('donate.recentDonations')}</h2>
        <div className="ledger-tape divide-y divide-line">
          {recentDonations === null && <p className="text-ink/50 p-5">Loading…</p>}
          {recentDonations?.length === 0 && <p className="text-ink/50 p-5">{t('donate.noDonationsYet')}</p>}
          {recentDonations?.map((d, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm">{d.donor_display_name || 'Anonymous'}</span>
              <span className="font-display tabular">{currencySymbol(d.currency)}{d.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
