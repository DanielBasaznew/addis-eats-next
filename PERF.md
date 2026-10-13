# Performance Benchmark & Lighthouse Audit Report

## 1. Production Test Environment
- **Live Deployment**: [addis-eats-next-ivory.vercel.app](https://addis-eats-next-ivory.vercel.app/)
- **Auditing Tool**: Chrome DevTools Lighthouse 13.5 (Production Environment)
- **Routes Audited**: `/` (Landing & Brand Experience) and `/menu` (Catalog with 8+ dishes)
- **Profiles Tested**: Desktop & Mobile, Unthrottled & Simulated Slow 4G
- **Evidence Screenshots**: Located in [`public/for-documentation/`](./public/for-documentation/)

---

## 2. Lighthouse Audit Results (Live Production on Vercel)

| Tested Page | Device / Viewport | Network Condition | Performance | Accessibility | Best Practices | SEO | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Home (`/`)** | Desktop (1207×840) | No Throttling | **100** | **94** | **100** | **100** | 🟢 Optimal |
| **Home (`/`)** | Desktop (1207×840) | Slow 4G | **98** | **94** | **100** | **100** | 🟢 Optimal |
| **Home (`/`)** | Mobile (Emulated) | No Throttling | **99** | **94** | **100** | **100** | 🟢 Optimal |
| **Home (`/`)** | Mobile (Emulated) | Slow 4G | **99** | **94** | **100** | **100** | 🟢 Optimal |
| **Menu (`/menu`)** | Desktop (1207×840) | No Throttling | **100** | **95** | **100** | **100** | 🟢 Optimal |
| **Menu (`/menu`)** | Desktop (1207×840) | Slow 4G | **96** | **95** | **100** | **100** | 🟢 Optimal |
| **Menu (`/menu`)** | Mobile (Emulated) | No Throttling | **100** | **95** | **100** | **100** | 🟢 Optimal |
| **Menu (`/menu`)** | Mobile (Emulated) | Slow 4G | **99** | **95** | **100** | **100** | 🟢 Optimal |

---

## 3. Before vs. After Optimization Benchmarks

| Metric | Baseline (Unoptimized `<img>`) | Optimized (`next/image` + Server Preloading) | Target Budget | Result |
| :--- | :---: | :---: | :---: | :---: |
| **Performance Score** | 75 / 100 | **96–100 / 100** | ≥ 90 | **Pass (+21–25 pts)** |
| **Largest Contentful Paint (LCP)** | 12.3 s | **1.2–2.4 s** | < 2.5 s | **Pass (-80.5%)** |
| **Cumulative Layout Shift (CLS)** | 0.18 | **0.000** | < 0.1 | **Pass (Zero shift)** |
| **Total Transferred Image Bytes** | 4,506 kB | **513 kB** | < 1,000 kB | **Pass (-88.6%)** |
| **Largest Single Asset** | 945 kB (`chechebsa.jpg`) | **142 kB** (`beyaynetu.jpg`) | < 150 kB | **Pass (-85.0%)** |
| **Best Practices & SEO** | 88 / 92 | **100 / 100** | 100 | **Pass (+100%)** |

---

## 4. Key Architectural Optimizations Applied

1. **`next/image` Responsive Transformation**:
   - Replaced native `<img>` elements with Next.js image optimization.
   - Automatically transcodes heavy JPEGs to modern **WebP/AVIF** formats tailored to device pixel ratios.
   - Reduced catalog payload from 4.5 MB to 513 kB (-88.6% network reduction).

2. **LCP Image Preloading**:
   - Added `priority` to the above-the-fold hero image (`mesob.jpg`) and the first menu item (`Genfo`).
   - Generates `<link rel="preload">` in the document `<head>`, eliminating layout delays and cutting LCP under 2.5s even on Slow 4G.

3. **Zero Cumulative Layout Shift (CLS: 0.000)**:
   - Hardcoded explicit aspect ratios (`width={400} height={176}`) so layout containers reserve space prior to asset download.
   - Utilized `next/font/google` (`Inter`) with `display: swap` to prevent Flash of Unstyled Text (FOUT).

4. **SSR Map Dynamic Boundary**:
   - Wrapped the Leaflet OpenStreetMap component with `next/dynamic(..., { ssr: false })` and a sized skeleton container (`h-80`) in [MapPanel.jsx](file:///c:/Users/DELL/Documents/IBT/sq2-daniel-basaznew/module-03-react-nextjs/Projects/addis-eats-next/src/app/track/%5Bid%5D/MapPanel.jsx).
   - Prevents browser `window` evaluation crashes during server build while preventing layout jump when client tiles hydrate.

---

## 5. Audit Evidence Directory
All raw audit screenshots are documented in [`public/for-documentation/`](./public/for-documentation/):
- `Desktop No Throttling Home Page.png`
- `Desktop Slow 4G Home Page.png`
- `Mobile No throttling Home Page.png`
- `Mobile Slow 4G Home Page.png`
- `Desktop No Throttling Menu Page.png`
- `Desktop Slow 4G Menu Page.png`
- `Mobile No Throttling Menu Page.png`
- `Mobile Slow 4G Menu Page.png`
