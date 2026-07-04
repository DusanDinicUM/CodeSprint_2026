from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AuditLog, Role
from ..schemas import AuditLogOut
from ..security import require_role

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("", response_model=list[AuditLogOut])
def list_audit_logs(db: Session = Depends(get_db), _=Depends(require_role(Role.ADMIN))):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
