import { createContext, useContext, useEffect, useState } from 'react'

const AccessibilityContext = createContext(null)

/**
 * Text-size + high-contrast controls (M1.7). Persists to localStorage so
 * a judge's preference sticks across the demo without extra setup.
 */
export function AccessibilityProvider({ children }) {
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem('fontScale')) || 1)
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true')

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale)
    localStorage.setItem('fontScale', String(fontScale))
  }, [fontScale])

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal')
    localStorage.setItem('highContrast', String(highContrast))
  }, [highContrast])

  return (
    <AccessibilityContext.Provider value={{ fontScale, setFontScale, highContrast, setHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = () => useContext(AccessibilityContext)
