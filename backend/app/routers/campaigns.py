"""
Create/Edit/Delete for fundraising campaigns (M2.2).
Public GET is unauthenticated so the donation app can list active campaigns
without a login; mutations require Volunteer (manager) / Admin roles.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Campaign, Transaction, Role, AuditLog
from ..schemas import CampaignCreate, CampaignUpdate, CampaignOut
from ..security import require_role
from .dashboard import campaign_progress, SUCCESS_STATUSES

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


def _successful_transactions(db: Session) -> list[Transaction]:
    return db.query(Transaction).filter(Transaction.status.in_(SUCCESS_STATUSES)).all()


def _with_progress(campaign: Campaign, successful: list[Transaction]) -> CampaignOut:
    progress = campaign_progress(campaign, successful)
    out = CampaignOut.model_validate(campaign)
    out.raised_amount_eur = progress.raised_amount_eur
    out.donor_count = progress.donor_count
    out.progress_pct = progress.progress_pct
    return out


@router.get("", response_model=list[CampaignOut])
def list_campaigns(db: Session = Depends(get_db)):
    """Public: the donation app needs this without a login."""
    campaigns = db.query(Campaign).order_by(Campaign.created_at.desc()).all()
    successful = _successful_transactions(db)  # fetched once, not once per campaign
    return [_with_progress(c, successful) for c in campaigns]


@router.get("/{campaign_id}", response_model=CampaignOut)
def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    """Public: the donation terminal loads a single campaign by id."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return _with_progress(campaign, _successful_transactions(db))


@router.post("", response_model=CampaignOut)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db), current=Depends(require_role(Role.MANAGER))):
    campaign = Campaign(**payload.model_dump())
    db.add(campaign)
    db.flush()  # assigns campaign.id (a Python-side default) before the audit log below references it
    db.add(AuditLog(user_id=current.id, action="campaign.create", target_type="campaign", target_id=campaign.id, details=campaign.name))
    db.commit()
    db.refresh(campaign)
    return _with_progress(campaign, _successful_transactions(db))


@router.put("/{campaign_id}", response_model=CampaignOut)
def update_campaign(campaign_id: str, payload: CampaignUpdate, db: Session = Depends(get_db), current=Depends(require_role(Role.MANAGER))):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(campaign, field, value)

    db.add(AuditLog(user_id=current.id, action="campaign.update", target_type="campaign", target_id=campaign.id))
    db.commit()
    db.refresh(campaign)
    return _with_progress(campaign, _successful_transactions(db))


@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: str, db: Session = Depends(get_db), current=Depends(require_role(Role.ADMIN))):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    db.delete(campaign)
    db.add(AuditLog(user_id=current.id, action="campaign.delete", target_type="campaign", target_id=campaign_id))
    db.commit()
    return {"ok": True}
