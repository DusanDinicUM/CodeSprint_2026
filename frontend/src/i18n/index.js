/**
 * Minimal i18n (C2.1) - no external dependency needed. English-only for now;
 * swap for i18next if the task needs pluralization/interpolation or more
 * locales come back.
 */
import en from './locales/en.json'

const DICTS = { en }

export function useTranslations(locale) {
  const dict = DICTS[locale] || DICTS.en
  return (key) => dict[key] || DICTS.en[key] || key
}

export const AVAILABLE_LOCALES = Object.keys(DICTS)
