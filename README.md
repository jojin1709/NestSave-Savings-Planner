<div align="center">

<h1>🪺 NestSave</h1>

### NestSave is a local-first, privacy-first savings goal planner.

It runs entirely on your device. No accounts. No cloud sync. No tracking. Your financial data never leaves your browser.

<br />

<a href="https://nestsave.vercel.app/" target="_blank">
  <img src="https://img.shields.io/badge/Launch%20App-nestsave.vercel.app-0d684c?style=for-the-badge&logo=vercel&logoColor=white" alt="Launch NestSave" />
</a>

<br /><br />

**Use NestSave directly in your browser:**  
### 🌐 [https://nestsave.vercel.app](https://nestsave.vercel.app/)

<sub>Installable as a Progressive Web App (PWA) on Mobile and Desktop. Works 100% offline.</sub>

---

</div>

> [!IMPORTANT]
> **Zero fake data policy:** NestSave ships with a completely clean slate. There are no sample goals, fake balances, fabricated charts, or placeholder transactions. Every number shown comes directly from data you enter.

> [!NOTE]
> **Privacy first:** All data is stored in IndexedDB on your device. There is no backend, no login, no bank connection, and no money movement of any kind.

---

## Table of Contents

- [What is NestSave?](#what-is-nestsave)
- [Live Web App](#live-web-app)
- [Features](#features)
- [Architecture & Security](#architecture--security)
- [Tech Stack](#tech-stack)
- [Dark Mode](#dark-mode)
- [Roadmap](#roadmap)
- [Developer](#developer)
- [Copyright & License](#copyright--license)

---

## What is NestSave?

NestSave is a **smart savings planner** built for people who want to plan and track their financial goals without handing their data to a third party.

You set a goal — a laptop, a trip, a home, an emergency fund — and NestSave calculates exactly how much you need to save daily, weekly, or monthly to reach it. It tells you if your plan is **Doable**, **Tight**, or **Not Realistic** based on your income and expenses. It tracks every deposit and withdrawal and shows you whether you are ahead or behind schedule.

Everything happens on your device. No server ever sees your numbers.

<details>
<summary><strong>Why "NestSave"?</strong></summary>

A nest is where you build something safe, carefully, over time. NestSave is where you build your financial safety net — one goal, one contribution at a time.

</details>

<details>
<summary><strong>Who is it for?</strong></summary>

NestSave is built for individuals and families who want a clear, private, and honest view of their savings goals — without subscriptions, bank integrations, or data harvesting.

</details>

---

## Live Web App

NestSave is deployed and available directly at:

### 🚀 **[nestsave.vercel.app](https://nestsave.vercel.app/)**

- **No installation needed:** Open the link in any modern browser.
- **Install as App:** Tap **Add to Home Screen** or **Install** in your browser to install NestSave as an offline PWA on iOS, Android, macOS, or Windows.
- **Your Data Stays on Your Device:** Nothing is uploaded to any server.

---

## Features

### Goal Planning
- Create savings goals for purchases, travel, education, emergency fund, and more
- Set target amount, current savings, start date, and deadline
- Attach an optional product/goal URL for reference
- Choose goal type, category, and icon
- Priority levels: Critical, High, Medium, Low

### Smart Calculations
- Required **daily / weekly / monthly** savings rate
- **Feasibility verdict**: Doable / Tight / Not Realistic
- Income and expense-based savings capacity engine
- **What-if scenario planner** — simulate target or deadline changes
- Suggested deadline based on your available capacity
- Ahead / behind schedule tracking
- Projected completion date

### Financial Calculators & Banking Suite
- **Bank Recurring Deposit (RD) Calculator**: Indian quarterly compounding standard ($A = P \times \frac{(1 + r/4)^{4n} - 1}{1 - (1 + r/4)^{-1/3}}$), maturity estimation, total interest earned, and 1-click goal conversion.
- **Bank Fixed Deposit (FD) Calculator**: Quarterly compounding maturity calculator, total wealth gain, and 1-click goal creation.
- **Savings vs. EMI comparison**: Compares buying on loan vs. saving cash upfront and reveals total interest saved.
- **SIP Wealth Gain Calculator**: Models compound wealth gain, invested capital, and maturity value over time.
- **Emergency Fund Tiered Buffer**: Calibrates 3-month (essential), 6-month (recommended), and 12-month safety nets with one-click goal conversion.

### Dynamic Recalibration & Real Value
- **1-Click "Recalibrate Plan" for Behind-Schedule Goals**: Instant recalibration modal with two deterministic options:
  - **Keep Deadline**: Automatically recalculates and locks the higher monthly contribution required to hit the original target date.
  - **Keep Savings Pace**: Extends the target deadline to a realistic future date based on your actual historical savings speed.
- **Inflation Adjustment Toggle (Real Value Calculator)**: Built into the Goal Creation Wizard to calculate future required corpus based on annual inflation (e.g. 6% p.a.) so long-term goals (education, car, house down payment) preserve purchasing power.

### Gamification & Habit-Building
- **Savings Challenges Mode**: Pre-built structured challenges with daily and weekly checkpoints:
  - **52-Week Challenge**: Incremental weekly savings accumulating ₹1,37,800+ in a year.
  - **30-Day Momentum Kickstart**: Daily ₹500 deposits to build disciplined savings habits.
  - **Daily ₹50 Habit Builder**: Low-friction ₹50/day accumulation reaching ₹18,250/yr.
  - **100-Day ₹25K Reserve**: Fast ₹25,000 emergency cash cushion.
- **Salary Day 1-Tap Batch Depositor**: Instantly allocates and logs planned monthly contributions across all active goals simultaneously on payday.

### Multi-Goal Management
- Manage unlimited goals simultaneously
- Priority-weighted allocation view across all active goals
- Conflict detection when goals compete for the same capacity
- Search, filter, and sort goals

### Transactions
- Deposit and withdrawal tracking per goal
- Quick deposit buttons (+₹500, +₹1,000, +₹2,000, +₹5,000)
- Full transaction history with notes
- Undo window for reversible actions (6-second toast)

### Milestones & Celebrations
- Milestone feedback at 25%, 50%, and 75%
- Dedicated goal completion screen at 100% with confetti animation
- Milestone tracking persisted so celebrations never repeat

### Privacy, Security & Data Portability
- **Local App Lock (4-Digit PIN)**: Require a security PIN before showing vault balances. Hashes on-device using Web Crypto SHA-256 with cryptographic salt.
- **Password-Encrypted Vault Backup**: Export and restore your complete local vault using military-grade **AES-GCM 256** encryption and **PBKDF2** key derivation.
- Plain JSON and CSV export/restore options.
- **Printable PDF Financial Statement & Goal Completion Certificates**: Generates sleek, 1-page official summaries and achievement certificates with zero server dependencies.
- No login, no account, no signup, no tracking.
- All data stored in IndexedDB — 100% on-device.

---

## Architecture & Security

```
NestSave
├── app/                    — Next.js App Router
│   ├── layout.tsx          — Root layout with PWA metadata
│   ├── page.tsx            — Entry point
│   └── globals.css         — Pitch-black dark mode tokens & design system
│
├── components/
│   ├── App.tsx             — Full application UI and state
│   ├── CalculatorsView.tsx — Savings vs EMI, SIP, Bank RD, and Fixed Deposit (FD)
│   ├── AnalyticsView.tsx   — Trajectory charts, burn rates, and breakdowns
│   ├── ExpenseTrackerView.tsx — Monthly expense logger and budget limits
│   ├── GamificationView.tsx— Savings streaks and achievement badges
│   ├── AppLockModal.tsx    — 4-digit security PIN lock screen
│   ├── SalaryDayBatchModal.tsx — 1-tap salary day batch allocation modal
│   ├── RecalibratePlanModal.tsx— 1-click plan recalibration (Keep Deadline vs Pace)
│   ├── PrintStatementModal.tsx — Printable PDF financial statements and certificates
│   ├── EncryptedVaultModal.tsx — Password-encrypted AES-GCM vault backup & restore
│   ├── NestSaveLogo.tsx    — Official squircle SVG logo
│   ├── GoalCategoryIcon.tsx — Lucide icon mapper for goal types
│   ├── GoalCompletionModal.tsx — 100% celebration screen
│   ├── ConfirmationModal.tsx   — Accessible confirmation dialog
│   └── Confetti.tsx        — Lightweight canvas confetti
│
├── lib/
│   ├── calculations.ts     — Pure deterministic math engine (RD, FD, EMI, SIP, inflation)
│   ├── security.ts         — Web Crypto API (SHA-256 PIN hashing, AES-GCM 256, PBKDF2)
│   ├── storage.ts          — IndexedDB + localStorage persistence
│   ├── types.ts            — Domain types and interfaces
│   └── ai-assistant.ts     — On-device financial query engine
│
└── public/
    ├── icon.svg            — Official NestSave icon
    ├── manifest.json       — PWA manifest
    └── sw.js               — Service worker for offline support
```

The calculation engine (`lib/calculations.ts`) is a collection of pure TypeScript functions with zero external dependencies. All data is persisted locally in the user's browser sandbox using IndexedDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + Vanilla CSS |
| Icons | Lucide React (SVG) |
| Storage | IndexedDB (Browser Sandbox) |
| Font | Plus Jakarta Sans |
| Deployment | Vercel |
| PWA | Web App Manifest + Offline Service Worker |

---

## Dark Mode

NestSave supports three appearance modes: **Light**, **Dark**, and **System**.

Dark mode uses a true pitch-black palette — no blue or navy tints:

| Token | Value |
|---|---|
| Background | `#000000` |
| Card surface | `#121212` |
| Elevated surface | `#18181b` |
| Border | `#27272a` |
| Brand green | `#0d684c` |

Switch themes any time from **Settings → Appearance**.

---

## Roadmap

<details>
<summary><strong>V2 Planned</strong></summary>

- Expense tracker with categories
- Monthly budgets and overspending alerts
- Multiple income sources (salary + freelance)
- EMI vs saving comparison calculator
- Savings streaks and badges
- Charts and monthly reports
- CSV and PDF export
- Optional cloud sync
- App lock / biometric PIN

</details>

<details>
<summary><strong>V3 Planned</strong></summary>

- Product price tracking from URLs
- RD / SIP / FD calculators
- Savings challenges
- Shared goals
- Festival and seasonal goals
- Goal dependencies
- Inflation adjustment
- Android SMS / UPI import (explicit permission)

</details>

---

## Developer

**Built by [Jojin John](https://github.com/jojin1709)**

NestSave is an independent project — designed, built, and maintained by Jojin John as a privacy-respecting alternative to cloud-connected finance apps.

---

## Copyright & License

Copyright © 2026 **Jojin John**. All rights reserved.

This project is proprietary. Unauthorized copying, modification, distribution, or reproduction of this software and its source code is strictly prohibited. 

Users are welcome to use the official web application at **[https://nestsave.vercel.app](https://nestsave.vercel.app/)**.

---

<div align="center">

**Built with care by Jojin John**

*Your savings. Your device. Your rules.*

</div>
