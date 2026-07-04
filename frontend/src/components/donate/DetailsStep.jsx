import { useState } from 'react'
import { useTranslations } from '../../i18n'

/**
 * Donor recognition (C1.3), recurring/round-up prototype (S1.1), and
 * gift-aid declaration prototype (S1.2) - captured before payment.
 */
export default function DetailsStep({ locale, onBack, onContinue }) {
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [payerName, setPayerName] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [giftAid, setGiftAid] = useState(false)
  const t = useTranslations(locale)

  return (
    <div className="ledger-tape p-8 w-full max-w-sm">
      <p className="font-medium mb-3">{t('donate.recognition')}</p>
      <div className="space-y-2 mb-5">
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="recognition" checked={isAnonymous} onChange={() => setIsAnonymous(true)} />
          {t('donate.anonymous')}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="recognition" checked={!isAnonymous} onChange={() => setIsAnonymous(false)} />
          {t('donate.showName')}
        </label>
        {!isAnonymous && (
          <input
            value={payerName} onChange={(e) => setPayerName(e.target.value)}
            placeholder={t('donate.yourName')} aria-label={t('donate.yourName')}
            className="w-full border border-line rounded-md px-3 py-2 mt-1"
          />
        )}
      </div>

      <label className="flex items-start gap-2 text-sm mb-3">
        <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="mt-0.5" />
        {t('donate.recurring')}
      </label>
      <label className="flex items-start gap-2 text-sm mb-6">
        <input type="checkbox" checked={giftAid} onChange={(e) => setGiftAid(e.target.checked)} className="mt-0.5" />
        {t('donate.giftAid')}
      </label>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-line rounded-md py-3 font-medium hover:bg-ink/5">{t('donate.back')}</button>
        <button
          onClick={() => onContinue({ isAnonymous, payerName: isAnonymous ? '' : payerName, isRecurring, giftAid })}
          className="flex-1 bg-ink text-paper rounded-md py-3 font-medium hover:opacity-90"
        >
          {t('donate.continue')}
        </button>
      </div>
    </div>
  )
}
