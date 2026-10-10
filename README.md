# Addis Eats

Production URL: [https://addiseats.et](https://addiseats.et)

Full-stack Ethiopian restaurant web application built with Next.js 16 (App Router), React 19, and Tailwind CSS v4.

## Quick Start & Setup
1. **Install**: `npm install`
2. **Environment**: Copy `.env.example` to `.env.local`
   - `SESSION_SECRET`: 32+ character HMAC signing secret.
   - `STAFF_ACCESS_CODE`: Passcode required to authenticate as staff.
   - `NEXT_PUBLIC_SITE_URL`: Production origin (`https://addiseats.et`).
3. **Run local**: `npm run dev` (http://localhost:3000)
4. **Lint**: `npm run lint`
5. **Build & Start**: `npm run build && npm run start`

## Documentation
- [AUTH.md](AUTH.md): Session security, 3-layer defense, and attack mitigations.
- [DATA.md](DATA.md): Server/client boundaries, caching, SWR polling, and storage limitations.
- [PERF.md](PERF.md): Lighthouse benchmarks (Day 44 vs Day 45) and asset budget.
