# Cafe Inventory (MERN)

A cafe inventory system built with MongoDB, Express, React, and Node.

## Project structure

```
cafe-inventory/
  client/   React frontend (Vite)
  server/   Express + MongoDB API
```

## Configuration

Copy `server/.env.example` to `server/.env`, then set the MongoDB URI, the exact frontend origin, and a randomly generated session secret. Keep `.env` private and never commit it. Production must use HTTPS and an HTTPS `CLIENT_ORIGIN`.

## Run the application

```bash
cd server
npm install
npm run create-admin
npm run dev
```

The one-time Admin setup prompts for a name, email, and password in an interactive terminal. Password input is masked. It refuses to create another Admin and does not print passwords. Admin-created Staff accounts use a one-time password setup link that must be shared through a trusted channel.

In another terminal:

```bash
cd client
npm install
npm run dev
```

Then open http://localhost:5173.

## Roles

- Admins can manage Staff accounts, fully manage inventory and suppliers, and view reports.
- Staff can view inventory, suppliers, and reports; they can add and edit inventory but cannot delete inventory or modify supplier/account data.
- API permissions are enforced by the server; frontend role-aware controls are for usability only.

Run the backend authorization tests with `cd server && npm test`. Tests use an isolated in-memory MongoDB instance and do not use the configured Brewstock database.
