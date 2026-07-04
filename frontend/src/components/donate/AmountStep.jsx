import { useState } from 'react'
import { useTranslations } from '../../i18n'

const CURRENCIES = ['EUR', 'USD', 'GBP']
const SYMBOLS = { EUR: '€', USD: '$', GBP: '£' }

/**
 * Preset + custom amount entry (M1.2) with a currency selector (M1.5).
 */
export default function AmountStep({ campaign, locale, onContinue }) {
  const presets = campaign.suggested_amounts.split(',').map((n) => Number(n.trim())).filter(Boolean)
  const [amount, setAmount] = useState(presets[0] || 10)
  const [custom, setCustom] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const t = useTranslations(locale)

  const effectiveAmount = custom ? Number(custom) : amount
  const valid = effectiveAmount > 0

  return (
    <div className="ledger-tape p-8 w-full max-w-sm">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{campaign.logo_emoji || '💛'}</div>
        <p className="font-medium">{campaign.charity_name}</p>
        <p className="text-sm text-ink/60">{campaign.name}</p>
        <div className="h-2 rounded-full bg-line overflow-hidden my-3">
          <div className="h-full bg-teal" style={{ width: `${Math.min(campaign.progress_pct, 100)}%` }} />
        </div>
        <p className="text-xs text-ink/60 tabular">
          €{campaign.raised_amount_eur.toLocaleString()} {t('donate.raised')} of €{campaign.goal_amount.toLocaleString()} {t('donate.goal')}
        </p>
      </div>

      <p className="text-sm font-medium mb-2">{t('donate.chooseAmount')}</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => { setAmount(p); setCustom('') }}
            className={`rounded-md py-3 font-display text-lg border ${!custom && amount === p ? 'bg-ink text-paper border-ink' : 'border-line hover:bg-ink/5'}`}
          >
            {SYMBOLS[currency]}{p}
          </button>
        ))}
      </div>
      <input
        type="number" min="0" step="0.01" placeholder={t('donate.customAmount')}
        value={custom} onChange={(e) => setCustom(e.target.value)}
        className="w-full border border-line rounded-md px-3 py-2 mb-4 focus-visible:outline-gold"
        aria-label={t('donate.customAmount')}
      />

      <div className="flex items-center justify-between mb-6">
        <label className="text-sm font-medium" htmlFor="currency">Currency</label>
        <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="border border-line rounded-md px-2 py-1.5 text-sm">
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <button
        disabled={!valid}
        onClick={() => onContinue({ amount: effectiveAmount, currency })}
        className="w-full bg-ink text-paper rounded-md py-3 font-medium hover:opacity-90 disabled:opacity-40"
      >
        {t('donate.continue')} — {SYMBOLS[currency]}{valid ? effectiveAmount.toFixed(2) : '0.00'}
      </button>
    </div>
  )
}
