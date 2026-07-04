import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslations } from '../i18n'
import { ROLE_LABELS } from '../utils/roles'

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-ink/5'
  }`

/**
 * Single header for the whole app - same shell for donors and staff so the
 * site doesn't feel like two different products depending on login state.
 * Staff-only links only render once a session exists.
 */
export default function Navbar({ locale }) {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const t = useTranslations(locale)

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-tight">
          ⚡ {t('app.name')}{user && <span className="text-ink/40 font-body text-sm font-normal"> staff</span>}
        </Link>
        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <NavLink to="/staff/dashboard" className={linkClass}>{t('nav.dashboard')}</NavLink>
              <NavLink to="/staff/ledger" className={linkClass}>{t('nav.ledger')}</NavLink>
              {hasRole('manager') && <NavLink to="/staff/campaigns" className={linkClass}>{t('nav.admin')}</NavLink>}
              <NavLink to="/staff/reconciliation" className={linkClass}>Reconciliation</NavLink>
              {hasRole('admin') && <NavLink to="/staff/audit" className={linkClass}>Audit log</NavLink>}
              <NavLink to="/staff/settings" className={linkClass}>{t('nav.settings')}</NavLink>
              <NavLink to="/?preview=1" className={linkClass}>Donation app</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/settings" className={linkClass}>{t('nav.settings')}</NavLink>
              <NavLink to="/staff/login" className={linkClass}>Charity staff login</NavLink>
            </>
          )}
        </nav>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink/60 hidden sm:inline">{user?.full_name} <span className="text-ink/40">· {ROLE_LABELS[user?.role]}</span></span>
            <button
              onClick={() => { logout(); navigate('/staff/login') }}
              className="text-sm font-medium text-coral hover:underline"
            >
              {t('nav.logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
