# Authentication & Security Architecture

## 1. Centralized Session Management (`src/lib/session.js`)
Addis Eats enforces stateless server-side session management using a cryptographically signed HTTP cookie:

* **Cookie Identifier**: `session`
* **Cryptographic Security**:
  * `httpOnly: true` (prevents JavaScript access, mitigating XSS token theft).
  * `secure: process.env.NODE_ENV === 'production'` (forces HTTPS in production deployments).
  * `sameSite: 'lax'` (CSRF defense for top-level navigations).
  * `path: '/'` (global route scope).
  * `maxAge: 60 * 60 * 24 * 7` (7-day lifecycle).
* **Role Scoping**:
  * Default: `customer` (associated with the customer's account ID).
  * Elevated: `staff` (requires matching `STAFF_ACCESS_CODE` at sign-in).

---

## 2. Three-Layer Defense-in-Depth Architecture

| Security Layer | File Location | Enforcement Mechanism | Failure Response |
| :--- | :--- | :--- | :--- |
| **Layer 1: Edge Perimeter** | [`middleware.js`](./middleware.js) | Validates cookie presence on protected patterns (`/kitchen/:path*`, `/orders/:path*`, `/track/:path*`, `/checkout/:path*`). | Redirects unauthenticated visitors to `/signin?next=${path}`. |
| **Layer 2: Server Page Guards** | Route [`page.js`](./src/app/) | Server Components independently invoke `await getSession()`. Verifies role permissions and record ownership. | Non-staff on `/kitchen` see "Access Denied"; unauthorized order requests return `notFound()`. |
| **Layer 3: Mutation & API Guards** | [`actions.js`](./src/app/actions.js), [`/api/orders`](./src/app/api/orders/) | Server Actions and Route Handlers independently verify session identity, ownership, and role before mutating records. | Mutating actions return `{ success: false, authorized: false, error: '...' }`; APIs return HTTP 401 or 403. |

---

## 3. OWASP & Access Control Attacks Mitigated

### Attack 1: Unauthenticated Mutation / Bypass
- **Vector**: Direct POST/Server Action dispatch to `updateOrderStatus` or `cancelOrder` without an active session.
- **Defense (Layer 3)**: Action checks `if (!session) return { authorized: false }`. Rejects execution server-side with zero mutation.

### Attack 2: Insecure Direct Object Reference (IDOR)
- **Vector**: A signed-in customer (`customer-1`) attempts to access or cancel an order belonging to another customer (`daniel`, e.g. `#ORD-1001`).
- **Defense (Layer 2 & Layer 3)**:
  - Tracking page guard verifies `order.userId === session.id || session.role === 'staff'`. Returns HTTP 404 (`notFound()`) to prevent resource enumeration.
  - Route handler `/api/orders/[id]` rejects unauthorized lookups with HTTP 403 Forbidden.

### Attack 3: Open Redirect Phishing
- **Vector**: An attacker crafts a phishing link containing an external domain redirect: `/signin?next=https://malicious-phishing.com`.
- **Defense**: The `getSafeNext(next)` sanitizer enforces that redirect URLs must begin with a single `/` and strictly rejects `//`, `\`, and external protocols, safely defaulting to `/`.

---

## 4. Test Credentials for Evaluation
- **Customer Account**: Username: `daniel` (owns order `#ORD-1001`).
- **Staff Portal**: Username: `staff` · Access Passcode: `addis-kitchen-2026`.