"""Admin-only user management, gated behind RBAC (M2.1)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Role, AuditLog
from ..schemas import UserCreate, UserOut
from ..security import require_role, hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_role(Role.ADMIN))):
    return db.query(User).all()


@router.post("", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db), current=Depends(require_role(Role.ADMIN))):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.add(AuditLog(user_id=current.id, action="user.create", target_type="user", details=payload.email))
    db.commit()
    db.refresh(user)
    return user
