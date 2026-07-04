import { useState } from 'react'
import { useTranslations } from '../../i18n'

/**
 * Donor recognition (C1.3), recurring/round-up prototype (S1.1), and
 * gift-aid declaration prototype (S1.2) - captured before payment.
 */
export default function DetailsStep({ locale, onBack, onContinue }) {
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [payerName, setPayerName] = useState('')
  const [roundUp, setRoundUp] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [giftAid, setGiftAid] = useState(false)
  // Gift Aid needs a name + home address for HMRC regardless of public
  // display preference - a donor can stay "Anonymous" on the public feed
  // while still being on record for the tax reclaim, so this is captured
  // separately from the recognition name above rather than forcing it public.
  const [giftAidName, setGiftAidName] = useState('')
  const [giftAidAddress, setGiftAidAddress] = useState('')
  const t = useTranslations(locale)

  const giftAidIncomplete = giftAid && (!giftAidAddress.trim() || (isAnonymous && !giftAidName.trim()))

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
        <input type="checkbox" checked={roundUp} onChange={(e) => setRoundUp(e.target.checked)} className="mt-0.5" />
        {t('donate.roundUp')}
      </label>
      <label className="flex items-start gap-2 text-sm mb-3">
        <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="mt-0.5" />
        {t('donate.monthly')}
      </label>
      <label className="flex items-start gap-2 text-sm mb-3">
        <input type="checkbox" checked={giftAid} onChange={(e) => setGiftAid(e.target.checked)} className="mt-0.5" />
        {t('donate.giftAid')}
      </label>

      {giftAid && (
        <div className="mb-6 p-3 border border-line rounded-md space-y-2">
          <p className="text-xs text-ink/60">{t('donate.giftAidNote')}</p>
          {isAnonymous && (
            <input
              value={giftAidName} onChange={(e) => setGiftAidName(e.target.value)}
              placeholder={t('donate.giftAidName')} aria-label={t('donate.giftAidName')}
              className="w-full border border-line rounded-md px-3 py-2 text-sm"
            />
          )}
          <textarea
            value={giftAidAddress} onChange={(e) => setGiftAidAddress(e.target.value)}
            placeholder={t('donate.giftAidAddress')} aria-label={t('donate.giftAidAddress')}
            rows={2}
            className="w-full border border-line rounded-md px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-line rounded-md py-3 font-medium hover:bg-ink/5">{t('donate.back')}</button>
        <button
          disabled={giftAidIncomplete}
          onClick={() => onContinue({
            isAnonymous,
            payerName: isAnonymous ? (giftAid ? giftAidName : '') : payerName,
            roundUp, isRecurring, giftAid,
            giftAidAddress: giftAid ? giftAidAddress : '',
          })}
          className="flex-1 bg-ink text-paper rounded-md py-3 font-medium hover:opacity-90 disabled:opacity-40"
        >
          {t('donate.continue')}
        </button>
      </div>
    </div>
  )
}
