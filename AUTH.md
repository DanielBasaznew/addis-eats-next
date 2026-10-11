# Authentication & Security Architecture

## Session Security & Authorization
- **Cookie**: Flagged `session` cookie (`httpOnly`, `secure` in production, `sameSite: 'lax'`, and 7-day TTL).
- **Roles & Ownership**: Default role is `customer`. Staff role requires server validation of `STAFF_ACCESS_CODE` (or `staff` ID) at sign-in. Orders and favorites strictly scope to `session.id`. Staff can view all orders and manage dishes.

## Three-Layer Defense
1. **Edge Middleware (`middleware.js`)**: Perimeter check for session cookie existence; redirects unauthenticated visitors to `/signin`; restricts `/kitchen` and `/admin` to `staff`.
2. **Page Guards (`page.js`)**: Independent `getSession()` calls. `/orders/[id]` returns 404 on cross-customer access to prevent enumeration; `/admin` denies non-staff.
3. **Actions & APIs (`actions.js`, `/api/*`)**: Server-side session verification. Requires `session.id === order.userId` or `staff` to cancel; requires `staff` for dish CRUD and status updates.

## Mitigated Attack Scenarios
1. **Unauthenticated Order Cancellation**: `cancelOrder` checks `getSession()`; rejected with `authorized: false`.
2. **Accessing Another User's Order (IDOR)**: Page guard returns 404; mutation returns 403 unless owner or staff.
3. **Open Redirect Phishing (`/signin?next=...`)**: `getSafeNext()` disallows external domains, `//`, and `\`, defaulting to `/`.

## Limitations
- **Stateless Tokens**: Revoking an individual session before expiry requires rotating `SESSION_SECRET`.
- **Credentials**: Staff auth uses a shared environment passcode rather than a multi-user credential database.