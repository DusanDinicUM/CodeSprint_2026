import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useTranslations } from '../../i18n'
import ProgressBar from '../../components/ProgressBar'
import RecentDonations from '../../components/donate/RecentDonations'
import WaveDivider from '../../components/WaveDivider'

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
        <h1 className="font-display italic text-2xl mt-6 mb-8 text-ink/90">{t('donate.pickCampaign')}</h1>

        {campaigns === null && <p className="text-ink/50">Loading campaigns…</p>}
        {campaigns?.length === 0 && <p className="text-ink/50">No active campaigns right now — check back soon.</p>}

        <div className="grid sm:grid-cols-2 gap-5">
          {campaigns?.map((c, i) => (
            <Link
              key={c.id} to={`/donate/${c.id}`}
              className="ledger-tape p-5 block hover:shadow-lg hover:shadow-teal/10 hover:-translate-y-1 transition-all animate-[fade-up_0.6s_ease-out_both]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center text-2xl shrink-0">
                  {c.logo_emoji || '💛'}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight truncate">{c.name}</p>
                  <p className="text-sm text-ink/60 flex items-center gap-1.5">
                    <span className="truncate">{c.charity_name}</span>
                    <span
                      className="inline-flex w-3.5 h-3.5 shrink-0 rounded-full bg-teal/15 text-teal items-center justify-center text-[9px] leading-none"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  </p>
                </div>
              </div>
              <div className="mb-2"><ProgressBar percent={c.progress_pct} /></div>
              <p className="text-xs text-ink/60 tabular">
                €{c.raised_amount_eur.toLocaleString()} {t('donate.raised')} · €{c.goal_amount.toLocaleString()} {t('donate.goal')} · {c.donor_count} {t('donate.donors')}
              </p>
            </Link>
          ))}
        </div>

        <WaveDivider className="my-10" />

        <RecentDonations locale={locale} />
      </div>
    </div>
  )
}
