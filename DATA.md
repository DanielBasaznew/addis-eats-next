# Data Architecture & Storage Lifecycle

## 1. Server-First Boundaries & Rendering Strategies

Addis Eats combines a **Server-First** baseline with targeted client-side SWR reactivity:

| Scope / Route | Source | Rendering Strategy | Lifecycle & Invalidation |
| :--- | :--- | :--- | :--- |
| **Marketing (`/`)** | Static JSX + Local Assets | Static (`○`) | Pre-rendered at build time for instant delivery. |
| **Menu Catalog (`/menu`)** | `public/dishes.json` | ISR (`○`, `revalidate = 3600`) | Serves cached catalog; revalidates hourly or on dish mutations. |
| **Dish Details (`/menu/[id]`)** | `public/dishes.json` | SSG (`●`, `generateStaticParams`) | Pre-generates static HTML/JSON for all catalog dishes. |
| **Order History (`/orders`)** | In-Memory / Cookie Overrides | Dynamic (`ƒ`, `force-dynamic`) | Server-renders user-specific orders scoped to `session.id`. |
| **Order Tracking (`/track/[id]`)** | Server Seed + SWR Polling | Dynamic (`ƒ`) + Client Leaf | Server seeds initial state; SWR polls every 5s until Delivered. |
| **Kitchen Dashboard (`/kitchen`)** | In-Memory / Cookie Overrides | Dynamic (`ƒ`, `force-dynamic`) | Staff dashboard updating via Server Actions (`revalidatePath`). |
| **Shopping Cart (`/cart`)** | `localStorage` | Client State (`CartProvider`) | Instantly hydrates client-side via React Context. |

---

## 2. Real-Time Telemetry & SWR Polling Lifecycle

- **Component**: [`OrderStatus.jsx`](./src/components/OrderStatus.jsx)
- **Polling Key**: `/api/orders/${id}`
- **Interval**: 5,000 ms (`refreshInterval: 5000`, `revalidateOnFocus: true`)
- **First Paint Zero-Spinner**: Seeding `<OrderStatus initialOrder={order} />` on the server ensures the customer never sees a layout shift or loading spinner on arrival.
- **Terminal Auto-Close**:
  ```javascript
  const isTerminal = order.status === 'Delivered' || order.status === 'Cancelled';
  const { data } = useSWR(!isTerminal ? `/api/orders/${id}` : null, fetcher);
  ```
  Passing `null` as the SWR key immediately destroys the interval timer and permanently stops all background polling once the order is Delivered or Cancelled.

---

## 3. Storage Architecture & Vercel Serverless Persistence

- **Local Development**: In-memory `Map` attached to `globalThis.__addis_orders__` synchronized with `public/orders.json`.
- **Vercel Serverless Environment**:
  - The serverless filesystem is read-only (`EROFS`) and containers are ephemeral across AWS Lambda instances.
  - **Day 45 Cookie Hydration Pattern**: Updated order statuses are persisted in an HTTP cookie (`order_status_overrides`). On container recycling or cold start, server components and API routes hydrate memory from the cookie before querying orders.
  - **Cross-Browser Synchronization**: Background sync ensures updates dispatched from Chrome (Staff) immediately synchronize with Edge (Customer).

---

## 4. Ethiopian Locale Formatting & Data Formats

- **Currency (`ETB`)**: `Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 })` outputs formatted currency (e.g. `ETB 650`).
- **Date & Time**: `Intl.DateTimeFormat('en-ET', { timeZone: 'Africa/Addis_Ababa', dateStyle: 'medium', timeStyle: 'short' })` guarantees correct East Africa Time (EAT, UTC+3) without client hydration mismatches.
- **CSV Order Export**: Built in [`src/lib/csv.js`](./src/lib/csv.js) following RFC 4180 escaping (quotes, commas, and newlines wrapped cleanly).
