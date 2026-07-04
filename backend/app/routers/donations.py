"""
Public donation flow (M1.3, M1.4, M1.6): no login required - this is the
donor-facing "tap for good" terminal, not the admin tool. Card-details
payments are validated against the Mastercard sandbox simulation
(utils/mastercard.py); tap-to-pay is simulated as always succeeding, per
the booklet's note that the sandbox doesn't support tap-to-pay for donations.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Campaign, Transaction, TransactionStatus, PaymentMethod
from ..schemas import DonationCreate, TransactionOut
from ..utils.currency import validate_currency
from ..utils.mastercard import charge_card, CardDeclinedError
from .dashboard import manager, compute_stats

router = APIRouter(prefix="/donations", tags=["donations"])


def _gen_reference() -> str:
    return f"DON-{uuid.uuid4().hex[:8].upper()}"


@router.post("", response_model=TransactionOut)
async def create_donation(payload: DonationCreate, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == payload.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if not campaign.is_active:
        raise HTTPException(status_code=400, detail="This campaign is not currently accepting donations")

    try:
        validate_currency(payload.currency)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    tx = Transaction(
        reference=_gen_reference(),
        amount=payload.amount,
        currency=payload.currency,
        payment_method=payload.payment_method,
        payer_name=payload.payer_name,
        is_anonymous=payload.is_anonymous,
        is_recurring=payload.is_recurring,
        gift_aid=payload.gift_aid,
        campaign_id=campaign.id,
        status=TransactionStatus.PENDING,
    )

    if payload.payment_method == PaymentMethod.CARD:
        if not payload.card:
            raise HTTPException(status_code=422, detail="Card details are required for card payments")
        try:
            result = charge_card(
                card_number=payload.card.card_number,
                expiry_month=payload.card.expiry_month,
                expiry_year=payload.card.expiry_year,
                cvv=payload.card.cvv,
                amount=payload.amount,
                currency=payload.currency,
            )
            tx.status = TransactionStatus.COMPLETED
            tx.external_id = result["external_id"]
        except CardDeclinedError as e:
            tx.status = TransactionStatus.FAILED
            tx.failure_reason = e.reason
    else:
        # Simulated tap-to-pay: always succeeds (sandbox has no tap support).
        tx.status = TransactionStatus.COMPLETED

    db.add(tx)
    db.commit()
    db.refresh(tx)

    if tx.status == TransactionStatus.COMPLETED:
        await manager.broadcast({"type": "donation", "stats": compute_stats(db).model_dump()})

    if tx.status == TransactionStatus.FAILED:
        raise HTTPException(status_code=402, detail={"reference": tx.reference, "reason": tx.failure_reason})

    return tx
