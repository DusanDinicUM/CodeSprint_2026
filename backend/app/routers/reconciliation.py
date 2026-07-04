"""
Reconciliation view (M2.6): match local transaction records against
records fetched from an external API (e.g. Mastercard Donate sandbox).

`fetch_external_records()` simulates the sandbox's own view of card-details
donations (only those go through Mastercard - tap payments never get an
external_id). Swap it for a real Mastercard Donate API call once sandbox
credentials are available; the matching logic below doesn't need to change
since it only cares about the (external_id, amount) shape.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Transaction, PaymentMethod, TransactionStatus
from ..security import get_current_user

router = APIRouter(prefix="/reconciliation", tags=["reconciliation"])


def fetch_external_records(db: Session) -> list[dict]:
    """
    Stand-in for `GET /donations` on the Mastercard Donate sandbox.
    Replace with a real HTTP call, e.g.:
        resp = httpx.get(f"{MASTERCARD_BASE_URL}/donations", headers=auth_headers)
        return resp.json()["donations"]
    """
    card_txs = (
        db.query(Transaction)
        .filter(Transaction.payment_method == PaymentMethod.CARD)
        .filter(Transaction.status == TransactionStatus.COMPLETED)
        .filter(Transaction.external_id.isnot(None))
        .all()
    )
    return [{"external_id": t.external_id, "amount": t.amount} for t in card_txs]


@router.get("")
def reconciliation_view(db: Session = Depends(get_db), _=Depends(get_current_user)):
    local = db.query(Transaction).all()
    external = fetch_external_records(db)
    external_by_id = {r["external_id"]: r for r in external}

    matched, unmatched_local, unmatched_external = [], [], []

    for tx in local:
        if tx.external_id and tx.external_id in external_by_id:
            ext = external_by_id.pop(tx.external_id)
            is_match = round(tx.amount, 2) == round(ext.get("amount", -1), 2)
            matched.append({
                "transaction_id": tx.id,
                "reference": tx.reference,
                "local_amount": tx.amount,
                "external_amount": ext.get("amount"),
                "match": is_match,
            })
        else:
            unmatched_local.append({"transaction_id": tx.id, "reference": tx.reference, "amount": tx.amount})

    unmatched_external = list(external_by_id.values())

    return {
        "matched": matched,
        "unmatched_local": unmatched_local,
        "unmatched_external": unmatched_external,
    }
