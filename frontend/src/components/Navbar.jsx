import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslations } from '../i18n'
import { ROLE_LABELS } from '../utils/roles'

const linkClass = (signedIn) => ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? signedIn ? 'bg-paper text-ink' : 'bg-ink text-paper'
      : signedIn ? 'text-paper/70 hover:bg-paper/10' : 'text-ink/70 hover:bg-ink/5'
  }`

/**
 * Single header for the whole app - same shell for donors and staff, but the
 * theme flips dark/light on login so "am I signed in?" is answerable at a
 * glance rather than by reading text (M2.1 clarity, not just RBAC).
 */
export default function Navbar({ locale }) {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const t = useTranslations(locale)
  const link = linkClass(!!user)

  return (
    <header
      className={`sticky top-0 z-10 backdrop-blur border-b transition-colors ${
        user ? 'bg-ink/95 border-ink/80 text-paper' : 'bg-paper/95 border-line text-ink'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={user ? '/staff/dashboard' : '/'} className="font-display text-xl tracking-tight">
          ⚡ {t('app.name')}
        </Link>
        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <NavLink to="/staff/dashboard" className={link}>{t('nav.dashboard')}</NavLink>
              <NavLink to="/staff/ledger" className={link}>{t('nav.ledger')}</NavLink>
              {hasRole('manager') && <NavLink to="/staff/campaigns" className={link}>{t('nav.admin')}</NavLink>}
              <NavLink to="/staff/reconciliation" className={link}>Reconciliation</NavLink>
              {hasRole('admin') && <NavLink to="/staff/audit" className={link}>Audit log</NavLink>}
              <NavLink to="/staff/settings" className={link}>{t('nav.settings')}</NavLink>
              <NavLink to="/donate" className={link}>Donation app</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/settings" className={link}>{t('nav.settings')}</NavLink>
              <NavLink to="/staff/login" className={link}>Charity staff login</NavLink>
            </>
          )}
        </nav>
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-sm bg-paper/10 border border-paper/15 rounded-full pl-2 pr-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden="true" />
              {user.full_name} <span className="text-paper/50">· {ROLE_LABELS[user.role]}</span>
            </span>
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
