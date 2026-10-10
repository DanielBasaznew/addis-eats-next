export default function robots() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://addiseats.et');
  const baseUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cart',
        '/cart/',
        '/checkout',
        '/checkout/',
        '/orders',
        '/orders/',
        '/kitchen',
        '/kitchen/',
        '/admin',
        '/admin/',
        '/favorites',
        '/favorites/',
        '/signin',
        '/signin/',
        '/signout',
        '/signout/',
        '/api',
        '/api/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}