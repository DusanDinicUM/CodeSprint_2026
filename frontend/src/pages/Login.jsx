import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslations } from '../i18n'

export default function Login({ locale }) {
  const [email, setEmail] = useState('admin@codesprint.mt')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const t = useTranslations(locale)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/staff/dashboard')
    } catch (err) {
      setError('Incorrect email or password. Check the seed data or your credentials.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="ledger-tape p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-display text-2xl mb-6">{t('login.title')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">{t('login.email')}</label>
            <input
              id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 focus-visible:outline-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">{t('login.password')}</label>
            <input
              id="password" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 focus-visible:outline-gold"
            />
          </div>
          {error && <p className="text-coral text-sm" role="alert">{error}</p>}
          <button type="submit" className="w-full bg-ink text-paper rounded-md py-2 font-medium hover:opacity-90">
            {t('login.submit')}
          </button>
        </form>
        <p className="text-xs text-ink/50 mt-6">
          Demo accounts (after running seed.py): admin@codesprint.mt / manager@codesprint.mt / viewer@codesprint.mt — Password123!
        </p>
      </div>
    </div>
  )
}
