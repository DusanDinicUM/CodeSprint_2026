import { useState } from 'react'
import { useTranslations } from '../../i18n'

/**
 * Tap-to-donate (simulated - the Mastercard sandbox has no tap support for
 * donations) vs. manual card entry (validated against the sandbox) (M1.3).
 */
export default function PaymentStep({ locale, onBack, onSubmit }) {
  const [method, setMethod] = useState(null)
  const [card, setCard] = useState({ card_number: '', expiry_month: '', expiry_year: '', cvv: '', cardholder_name: '' })
  const t = useTranslations(locale)

  const cardValid = card.card_number.replace(/\s/g, '').length >= 12 && card.expiry_month && card.expiry_year && card.cvv.length >= 3 && card.cardholder_name

  if (method === null) {
    return (
      <div className="ledger-tape p-8 w-full max-w-sm">
        <p className="font-medium mb-4">{t('donate.paymentMethod')}</p>
        <div className="space-y-3 mb-6">
          <button onClick={() => setMethod('tap')} className="w-full border border-line rounded-md py-4 font-medium hover:bg-ink/5 flex items-center justify-center gap-2">
            📡 {t('donate.tapToPay')}
          </button>
          <button onClick={() => setMethod('card')} className="w-full border border-line rounded-md py-4 font-medium hover:bg-ink/5 flex items-center justify-center gap-2">
            💳 {t('donate.cardDetails')}
          </button>
        </div>
        <button onClick={onBack} className="w-full text-sm font-medium text-ink/60 hover:underline">{t('donate.back')}</button>
      </div>
    )
  }

  if (method === 'tap') {
    return (
      <div className="ledger-tape p-8 w-full max-w-sm text-center">
        <div className="w-24 h-24 rounded-full border-4 border-teal/30 flex items-center justify-center mx-auto mb-5 animate-pulse">
          <span className="text-4xl">📡</span>
        </div>
        <p className="text-ink/70 mb-6">{t('donate.holdCard')}</p>
        <button onClick={() => onSubmit({ payment_method: 'tap' })} className="w-full bg-ink text-paper rounded-md py-3 font-medium hover:opacity-90 mb-3">
          {t('donate.tapToPay')} (simulate)
        </button>
        <button onClick={() => setMethod(null)} className="text-sm font-medium text-ink/60 hover:underline">{t('donate.back')}</button>
      </div>
    )
  }

  return (
    <div className="ledger-tape p-8 w-full max-w-sm">
      <p className="font-medium mb-4">{t('donate.cardDetails')}</p>
      <div className="space-y-3 mb-6">
        <input
          value={card.card_number} onChange={(e) => setCard({ ...card, card_number: e.target.value })}
          placeholder="4111 1111 1111 1111" aria-label={t('donate.cardNumber')} inputMode="numeric"
          className="w-full border border-line rounded-md px-3 py-2"
        />
        <div className="flex gap-2">
          <input
            value={card.expiry_month} onChange={(e) => setCard({ ...card, expiry_month: e.target.value })}
            placeholder="MM" aria-label="Expiry month" inputMode="numeric" maxLength={2}
            className="w-1/4 border border-line rounded-md px-3 py-2"
          />
          <input
            value={card.expiry_year} onChange={(e) => setCard({ ...card, expiry_year: e.target.value })}
            placeholder="YYYY" aria-label="Expiry year" inputMode="numeric" maxLength={4}
            className="w-1/3 border border-line rounded-md px-3 py-2"
          />
          <input
            value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })}
            placeholder={t('donate.cvv')} aria-label={t('donate.cvv')} inputMode="numeric" maxLength={4}
            className="flex-1 border border-line rounded-md px-3 py-2"
          />
        </div>
        <input
          value={card.cardholder_name} onChange={(e) => setCard({ ...card, cardholder_name: e.target.value })}
          placeholder={t('donate.cardholder')} aria-label={t('donate.cardholder')}
          className="w-full border border-line rounded-md px-3 py-2"
        />
      </div>
      <p className="text-xs text-ink/50 mb-4">Validated against the Mastercard Donate sandbox. Try a card ending in 0000 to see a decline.</p>
      <div className="flex gap-3">
        <button onClick={() => setMethod(null)} className="flex-1 border border-line rounded-md py-3 font-medium hover:bg-ink/5">{t('donate.back')}</button>
        <button
          disabled={!cardValid}
          onClick={() => onSubmit({
            payment_method: 'card',
            card: {
              ...card,
              expiry_month: Number(card.expiry_month),
              expiry_year: Number(card.expiry_year),
            },
          })}
          className="flex-1 bg-ink text-paper rounded-md py-3 font-medium hover:opacity-90 disabled:opacity-40"
        >
          {t('donate.pay')}
        </button>
      </div>
    </div>
  )
}
