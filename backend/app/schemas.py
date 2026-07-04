"""
Pydantic schemas: the boundary between the DB layer and the API layer (Code
Quality: "Separation between presentation and logic layers").
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from .models import Role, TransactionStatus, PaymentMethod


# ---- Auth ----
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str
    role: Role = Role.VIEWER


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: Role
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---- Campaigns ----
class CampaignCreate(BaseModel):
    name: str
    charity_name: str = ""
    description: Optional[str] = None
    logo_emoji: Optional[str] = None
    goal_amount: float = 0.0
    suggested_amounts: str = "5,10,25"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    charity_name: Optional[str] = None
    description: Optional[str] = None
    logo_emoji: Optional[str] = None
    goal_amount: Optional[float] = None
    suggested_amounts: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class CampaignOut(BaseModel):
    id: str
    name: str
    charity_name: str
    description: Optional[str]
    logo_emoji: Optional[str]
    goal_amount: float
    suggested_amounts: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    # Computed, public-safe progress figures (populated by the campaigns router)
    raised_amount_eur: float = 0.0
    donor_count: int = 0
    progress_pct: float = 0.0

    class Config:
        from_attributes = True


# ---- Donations / Transactions ----
class CardDetails(BaseModel):
    """Manually-entered card details, validated against the Mastercard sandbox (M1.3)."""
    card_number: str = Field(min_length=12, max_length=19)
    expiry_month: int = Field(ge=1, le=12)
    expiry_year: int = Field(ge=2024, le=2100)
    cvv: str = Field(min_length=3, max_length=4)
    cardholder_name: str


class DonationCreate(BaseModel):
    campaign_id: str
    amount: float = Field(gt=0)
    currency: str = "EUR"
    payment_method: PaymentMethod = PaymentMethod.TAP
    card: Optional[CardDetails] = None
    payer_name: Optional[str] = None
    is_anonymous: bool = True
    is_recurring: bool = False
    gift_aid: bool = False
    receipt_email: Optional[EmailStr] = None
    receipt_phone: Optional[str] = None


class TransactionCreate(BaseModel):
    reference: str
    amount: float = Field(gt=0)
    currency: str = "EUR"
    payer_name: Optional[str] = None
    campaign_id: Optional[str] = None
    external_id: Optional[str] = None


class RecentDonationOut(BaseModel):
    """Public scoreboard feed (M1.1) - deliberately excludes everything
    except what's safe to show a stranger on the donation front page."""
    amount: float
    currency: str
    donor_display_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionOut(BaseModel):
    id: str
    reference: str
    amount: float
    currency: str
    status: TransactionStatus
    payment_method: PaymentMethod
    external_id: Optional[str]
    payer_name: Optional[str]
    donor_display_name: str
    is_anonymous: bool
    is_recurring: bool
    gift_aid: bool
    failure_reason: Optional[str]
    created_at: datetime
    campaign_id: Optional[str]

    class Config:
        from_attributes = True


# ---- Audit ----
class AuditLogOut(BaseModel):
    id: str
    user_id: str
    action: str
    target_type: Optional[str]
    target_id: Optional[str]
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Dashboard ----
class CampaignProgress(BaseModel):
    campaign_id: str
    name: str
    goal_amount: float
    raised_amount_eur: float
    donor_count: int
    progress_pct: float


class DashboardStats(BaseModel):
    total_transactions: int
    total_amount_eur: float
    donor_count: int
    average_donation_eur: float
    completed: int
    pending: int
    failed: int
    reconciled: int
    campaigns: list[CampaignProgress] = []


class HistoryBucket(BaseModel):
    """One point in a windowed activity chart - the amount donated *within
    this bucket*, not a running cumulative total (a small recent donation
    would be invisible plotted against an all-time total once that total
    gets large)."""
    bucket_start: datetime
    total_eur: float
    count: int
