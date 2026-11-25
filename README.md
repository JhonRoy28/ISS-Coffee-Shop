# Brewstock Café Inventory Demo

A frontend-only café inventory prototype with a cobalt-and-cream café menu visual theme.

## Project structure

```
ISS-Coffee-Shop/
  client/   React frontend (Vite) with in-memory demo data
```

## Run the frontend

You need Node.js 18 or newer.

```bash
cd client
npm install
npm run dev
```

Then open http://localhost:5173.

## Demo screens and workflows

- Sign-in screen with Manager and Barista demo roles
- Dashboard summary for stock quantity, low-stock alerts, expiring batches, and estimated inventory value in PHP
- Ingredient catalog with search, category filter, create/edit/delete controls, batches, and expiry dates
- Stock-In/Stock-Out forms with positive quantity checks, available-stock checks, and FIFO batch deduction
- Supplier directory and sample staff/role management screens
- Read-only audit trail and stock movement history
- Café-specific STRIDE threat-model and local OWASP ZAP testing preview
- Role-based screen and control previews: Baristas have view-only ingredient access and can record Stock-Out entries

All records are sample data held in React memory and reset on refresh. The login form does not authenticate users; the role selection only previews the intended UI.

## Security scope

This project currently has no backend, database, password hashing, server sessions, rate limiting, immutable audit log, or server-side role enforcement. Client-side checks are not security controls and can be bypassed. Do not use this prototype with real staff credentials or operational inventory. A production version needs a secured API implementing authentication, validation, authorization, and persistent audit records.
