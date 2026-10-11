# NestSave — Smart Savings Planner

A local-first savings goal planner built with Next.js 14, TypeScript, Tailwind CSS, React and IndexedDB.

## Core rule

The application ships with **zero financial demo data**. There are no sample goals, fake balances, fake transactions, fabricated charts, or placeholder users.

Everything shown after setup comes from data entered by the user.

## V1 included

- Goal creation for purchases or general savings
- Optional product/goal URL
- Target amount, current amount, deadline and priority
- Income + fixed-expense based savings-capacity calculation
- Feasibility result: Doable / Tight / Not realistic
- Required daily/weekly/monthly savings calculations
- Progress tracking
- Ahead/projection-oriented planning
- What-if target slider
- Deposit and withdrawal tracking
- Full transaction history
- Multiple goals
- Priority-based allocation view
- Goal search
- Goal editing
- Goal archive
- Dark mode
- INR formatting using Indian numbering
- JSON export/import
- Local IndexedDB persistence
- Responsive mobile-first UI
- No login
- No backend
- No bank connection
- No money movement

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Production:

```bash
npm run build
npm start
```

## Architecture

- `app/` — Next.js App Router
- `components/App.tsx` — application UI and state
- `lib/calculations.ts` — savings calculation engine
- `lib/storage.ts` — IndexedDB persistence
- `lib/types.ts` — domain types

The calculation engine is deliberately separate from the storage layer so it can later be reused by a Capacitor Android shell or a cloud-sync implementation.

## Important V1 scope decision

The product URL is stored with the goal and can be opened by the user. V1 does **not** scrape a product page or silently replace the user's target amount with a web price. Automatic price tracking belongs in a later version and should be opt-in.

## Suggested V2

- Expense tracking
- Monthly budgets
- Multiple income sources
- EMI vs saving comparison
- Streaks and milestones
- Charts
- CSV/PDF export
- Optional account/cloud sync
- App lock

## Suggested V3

- Price tracking from supported product URLs
- Savings challenges
- RD/SIP/FD calculators
- Emergency fund
- Shared goals
- Android SMS/UPI import with explicit permission
- Festival goals
- AI affordability assistant
