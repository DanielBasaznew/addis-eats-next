# Performance Benchmark Report: Day 44 vs Day 45

## Test Environment & Conditions
- **Tool**: Lighthouse 13.5.0 CLI (`--only-categories=performance --chrome-flags="--headless"`).
- **Environment**: Next.js 16.3.5 Production Server (`next start -p 3000`) on route `/menu`.
- **Throttling**: Simulated Mobile 4G (150 ms RTT, 1.6 Mbps download, 4x CPU slowdown, 412x823 viewport).
- **Evidence Files**: `day44-actual-prod-report.json` (baseline) and `day45-actual-prod-report.json` (final).

## Benchmark Comparison Table
| Metric | Day 44 Baseline (`<img>` + uncompressed) | Day 45 Final (`next/image` + optimized) | Target | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Performance Score** | 75 / 100 | **94 / 100** | ≥ 90 | **Pass (+19 pts)** |
| **Largest Contentful Paint (LCP)** | 12.3 s | **3.1 s** | < 2.5 s (good) | Improved (-74.9%) |
| **Cumulative Layout Shift (CLS)** | 0 | **0** | < 0.1 | **Pass (Zero shift)** |
| **Transferred Image Bytes** | 4,506.3 kB | **513.1 kB** | Significant drop | **Pass (-88.6%)** |
| **Largest Source Image Asset** | 945.0 kB (`chechebsa.jpg`) | **142.4 kB** (`beyaynetu.jpg`) | < 150 kB | **Pass (-85.0%)** |
| **First Load JS (`/menu`)** | *Unmeasured in Turbopack* | *Unmeasured in Turbopack* | < 100 kB | **Unmeasured** |

## Key Technical Optimizations
- **`next/image` Format & Sizing**: Automatically serves responsive WebP/AVIF scaled to viewport (slashing transfer bytes by 88.6%).
- **Pre-Compressed Assets**: All 8 local dish images compressed under the 150 kB budget (854 kB total vs 4.5 MB original).
- **LCP Preloading**: `priority={index === 0}` on the above-the-fold dish card preloads the LCP asset in `<head>`.
- **Zero CLS & `next/font`**: Explicit image dimensions (`width={400} height={176}`) reserve space; `next/font/google` (`Inter`) prevents FOUT layout shifts.

## Unmeasured Metrics & Notes
- **First Load JS**: Next.js 16.3.5 Turbopack production builds output static route designations (`○`) rather than granular per-route chunk byte sizes; compliance cannot be verified without Webpack bundle analyzers.
- **INP (Interaction to Next Paint)**: Synthetic headless audits measure load; field RUM data is required for INP.
