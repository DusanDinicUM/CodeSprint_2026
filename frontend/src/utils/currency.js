/**
 * Mirrors backend/app/config.py SUPPORTED_CURRENCIES and
 * backend/app/utils/currency.py SYMBOLS - single frontend source of truth
 * so the amount picker and confirmation receipt can't drift apart.
 */
export const CURRENCIES = ['EUR', 'USD', 'GBP']

export const CURRENCY_SYMBOLS = { EUR: '€', USD: '$', GBP: '£' }

export function currencySymbol(currency) {
  return CURRENCY_SYMBOLS[currency] || `${currency} `
}
