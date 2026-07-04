"""
Demo-data wipe - lets anyone reset campaigns/donations/audit history from the
landing page without shelling into the server. Deliberately unauthenticated
per the task brief (a public button); this is a hackathon/demo convenience,
not something that should ship as-is in a real deployment.

Users are intentionally left alone: wiping them would lock everyone out of
staff login until someone re-ran seed.py by hand, which defeats the point of
a self-serve reset button.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Campaign, Transaction, AuditLog

router = APIRouter(tags=["reset"])


@router.post("/reset-db")
def reset_database(db: Session = Depends(get_db)):
    # Children before parents so the Transaction -> Campaign FK never trips
    # mid-wipe. AuditLog also references User, but we're only deleting the
    # logs here, not the users, so no ordering concern there.
    db.query(AuditLog).delete()
    db.query(Transaction).delete()
    db.query(Campaign).delete()
    db.commit()
    return {"status": "ok"}
