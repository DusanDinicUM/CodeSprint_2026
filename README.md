# Tap For Good — CodeSprintMT 2026 Open Category

Contactless giving for charities: a public donation app (tap-to-pay simulation +
Mastercard-sandbox-simulated card payments) plus a staff admin tool for managing
campaigns, the live dashboard, the transaction ledger, reconciliation, and the
audit log. A landing page lets a visitor choose whether they're donating
or signing in as staff before routing them into the right experience.

Stack: **FastAPI (Python) backend + React (Vite/Tailwind) frontend**, SQLite by default.

## Quick start

**Backend**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 seed.py
uvicorn app.main:app --reload --port 8000
```
`seed.py` creates demo users + sample campaigns/donations

> **Windows note:** if `python`/`python3` doesn't work, use `py`  instead,
> e.g. `py -3.14 -m venv venv`, `.\venv\Scripts\activate`, and
> `py -3.14 -m uvicorn app.main:app --reload --port 8000`.

Demo logins (after seeding), password `Password123!`:
- `admin@codesprint.mt` — Charity Admin
- `manager@codesprint.mt` — Volunteer
- `auditor@codesprint.mt` — Auditor

**Frontend**
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173, proxies /api to :8000
```

- Root gateway (public, no login): `/` — choose "Make a donation" or "Charity staff"
- Donation app (public, no login): `/donate`
- Staff admin tool: `/staff/login`

**Resetting demo data**: the landing page (`/`) has a "Reset database" link at
the bottom. It calls `POST /reset-db`, which permanently wipes all campaigns,
donations, and audit log entries — staff logins are deliberately left intact,
so resetting never locks you out. There's a confirm dialog first since it
can't be undone. The endpoint is intentionally unauthenticated (a self-serve
demo-reset button); it isn't something that should ship as-is in a real
deployment.

| Criterion | Location |
|---|---|
| M1.1–M1.4 Donation flow | `frontend/src/pages/donate/` (`/donate`, `/donate/:campaignId`), `frontend/src/components/donate/`, `backend/app/routers/donations.py` |
| M1.5 Multi-currency | `backend/app/utils/currency.py`, currency column on `Transaction`, EUR fixed as `PRIMARY_CURRENCY` |
| M1.6 Graceful error handling | Pydantic validation on all schemas, `try/except` + `HTTPException` in routers, `DeclinedStep.jsx` for declined/offline/error states |
| M1.7 Accessibility | `AccessibilityContext.jsx` + `Settings.jsx` (text size, high-contrast). High-contrast works by flipping a handful of CSS custom properties in `index.css` that the entire Tailwind palette (`tailwind.config.js`) resolves through, so every themed color inverts app-wide instead of needing per-component overrides |
| M2.1 RBAC | `security.py` (`require_role`), `AuthContext.jsx` (`hasRole`). Roles are Auditor (`auditor`) < Volunteer (`manager`) < Charity Admin (`admin`) internally; `frontend/src/utils/roles.js` maps to the booklet's display names |
| M2.2 Create/manage campaigns | `Campaign` model + `/campaigns` router + `Admin.jsx` |
| M2.3 Live dashboard | `/dashboard/stats` + `/dashboard/history` (windowed per-bucket donation activity: last hour/24h/30 days) + `/dashboard/ws` WebSocket, `Dashboard.jsx` |
| M2.4 Transaction ledger | `/transactions` with filter/sort params, `Ledger.jsx` |
| M2.5 CSV/PDF export | `utils/exports.py`, `/transactions/export/csv` and `/pdf` |
| M2.6 Reconciliation | `routers/reconciliation.py` + `Reconciliation.jsx` — matches simulated Mastercard sandbox records against local donations |
| M2.7 Audit log | `AuditLog` model, written on every mutating admin action, `/audit` + `Audit.jsx` |
| C3.1 Real-time dashboard | Same WebSocket channel as M2.3 |
| Responsiveness | Tailwind responsive classes throughout (`grid-cols-2 md:grid-cols-4`, etc.) |


## Other notable features

- **Root gateway** (`Landing.jsx`, `/`) — asks "donor or staff?" before
  routing, so neither audience has to go through the other's UI. Also
  surfaces the recent-donations feed and the database-reset control.
- **Recent donations feed** (`RecentDonations.jsx`, `GET /donations/recent`)
  — public, unauthenticated feed of the last 15 completed donations (donor
  name, or "Anonymous"), shown on both the landing page and `/donate` as
  lightweight social proof.
