"""
Mastercard Donate sandbox simulation (M1.3, M2.6).

The competition booklet explicitly says the sandbox doesn't support tap-to-pay
for donations, and only requires an endpoint call to be *simulated* rather
than actually made. This module stands in for that call: it validates the
card fields locally (Luhn check + expiry) and returns the same response
shape a real Mastercard Donate `POST /donations` call would, including a
sandbox-style `external_id` that the reconciliation view later matches
against.

Swap `charge_card()` for a real `httpx` call to the Donate API once sandbox
credentials are available - callers never need to change.
"""
import random
import uuid
from datetime import datetime


class CardDeclinedError(Exception):
    def __init__(self, reason: str):
        self.reason = reason
        super().__init__(reason)


def _luhn_valid(card_number: str) -> bool:
    digits = [int(d) for d in card_number if d.isdigit()]
    if len(digits) < 12:
        return False
    checksum = 0
    for i, digit in enumerate(reversed(digits)):
        if i % 2 == 1:
            digit *= 2
            if digit > 9:
                digit -= 9
        checksum += digit
    return checksum % 10 == 0


def charge_card(card_number: str, expiry_month: int, expiry_year: int, cvv: str, amount: float, currency: str) -> dict:
    """
    Simulates a Mastercard Donate sandbox charge. Raises CardDeclinedError
    for invalid/expired/failing cards; otherwise returns a sandbox-shaped
    success payload with an external transaction id for reconciliation.
    """
    now = datetime.utcnow()
    if not _luhn_valid(card_number):
        raise CardDeclinedError("invalid_card_number")
    if (expiry_year, expiry_month) < (now.year, now.month):
        raise CardDeclinedError("expired_card")
    if len(cvv) not in (3, 4):
        raise CardDeclinedError("invalid_cvv")

    # Deterministic-ish "decline" for demoing graceful failure handling (M1.6):
    # sandbox test cards ending in 0000 always decline.
    if card_number.replace(" ", "").endswith("0000"):
        raise CardDeclinedError("declined_by_issuer")

    return {
        "external_id": f"mc-sandbox-{uuid.uuid4().hex[:12]}",
        "status": "approved",
        "amount": round(amount, 2),
        "currency": currency,
        "processed_at": now.isoformat(),
        "auth_code": f"{random.randint(100000, 999999)}",
    }
