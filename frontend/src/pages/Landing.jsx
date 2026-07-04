import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useTranslations } from '../i18n'
import RecentDonations from '../components/donate/RecentDonations'
import WaveDivider from '../components/WaveDivider'

/**
 * Root gateway (M1.1 entry point): asks who's visiting before routing them
 * into the right experience - the donation app and the staff tool have very
 * different audiences and neither should have to wade through the other's UI.
 */
export default function Landing({ locale }) {
  const t = useTranslations(locale)
  const [resetting, setResetting] = useState(false)

  async function handleResetDb() {
    if (!confirm('This will permanently delete every campaign and donation (staff logins are kept). This cannot be undone. Proceed?')) return
    setResetting(true)
    try {
      await api.resetDb()
      window.location.reload()
    } catch {
      setResetting(false)
      alert('Could not reset the database. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center text-center overflow-hidden">
      <div className="relative w-full flex flex-col items-center px-4 pt-16 pb-10">
        <div className="ocean-waves absolute inset-x-0 top-0 h-24" aria-hidden="true" />

        <p
          className="font-display text-sm tracking-widest uppercase text-ink/40 mb-4 animate-[fade-up_0.7s_ease-out_both]"
        >
          {t('app.name')}
        </p>
        <h1
          className="font-display italic text-3xl sm:text-4xl max-w-xl mb-4 leading-tight animate-[fade-up_0.7s_ease-out_both]"
          style={{ animationDelay: '90ms' }}
        >
          {t('landing.inspire')}
        </h1>
        <p
          className="text-ink/60 mb-12 max-w-md animate-[fade-up_0.7s_ease-out_both]"
          style={{ animationDelay: '180ms' }}
        >
          {t('landing.tagline')}
        </p>

        <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl text-left">
          <Link
            to="/donate"
            className="ledger-tape p-6 block hover:shadow-lg hover:shadow-teal/10 hover:-translate-y-1 transition-all animate-[fade-up_0.7s_ease-out_both]"
            style={{ animationDelay: '270ms' }}
          >
            <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center text-2xl mb-4">💛</div>
            <p className="font-display text-lg mb-1">{t('landing.donor')}</p>
            <p className="text-sm text-ink/60">{t('landing.donorSubtitle')}</p>
          </Link>

          <Link
            to="/staff/login"
            className="ledger-tape p-6 block hover:shadow-lg hover:shadow-teal/10 hover:-translate-y-1 transition-all animate-[fade-up_0.7s_ease-out_both]"
            style={{ animationDelay: '360ms' }}
          >
            <div className="w-12 h-12 rounded-full bg-teal/15 flex items-center justify-center text-2xl mb-4">🗂️</div>
            <p className="font-display text-lg mb-1">{t('landing.staff')}</p>
            <p className="text-sm text-ink/60">{t('landing.staffSubtitle')}</p>
          </Link>
        </div>
      </div>

      <WaveDivider className="max-w-2xl" />

      <div className="w-full max-w-2xl text-left px-4 animate-[fade-up_0.7s_ease-out_both]" style={{ animationDelay: '450ms' }}>
        <RecentDonations locale={locale} />
      </div>

      <button
        onClick={handleResetDb}
        disabled={resetting}
        className="mt-10 mb-16 text-xs text-coral/60 hover:text-coral hover:underline disabled:opacity-50"
      >
        {resetting ? 'Resetting…' : 'Reset database'}
      </button>
    </div>
  )
}
