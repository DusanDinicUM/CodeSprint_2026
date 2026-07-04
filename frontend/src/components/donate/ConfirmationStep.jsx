import { useState } from 'react'
import { useTranslations } from '../../i18n'
import { currencySymbol } from '../../utils/currency'

/**
 * Confirmation screen + optional simulated email/SMS receipt (M1.4).
 * No real email/SMS provider is wired up - this is a proof-of-concept,
 * so "sending" just acknowledges the request.
 */
export default function ConfirmationStep({ transaction, locale, onDonateAgain }) {
  const [contact, setContact] = useState('')
  const [sent, setSent] = useState(false)
  const t = useTranslations(locale)

  function sendReceipt(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="ledger-tape p-8 w-full max-w-sm text-center">
      <div className="w-16 h-16 rounded-full bg-teal/15 text-teal flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
      <h2 className="font-display text-2xl mb-1">{t('donate.confirmTitle')}</h2>
      <p className="text-ink/60 mb-4">{t('donate.confirmThanks')}</p>
      <p className="font-display text-3xl tabular mb-1">{currencySymbol(transaction.currency)}{transaction.amount.toFixed(2)}</p>
      <p className="text-xs text-ink/50 tabular mb-6">{t('donate.reference')}: {transaction.reference}</p>

      {!sent ? (
        <form onSubmit={sendReceipt} className="text-left mb-4">
          <label className="block text-sm font-medium mb-2">{t('donate.receiptPrompt')}</label>
          <input
            value={contact} onChange={(e) => setContact(e.target.value)}
            placeholder={`${t('donate.email')} / ${t('donate.phone')}`}
            className="w-full border border-line rounded-md px-3 py-2 mb-3"
          />
          <button type="submit" disabled={!contact} className="w-full border border-line rounded-md py-2.5 font-medium hover:bg-ink/5 disabled:opacity-40">
            {t('donate.sendReceipt')}
          </button>
        </form>
      ) : (
        <p className="text-teal text-sm mb-4" role="status">{t('donate.receiptSent')} ({contact})</p>
      )}

      <button onClick={onDonateAgain} className="w-full bg-ink text-paper rounded-md py-3 font-medium hover:opacity-90">
        {t('donate.newDonation')}
      </button>
    </div>
  )
}
