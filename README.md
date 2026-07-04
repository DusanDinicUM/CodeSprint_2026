# Tap For Good — CodeSprintMT 2026 Open Category

Contactless giving for charities: a public donation app (tap-to-pay simulation +
Mastercard-sandbox-simulated card payments) plus a staff admin tool for managing
campaigns, the live dashboard, the transaction ledger, reconciliation, and the
audit log.

Stack: **FastAPI (Python) backend + React (Vite/Tailwind) frontend**, SQLite by default.

## Quick start

**Backend**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
python3 seed.py          # creates demo users + sample campaigns/donations
uvicorn app.main:app --reload --port 8000
```
Demo logins (after seeding), password `Password123!`:
- `admin@codesprint.mt` — Charity Admin
- `manager@codesprint.mt` — Volunteer
- `viewer@codesprint.mt` — Auditor

**Frontend**
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173, proxies /api to :8000
```

- Donation app (public, no login): `/`
- Staff admin tool: `/staff/login`

## Where each judging criterion lives

| Criterion | Where |
|---|---|
| M1.1–M1.4 Donation flow | `frontend/src/pages/donate/`, `frontend/src/components/donate/`, `backend/app/routers/donations.py` |
| M1.5 Multi-currency | `backend/app/utils/currency.py`, currency column on `Transaction`, EUR fixed as `PRIMARY_CURRENCY` |
| M1.6 Graceful error handling | Pydantic validation on all schemas, `try/except` + `HTTPException` in routers, `DeclinedStep.jsx` for declined/offline/error states |
| M1.7 Accessibility | `AccessibilityContext.jsx` + `Settings.jsx` (text size, high-contrast), `index.css` |
| M2.1 RBAC | `security.py` (`require_role`), `AuthContext.jsx` (`hasRole`). Roles are Auditor (`viewer`) < Volunteer (`manager`) < Charity Admin (`admin`) internally; `frontend/src/utils/roles.js` maps to the booklet's display names |
| M2.2 Create/manage campaigns | `Campaign` model + `/campaigns` router + `Admin.jsx` |
| M2.3 Live dashboard | `/dashboard/stats` + `/dashboard/history` (windowed per-bucket donation activity: last hour/24h/30 days) + `/dashboard/ws` WebSocket, `Dashboard.jsx` |
| M2.4 Transaction ledger | `/transactions` with filter/sort params, `Ledger.jsx` |
| M2.5 CSV/PDF export | `utils/exports.py`, `/transactions/export/csv` and `/pdf` |
| M2.6 Reconciliation | `routers/reconciliation.py` + `Reconciliation.jsx` — matches simulated Mastercard sandbox records against local donations |
| M2.7 Audit log | `AuditLog` model, written on every mutating admin action, `/audit` + `Audit.jsx` |
| C2.1 Multilingual UI | `frontend/src/i18n/` (English + Malti) |
| C3.1 Real-time dashboard | Same WebSocket channel as M2.3 |
| Responsiveness | Tailwind responsive classes throughout (`grid-cols-2 md:grid-cols-4`, etc.) |
