import { useTranslations } from '../../i18n'

/**
 * Graceful failure handling (M1.6): declined card or offline/network error.
 */
export default function DeclinedStep({ reason, message, locale, onRetry, onCancel }) {
  const t = useTranslations(locale)
  const isOffline = reason === 'offline'
  const isError = reason === 'error'

  const title = isOffline ? t('donate.offline') : isError ? t('donate.error') : t('donate.declined')
  const help = isOffline ? t('donate.offlineHelp') : isError ? message : t('donate.declinedHelp')

  return (
    <div className="ledger-tape p-8 w-full max-w-sm text-center">
      <div className="w-16 h-16 rounded-full bg-coral/15 text-coral flex items-center justify-center mx-auto mb-4 text-3xl">✕</div>
      <h2 className="font-display text-2xl mb-1">{title}</h2>
      <p className="text-ink/60 mb-2">{help}</p>
      {reason && !isOffline && !isError && <p className="text-xs text-ink/40 mb-6 tabular">({reason})</p>}
      <div className="flex gap-3 mt-6">
        <button onClick={onCancel} className="flex-1 border border-line rounded-md py-3 font-medium hover:bg-ink/5">{t('donate.cancel')}</button>
        <button onClick={onRetry} className="flex-1 bg-ink text-paper rounded-md py-3 font-medium hover:opacity-90">{t('donate.tryAgain')}</button>
      </div>
    </div>
  )
}
