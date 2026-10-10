export default function robots() {
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
    sitemap: 'https://addiseats.et/sitemap.xml',
  };
}