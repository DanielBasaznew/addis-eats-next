import { getDishes } from '@/lib/dishes';

export default async function sitemap() {
  const dishes = await getDishes();
  const baseUrl = 'https://addiseats.et';
  const now = new Date();

  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/menu', priority: 0.9, changeFrequency: 'daily' },
  ];

  const dishRoutes = dishes.map((dish) => ({
    url: `${baseUrl}/menu/${dish.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...dishRoutes,
  ];
}