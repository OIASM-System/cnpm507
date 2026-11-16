# OISM Frontend

React + TypeScript + Vite frontend containing the Admin Dashboard and POS PWA experience.

## Requirements
- Node.js 20+
- npm 10+
- OISM ASP.NET Core API (optional for UI preview; required for authenticated/persisted operations)

## Run locally
```bash
cd frontend
npm install
cp .env.example .env
# Update VITE_API_BASE_URL to your backend URL
npm run dev
```

Open `http://localhost:5173`. Use the bottom-right switch to move between **Admin** and **POS**.

## Production build
```bash
npm run build
npm run preview
```

## API integration
The API client reads `VITE_API_BASE_URL` (default `/backend` (Vite proxies to `http://localhost:5185`)), can send a stored Bearer access token, and adds `X-Tenant-Id` when `VITE_TENANT_ID` is configured. The uploaded backend currently exposes `GET/PUT /api/inventory`, `GET /api/inventory/all`, `GET /api/inventory/ledger`, and `POST/GET /api/orders` routes. The API overview in `EP-09` is a proposed contract; the current backend source does not yet implement authentication, product catalog, order listing, or POS checkout endpoints. The UI therefore does not pretend those proposed endpoints exist. Seed catalog and dashboard records are illustrative in-memory data; POS cart state is retained locally, but payment is not submitted until a real checkout endpoint is implemented. The current backend requires a valid `VITE_TENANT_ID` header for order/inventory controllers. For production cross-origin hosting, configure CORS or a reverse proxy on the backend; the included proxy is for local Vite development.

## Current UI coverage
- Admin: dashboard, sales reports, products, inventory and append-only ledger overview, orders, branches, users/RBAC overview, settings/API status.
- POS: searchable catalog, category filters, SKU entry/search, cart quantity controls, discount toggle, cash/change calculation, cash/transfer/card selection, responsive cart drawer, online/offline indicator.

Some endpoints and workflows in the source documentation are marked proposed/TBD or are not present in the current OpenAPI contract. Those views are presented as UI foundations and should be wired when the backend contract is finalized.
