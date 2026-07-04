/**
 * Minimal i18n (C2.1) - no external dependency needed for a two-language
 * demo. Swap for i18next if the task needs pluralization/interpolation.
 */
import en from './locales/en.json'
import mt from './locales/mt.json'

const DICTS = { en, mt }

export function useTranslations(locale) {
  const dict = DICTS[locale] || DICTS.en
  return (key) => dict[key] || DICTS.en[key] || key
}

export const AVAILABLE_LOCALES = Object.keys(DICTS)
