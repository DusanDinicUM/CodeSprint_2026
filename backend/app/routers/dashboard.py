"""
Live dashboard (M2.3) with a WebSocket broadcast channel for real-time
updates (C3.1). REST endpoint gives the initial snapshot; the socket
pushes deltas whenever a transaction changes.
"""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Campaign, Transaction, TransactionStatus
from ..schemas import DashboardStats, CampaignProgress, HistoryBucket
from ..security import get_current_user, decode_token_to_user
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

    # One successful donation = one donor: named donors aren't deduplicated
    # by name (two people can share a name; anonymous ones have none), so
    # this matches campaign_progress()'s per-campaign donor_count for the
    # same reason - both just count successful donations.
    donor_count = len(successful)
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


# window key -> (how far back to look, width of one bucket, number of buckets)
HISTORY_WINDOWS = {
    "minute": (timedelta(hours=1), timedelta(minutes=1), 60),   # last hour, per minute
    "hour": (timedelta(days=1), timedelta(hours=1), 24),        # last day, per hour
    "day": (timedelta(days=30), timedelta(days=1), 30),         # last 30 days, per day
}


def compute_history(db: Session, window: str) -> list[HistoryBucket]:
    lookback, bucket_width, bucket_count = HISTORY_WINDOWS[window]
    start = datetime.utcnow() - lookback

    txs = (
        db.query(Transaction)
        .filter(Transaction.status.in_(SUCCESS_STATUSES))
        .filter(Transaction.created_at >= start)
        .all()
    )

    totals = [0.0] * bucket_count
    counts = [0] * bucket_count
    for t in txs:
        index = int((t.created_at - start) / bucket_width)
        if 0 <= index < bucket_count:
            totals[index] += to_eur(t.amount, t.currency)
            counts[index] += 1

    return [
        HistoryBucket(bucket_start=start + bucket_width * i, total_eur=round(totals[i], 2), count=counts[i])
        for i in range(bucket_count)
    ]


@router.get("/history", response_model=list[HistoryBucket])
def get_history(window: str = "hour", db: Session = Depends(get_db), _=Depends(get_current_user)):
    if window not in HISTORY_WINDOWS:
        raise HTTPException(status_code=422, detail=f"window must be one of {list(HISTORY_WINDOWS)}")
    return compute_history(db, window)


@router.websocket("/ws")
async def dashboard_ws(websocket: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
    """
    Frontend connects here for live pushes. Call `await manager.broadcast(...)`
    from any router after a transaction mutation to notify all connected dashboards.

    Mirrors the auth on GET /stats: this pushes the same financial data
    (amounts, donor names), so an unauthenticated socket would leak it
    despite the REST endpoint requiring a login. Browsers can't attach an
    Authorization header to a WebSocket handshake, so the JWT travels as a
    query param instead.
    """
    if decode_token_to_user(token, db) is None:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep-alive ping from client
    except WebSocketDisconnect:
        manager.disconnect(websocket)
