import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslations } from '../i18n'

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-ink/5'
  }`

export default function Navbar({ locale }) {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const t = useTranslations(locale)

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="font-display text-xl tracking-tight">⚡ Tap For Good <span className="text-ink/40 font-body text-sm font-normal">staff</span></span>
        <nav className="flex items-center gap-1">
          <NavLink to="/staff/dashboard" className={linkClass}>{t('nav.dashboard')}</NavLink>
          <NavLink to="/staff/ledger" className={linkClass}>{t('nav.ledger')}</NavLink>
          {hasRole('manager') && <NavLink to="/staff/campaigns" className={linkClass}>{t('nav.admin')}</NavLink>}
          <NavLink to="/staff/settings" className={linkClass}>{t('nav.settings')}</NavLink>
          <NavLink to="/" className={linkClass}>Donation app</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink/60 hidden sm:inline">{user?.full_name}</span>
          <button
            onClick={() => { logout(); navigate('/staff/login') }}
            className="text-sm font-medium text-coral hover:underline"
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
