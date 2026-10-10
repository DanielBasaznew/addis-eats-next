# Data Fetching, Boundaries & Storage Lifecycle

## Server/Client Boundaries & Caching Strategies
- **Server Components (Default)**: Layout, `/` (Static), `/menu` (ISR: `revalidate = 3600`), `/menu/[id]` (SSG via `generateStaticParams`), `/orders` and `/admin` (Dynamic). Direct filesystem and server store reads.
- **Client Components**: Interactive leaves (`CartProvider`, `AddToCartButton`, `FavoriteButton`, `FilterShell`, `CheckoutForm`, `OrderStatus`, `AdminDishManager`).
- **Browser State**: Cart persists in `localStorage` via React Context.
- **Cache Invalidation**: Dish mutations invoke `revalidatePath('/menu')` and `revalidatePath('/menu/[id]')`.

## SWR Reactivity & Data Fetching
- **Order Tracking (`OrderStatus`)**: SWR key `/api/orders?id=${orderId}` polls every 5s (`refreshInterval: 5000`) with initial server `fallbackData` to eliminate layout shift.
- **Menu Search (`FilterShell`)**: SWR key `/api/dishes?q=${q}&page=${page}` with 300ms debounce, conditional keying, and URL synchronization.

## Storage Architecture & Persistence Limitations
- **Sessions**: Client HTTP cookie signed with server-side HMAC-SHA-256 (`SESSION_SECRET`).
- **Orders & Favorites**: In-memory global maps (`globalThis`). Transient; lost on server restart or container recycling.
- **Dishes Catalog**: In-memory cache synced to `public/dishes.json`. Persists on stateful servers, but fails on serverless platforms (e.g. Vercel) where the filesystem is read-only (`EROFS`). Production deployments require an external database.
