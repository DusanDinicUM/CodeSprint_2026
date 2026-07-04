"""
App entrypoint. Wires together routers, DB init, and CORS for the React
frontend running on a different port during development.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, users, campaigns, donations, transactions, dashboard, reconciliation, audit, reset

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tap For Good API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before final submission if time allows
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(campaigns.router)
app.include_router(donations.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(reconciliation.router)
app.include_router(audit.router)
app.include_router(reset.router)


@app.get("/health")
def health():
    return {"status": "ok"}
