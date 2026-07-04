"""
Multi-currency helpers. EUR is always the primary/base currency.
Rates below are illustrative fixed rates for offline demo purposes only -
swap in a live FX API call if you have connectivity on competition day.
"""
from ..config import SUPPORTED_CURRENCIES, PRIMARY_CURRENCY

FIXED_RATES_TO_EUR = {
    "EUR": 1.0,
    "USD": 0.92,
    "GBP": 1.17,
}

SYMBOLS = {"EUR": "€", "USD": "$", "GBP": "£"}


def to_eur(amount: float, currency: str) -> float:
    if currency not in FIXED_RATES_TO_EUR:
        raise ValueError(f"Unsupported currency: {currency}")
    return round(amount * FIXED_RATES_TO_EUR[currency], 2)


def format_amount(amount: float, currency: str) -> str:
    symbol = SYMBOLS.get(currency, currency + " ")
    return f"{symbol}{amount:,.2f}"


def validate_currency(currency: str) -> None:
    if currency not in SUPPORTED_CURRENCIES:
        raise ValueError(
            f"Currency '{currency}' not supported. Supported: {SUPPORTED_CURRENCIES}"
        )
