import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import { useTranslations } from '../../i18n'
import AmountStep from '../../components/donate/AmountStep'
import DetailsStep from '../../components/donate/DetailsStep'
import PaymentStep from '../../components/donate/PaymentStep'
import ConfirmationStep from '../../components/donate/ConfirmationStep'
import DeclinedStep from '../../components/donate/DeclinedStep'

/**
 * The donation terminal (M1): amount -> recognition/extras -> payment -> outcome.
 * Each step is its own component; this just holds the accumulated donation
 * state and decides which step to render next.
 */
export default function DonateFlow({ locale }) {
  const { campaignId } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [step, setStep] = useState('amount')
  const [draft, setDraft] = useState({})
  const [outcome, setOutcome] = useState(null) // { ok, transaction } | { ok: false, reason }
  const t = useTranslations(locale)

  useEffect(() => {
    api.campaigns.get(campaignId).then(setCampaign).catch(() => setCampaign(false))
  }, [campaignId])

  function resetToStart() {
    setDraft({})
    setOutcome(null)
    setStep('amount')
  }

  async function submitDonation(payment) {
    setStep('processing')
    const payload = {
      campaign_id: campaignId,
      amount: draft.amount,
      currency: draft.currency,
      is_anonymous: draft.isAnonymous,
      payer_name: draft.payerName,
      is_recurring: draft.isRecurring,
      gift_aid: draft.giftAid,
      ...payment,
    }
    const result = await api.donations.create(payload)
    setOutcome(result)
    setStep(result.ok ? 'confirmation' : 'declined')
  }

  if (campaign === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-4">
        <p className="text-ink/60">Campaign not found. <Link to="/" className="text-teal hover:underline">Back to campaigns</Link></p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-10 flex flex-col items-center">
      <Link to="/" className="self-start max-w-3xl w-full mx-auto text-sm text-ink/50 hover:underline mb-6">← All campaigns</Link>

      {!campaign && <p className="text-ink/50">Loading…</p>}

      {campaign && step === 'amount' && (
        <AmountStep
          campaign={campaign} locale={locale}
          onContinue={({ amount, currency }) => { setDraft((d) => ({ ...d, amount, currency })); setStep('details') }}
        />
      )}

      {campaign && step === 'details' && (
        <DetailsStep
          locale={locale}
          onBack={() => setStep('amount')}
          onContinue={(details) => { setDraft((d) => ({ ...d, ...details })); setStep('payment') }}
        />
      )}

      {campaign && step === 'payment' && (
        <PaymentStep locale={locale} onBack={() => setStep('details')} onSubmit={submitDonation} />
      )}

      {step === 'processing' && (
        <div className="ledger-tape p-8 w-full max-w-sm text-center">
          <div className="w-10 h-10 border-4 border-teal/30 border-t-teal rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink/60">{t('donate.processing')}</p>
        </div>
      )}

      {step === 'confirmation' && outcome?.ok && (
        <ConfirmationStep transaction={outcome.transaction} locale={locale} onDonateAgain={resetToStart} />
      )}

      {step === 'declined' && !outcome?.ok && (
        <DeclinedStep
          reason={outcome?.reason} locale={locale}
          onRetry={() => setStep('payment')}
          onCancel={resetToStart}
        />
      )}
    </div>
  )
}
