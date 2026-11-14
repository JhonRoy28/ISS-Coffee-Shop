# Cafe Inventory (MERN)

A cafe inventory system built with MongoDB, Express, React, and Node.

## Project structure

```
cafe-inventory/
  client/   React frontend (Vite)   <- done for the Inventory Overview page
  server/   Express + MongoDB API   <- next step
```

## Run the frontend

You need Node.js 18 or newer.

```bash
cd client
npm install
npm run dev
```

Then open http://localhost:5173.

## What works right now

- Inventory Overview page, built from the design screenshots
- Stat cards, stock level chart, and low stock alerts, all calculated from the data
- Inventory table with search (name, SKU, supplier) and category filter
- Export button (downloads the inventory as a CSV file)
- Row menu with Edit and Delete (connected to the backend in the next step)

The page currently reads sample data from `client/src/data/mockItems.js`.
When the API is ready, only `client/src/api/inventoryApi.js` needs to change.
