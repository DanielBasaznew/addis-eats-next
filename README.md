# Addis Eats — Authentic Ethiopian Culinary Platform

> **Live Production Deployment**: [addis-eats-next-ivory.vercel.app](https://addis-eats-next-ivory.vercel.app/)

**Addis Eats** is a production-grade full-stack web application celebrating Ethiopian cuisine, built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**. It features hybrid rendering strategies, three-layer defense-in-depth security, real-time SWR telemetry, an interactive Leaflet delivery map, and staff kitchen controls.

---

## Key Features & System Capabilities

- **Real-Time Order Tracking & SWR Telemetry**:
  - Live preparation tracking (`Preparing` → `Cooking` → `Ready` → `Delivered`).
  - SWR polls the server every 5 seconds without UI blinking; automatically terminates connections upon delivery.
  - Interactive **Leaflet delivery route map** dynamically animates courier transit from **Bole, Addis Ababa** to the customer's delivery destination.
- **Kitchen Staff Dashboard (`/kitchen`)**:
  - Staff management portal with Server Actions (`updateOrderStatus`) to advance tickets.
  - Vercel serverless cold-start persistence via cookie hydration and cross-browser synchronization.
- **Hybrid Rendering Architecture**:
  - Marketing home (`/`) pre-rendered statically (`○`).
  - Menu catalog (`/menu`) served via Incremental Static Regeneration (`ISR`, 1-hour revalidation).
  - Dish details (`/menu/[id]`) pre-rendered with `generateStaticParams` (`● SSG`).
  - Auth-gated screens (`/checkout`, `/orders`, `/track/[id]`, `/kitchen`) rendered dynamically on demand (`ƒ`).
- **Debounced Search & Pagination**:
  - Responsive catalog search powered by a 300ms debounce hook and `keepPreviousData` smooth pagination.
- **Ethiopian Localization & Analytics**:
  - Native currency formatting in **ETB** (`Intl.NumberFormat`) and Addis Ababa time zone (`UTC+3`, EAT).
  - Order analytics dashboard with Recharts revenue breakdowns and RFC 4180 CSV export.

---

## Live Demo Test Credentials

| Role | Username | Access Passcode | Purpose |
| :--- | :--- | :--- | :--- |
| **Customer** | `daniel` | *(None required)* | Tracks order `#ORD-1001`, reviews order history, and places new orders. |
| **Kitchen Staff** | `staff` | `addis-kitchen-2026` | Accesses `/kitchen` dashboard to advance incoming order statuses. |

---

## Technical Documentation Index

Detailed architectural reports aligned with the CodeOps Module 3 engineering standards:

* **[AUTH.md](AUTH.md) — Authentication & Access Control**
  * Stateless HMAC-SHA-256 session cookie lifecycle and 7-day expiration.
  * Three-layer defense matrix: Edge Middleware (`middleware.js`), Page Guards (`page.js`), and Action/API guards.
  * OWASP verification: Defense proofs against IDOR, unauthenticated mutations, and open redirect phishing.

* **[DATA.md](DATA.md) — Data Fetching & Storage Lifecycle**
  * Server-First boundaries vs. client-side SWR reactivity.
  * Seeding initial server state to eliminate arrival loading spinners and layout shift.
  * Vercel serverless persistence mechanism: In-memory store, `/tmp` fallback, and Day 45 cookie hydration pattern.

* **[PERF.md](PERF.md) — Lighthouse Audits & Benchmarks**
  * Real Lighthouse production audit scores (**96–100 Performance, 94–95 Accessibility, 100 Best Practices, 100 SEO**).
  * Desktop vs. Mobile benchmarks across No Throttling and Slow 4G conditions.
  * Core Web Vitals optimization: 88.6% image transfer payload reduction and 0.000 CLS.
  * Evidence screenshots cataloged in [`public/for-documentation/`](./public/for-documentation/).

---

## Getting Started

### 1. Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm 9+

### 2. Installation & Environment Configuration
```bash
# Clone the repository
git clone https://github.com/DanielBasaznew/addis-eats-next.git
cd addis-eats-next

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

### 3. Running Locally
```bash
# Run in development mode (with Turbopack)
npm run dev

# Run code audit
npm run lint

# Create optimized production build
npm run build

# Start local production server
npm run start
```
Visit `http://localhost:3000` to interact with the application.
