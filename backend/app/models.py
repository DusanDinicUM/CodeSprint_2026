"""
ORM models for Tap For Good - contactless giving for charities.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, DateTime, Boolean, ForeignKey, Enum, Text
)
from sqlalchemy.orm import relationship

from .database import Base


def gen_id() -> str:
    return str(uuid.uuid4())


class Role(str, enum.Enum):
    ADMIN = "admin"       # Charity Admin
    MANAGER = "manager"   # Volunteer
    VIEWER = "viewer"     # Auditor


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(Role), default=Role.VIEWER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    audit_entries = relationship("AuditLog", back_populates="user")


class Campaign(Base):
    """A fundraising campaign for a charity (M2.2)."""
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    charity_name = Column(String, nullable=False, default="")
    description = Column(Text, nullable=True)
    logo_emoji = Column(String, nullable=True)  # simple stand-in for uploaded branding art
    goal_amount = Column(Float, nullable=False, default=0.0)
    suggested_amounts = Column(String, nullable=False, default="5,10,25")  # comma-separated EUR amounts
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    RECONCILED = "reconciled"


class PaymentMethod(str, enum.Enum):
    TAP = "tap"    # simulated tap-to-pay
    CARD = "card"  # manually entered card details, validated against Mastercard sandbox


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=gen_id)
    reference = Column(String, unique=True, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default="EUR")
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.TAP)
    external_id = Column(String, nullable=True, index=True)  # id from external API, for reconciliation (M2.6)
    payer_name = Column(String, nullable=True)
    is_anonymous = Column(Boolean, default=False)  # donor recognition (C1.3)
    is_recurring = Column(Boolean, default=False)  # round-up / recurring prototype (S1.1)
    gift_aid = Column(Boolean, default=False)       # tax-deductibility declaration (S1.2)
    failure_reason = Column(String, nullable=True)  # declined / cancelled / offline (M1.6)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=True)

    campaign = relationship("Campaign")

    @property
    def donor_display_name(self) -> str:
        """Single source of truth for donor recognition (C1.3) - CSV/PDF
        exports and the ledger UI all read this instead of re-checking
        is_anonymous themselves, so the privacy rule can't drift."""
        return "Anonymous" if self.is_anonymous else (self.payer_name or "")


class AuditLog(Base):
    """Every admin action gets logged here (M2.7)."""
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)       # e.g. "campaign.create", "campaign.delete"
    target_type = Column(String, nullable=True)   # e.g. "campaign"
    target_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_entries")
