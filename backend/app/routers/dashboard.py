"""
Live dashboard (M2.3) with a WebSocket broadcast channel for real-time
updates (C3.1). REST endpoint gives the initial snapshot; the socket
pushes deltas whenever a transaction changes.
"""
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Campaign, Transaction, TransactionStatus
from ..schemas import DashboardStats, CampaignProgress
from ..security import get_current_user
from ..utils.currency import to_eur

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, message: dict):
        for ws in list(self.active):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(ws)


manager = ConnectionManager()


SUCCESS_STATUSES = (TransactionStatus.COMPLETED, TransactionStatus.RECONCILED)


def campaign_progress(campaign: Campaign, successful_txs: list[Transaction]) -> CampaignProgress:
    """Shared by the dashboard and the (public) campaigns list, so donors and
    admins see the same raised/progress figures computed one way."""
    campaign_txs = [t for t in successful_txs if t.campaign_id == campaign.id]
    raised = sum(to_eur(t.amount, t.currency) for t in campaign_txs)
    return CampaignProgress(
        campaign_id=campaign.id,
        name=campaign.name,
        goal_amount=campaign.goal_amount,
        raised_amount_eur=round(raised, 2),
        donor_count=len(campaign_txs),
        progress_pct=round(min(raised / campaign.goal_amount, 1.0) * 100, 1) if campaign.goal_amount else 0.0,
    )


def compute_stats(db: Session) -> DashboardStats:
    txs = db.query(Transaction).all()
    successful = [t for t in txs if t.status in SUCCESS_STATUSES]
    total_eur = sum(to_eur(t.amount, t.currency) for t in successful)
    count = lambda s: sum(1 for t in txs if t.status == s)

    donor_names = {t.payer_name for t in successful if t.payer_name}
    donor_count = len(donor_names) or len(successful)
    average = round(total_eur / len(successful), 2) if successful else 0.0

    campaigns = [campaign_progress(c, successful) for c in db.query(Campaign).all()]

    return DashboardStats(
        total_transactions=len(txs),
        total_amount_eur=round(total_eur, 2),
        donor_count=donor_count,
        average_donation_eur=average,
        completed=count(TransactionStatus.COMPLETED),
        pending=count(TransactionStatus.PENDING),
        failed=count(TransactionStatus.FAILED),
        reconciled=count(TransactionStatus.RECONCILED),
        campaigns=campaigns,
    )


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return compute_stats(db)


@router.websocket("/ws")
async def dashboard_ws(websocket: WebSocket):
    """
    Frontend connects here for live pushes. Call `await manager.broadcast(...)`
    from any router after a transaction mutation to notify all connected dashboards.
    """
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep-alive ping from client
    except WebSocketDisconnect:
        manager.disconnect(websocket)
