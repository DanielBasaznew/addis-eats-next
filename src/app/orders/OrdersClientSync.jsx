'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersClientSync({ serverCount = 0 }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('addis_placed_orders');
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) return;

      // Check current cookie
      let cookieOrders = [];
      const match = document.cookie.match(/addis_custom_orders=([^;]+)/);
      if (match) {
        try {
          const cookieParsed = JSON.parse(decodeURIComponent(match[1]));
          if (Array.isArray(cookieParsed)) cookieOrders = cookieParsed;
        } catch {}
      }

      // If server shows 0 orders but localStorage has orders, or localStorage has new orders not in cookie
      const missingInCookie = parsed.some(
        (local) => local?.id && !cookieOrders.some((co) => co?.id === local.id)
      );

      if (serverCount === 0 || missingInCookie) {
        const merged = [...parsed];
        for (const co of cookieOrders) {
          if (co?.id && !merged.some((m) => m.id === co.id)) {
            merged.push(co);
          }
        }

        const lean = merged.slice(0, 5).map((o) => ({
          id: o.id,
          userId: o.userId,
          name: o.name,
          phone: o.phone,
          area: o.area,
          address: o.address,
          orderType: o.orderType,
          tableNumber: o.tableNumber,
          isTableOrder: o.isTableOrder,
          paymentMethod: o.paymentMethod,
          status: o.status,
          total: o.total,
          createdAt: o.createdAt,
          items: Array.isArray(o.items)
            ? o.items.map((i) => ({
                id: i.id || i.dishId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
              }))
            : [],
        }));

        document.cookie = `addis_custom_orders=${encodeURIComponent(
          JSON.stringify(lean)
        )}; path=/; max-age=2592000; SameSite=Lax`;

        // Refresh server components to render hydrated orders
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to sync orders from localStorage:', err);
    }
  }, [serverCount, router]);

  return null;
}
