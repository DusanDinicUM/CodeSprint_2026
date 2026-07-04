# CodeSprintMT 2026 — Open Category Starter

Stack: **FastAPI (Python) backend + React (Vite/Tailwind) frontend**, SQLite by default.


## Quick start

**Backend**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
python3 seed.py          # creates demo users + sample transactions
uvicorn app.main:app --reload --port 8000
```
Demo logins (after seeding): `admin@codesprint.mt` / `manager@codesprint.mt` /
`viewer@codesprint.mt`, password `Password123!`.

**Frontend**
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173, proxies /api to :8000
```

## Where each judging criterion lives

| Criterion | Where |
|---|---|
| M1.5 Multi-currency | `backend/app/utils/currency.py`, currency column on `Transaction`, EUR fixed as `PRIMARY_CURRENCY` |
| M1.6 Graceful error handling | Pydantic validation on all schemas, `try/except` + `HTTPException` in routers, inline form errors in `Login.jsx` |
| M1.7 Accessibility | `AccessibilityContext.jsx` + `Settings.jsx` (text size, high-contrast), `index.css` |
| M2.1 RBAC | `security.py` (`require_role`), `AuthContext.jsx` (`hasRole`) |
| M2.2 Create/manage entity | `Item` model + `/items` router + `Admin.jsx` — **rename `Item` to the real entity** |
| M2.3 Live dashboard | `/dashboard/stats` + `/dashboard/ws` WebSocket, `Dashboard.jsx` |
| M2.4 Transaction ledger | `/transactions` with filter/sort params, `Ledger.jsx` |
| M2.5 CSV/PDF export | `utils/exports.py`, `/transactions/export/csv` and `/pdf` |
| M2.6 Reconciliation | `routers/reconciliation.py` — wire `fetch_external_records()` to the real Mastercard sandbox call |
| M2.7 Audit log | `AuditLog` model, written on every mutating admin action, `/audit` |
| C2.1 Multilingual UI | `frontend/src/i18n/` (English + Malti) |
| C3.1 Real-time dashboard | Same WebSocket channel as M2.3 |
| Responsiveness | Tailwind responsive classes throughout (`grid-cols-2 md:grid-cols-4`, etc.) |
