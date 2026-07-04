import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useTranslations } from '../../i18n'
import { currencySymbol } from '../../utils/currency'

function donorInitials(name) {
  if (!name || name === 'Anonymous') return '·'
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

/**
 * Public donation feed (M1.1) - shared by the landing page and the campaign
 * picker so the social-proof list reads identically wherever it shows up.
 */
export default function RecentDonations({ locale }) {
  const [recentDonations, setRecentDonations] = useState(null)
  const t = useTranslations(locale)

  useEffect(() => {
    api.donations.recent().then(setRecentDonations).catch(() => setRecentDonations([]))
  }, [])

  return (
    <>
      <h2 className="font-display text-xl mt-10 mb-4">{t('donate.recentDonations')}</h2>
      <div className="ledger-tape divide-y divide-line">
        {recentDonations === null && <p className="text-ink/50 p-5">Loading…</p>}
        {recentDonations?.length === 0 && <p className="text-ink/50 p-5">{t('donate.noDonationsYet')}</p>}
        {recentDonations?.map((d, i) => {
          const name = d.donor_display_name || 'Anonymous'
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 animate-[fade-up_0.5s_ease-out_both]"
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
            >
              <span className="w-8 h-8 rounded-full bg-teal/10 text-teal font-display text-xs flex items-center justify-center shrink-0">
                {donorInitials(name)}
              </span>
              <span className="text-sm flex-1 truncate">{name}</span>
              <span className="font-display tabular">{currencySymbol(d.currency)}{d.amount.toLocaleString()}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}
