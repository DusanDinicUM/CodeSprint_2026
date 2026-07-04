import { useAccessibility } from '../context/AccessibilityContext'

/**
 * Accessibility controls (M1.7): text size + high-contrast colour scheme.
 * Reachable both publicly (/settings, from the donation app) and by staff
 * (/staff/settings) - the shared Navbar handles navigation for both.
 */
export default function Settings({ locale, setLocale }) {
  const { fontScale, setFontScale, highContrast, setHighContrast } = useAccessibility()

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="font-display text-2xl mb-6">Settings</h1>

      <div className="ledger-tape p-5 mb-4">
        <p className="font-medium mb-2">Text size</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setFontScale(Math.max(0.85, fontScale - 0.1))} className="border border-line rounded-md px-3 py-1.5" aria-label="Decrease text size">A-</button>
          <span className="tabular text-sm">{Math.round(fontScale * 100)}%</span>
          <button onClick={() => setFontScale(Math.min(1.5, fontScale + 0.1))} className="border border-line rounded-md px-3 py-1.5" aria-label="Increase text size">A+</button>
        </div>
      </div>

      <div className="ledger-tape p-5 mb-4 flex items-center justify-between">
        <p className="font-medium">High-contrast mode</p>
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${highContrast ? 'bg-ink text-paper' : 'border border-line'}`}
        >
          {highContrast ? 'On' : 'Off'}
        </button>
      </div>

      <div className="ledger-tape p-5 flex items-center justify-between">
        <p className="font-medium">Language</p>
        <select value={locale} onChange={(e) => setLocale(e.target.value)} className="border border-line rounded-md px-3 py-2">
          <option value="en">English</option>
          <option value="mt">Malti</option>
        </select>
      </div>
    </div>
  )
}
