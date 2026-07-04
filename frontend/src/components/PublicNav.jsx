import { Link } from 'react-router-dom'
import { useTranslations } from '../i18n'

/**
 * Header for the public donation app (M1) - shared by the campaign picker
 * and the public settings page so navigation stays consistent wherever a
 * donor lands without a staff session.
 */
export default function PublicNav({ locale }) {
  const t = useTranslations(locale)

  return (
    <div className="flex items-center justify-between mb-8">
      <Link to="/" className="font-display text-3xl">⚡ {t('app.name')}</Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link to="/settings" className="text-ink/50 hover:underline">{t('nav.settings')}</Link>
        <Link to="/staff/login" className="text-ink/50 hover:underline">Charity staff login</Link>
      </nav>
    </div>
  )
}
