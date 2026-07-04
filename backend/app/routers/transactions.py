"""
Transaction ledger: create + filter/sort (M2.4) + CSV/PDF export (M2.5).
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Transaction, TransactionStatus, Role
from ..schemas import TransactionCreate, TransactionOut
from ..security import get_current_user, require_role
from ..utils.currency import validate_currency
from ..utils.exports import transactions_to_csv, transactions_to_pdf

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionOut])
def list_transactions(
    status: Optional[TransactionStatus] = None,
    currency: Optional[str] = None,
    campaign_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    sort_by: str = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Transaction)
    if status:
        query = query.filter(Transaction.status == status)
    if currency:
        query = query.filter(Transaction.currency == currency)
    if campaign_id:
        query = query.filter(Transaction.campaign_id == campaign_id)
    if date_from:
        query = query.filter(Transaction.created_at >= date_from)
    if date_to:
        query = query.filter(Transaction.created_at <= date_to)
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    column = getattr(Transaction, sort_by, Transaction.created_at)
    query = query.order_by(column.desc() if order == "desc" else column.asc())
    return query.all()


@router.post("", response_model=TransactionOut)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db), _=Depends(require_role(Role.MANAGER))):
    try:
        validate_currency(payload.currency)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    tx = Transaction(**payload.model_dump(), status=TransactionStatus.PENDING)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db), _=Depends(get_current_user)):
    rows = db.query(Transaction).order_by(Transaction.created_at.desc()).all()
    buf = transactions_to_csv(rows)
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ledger.csv"},
    )


@router.get("/export/pdf")
def export_pdf(db: Session = Depends(get_db), _=Depends(get_current_user)):
    rows = db.query(Transaction).order_by(Transaction.created_at.desc()).all()
    buf = transactions_to_pdf(rows)
    return Response(
        content=buf.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ledger.pdf"},
    )
