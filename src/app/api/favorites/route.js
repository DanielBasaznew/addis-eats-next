import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import {
  getFavoriteIds,
  toggleFavorite as toggleFavoriteInStore,
  syncFavoritesFromList,
} from '@/lib/favorites';
import { getDishById } from '@/lib/dishes';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json(
      { success: false, error: 'Unauthorized: Authentication required.' },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(`favorites_${session.id}`)?.value;
  if (cookieVal) {
    try {
      const parsed = JSON.parse(cookieVal);
      syncFavoritesFromList(session.id, parsed);
    } catch {
      // Ignore JSON parse errors on invalid cookie values
    }
  }

  const ids = Array.from(getFavoriteIds(session.id));
  return Response.json({
    success: true,
    userId: session.id,
    favoriteIds: ids,
  });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return Response.json(
      { success: false, error: 'Unauthorized: Authentication required.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const dishId = Number(body?.dishId);

    if (!dishId || isNaN(dishId)) {
      return Response.json(
        { success: false, error: 'Valid dishId is required.' },
        { status: 400 }
      );
    }

    const dish = await getDishById(dishId);
    if (!dish) {
      return Response.json(
        { success: false, error: 'Dish not found.' },
        { status: 404 }
      );
    }

    const isFavorite = toggleFavoriteInStore(session.id, dishId);

    const updatedIds = Array.from(getFavoriteIds(session.id));
    try {
      const cookieStore = await cookies();
      cookieStore.set(`favorites_${session.id}`, JSON.stringify(updatedIds), {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    } catch {
      // Ignore if cookies cannot be modified
    }

    try {
      revalidatePath('/favorites');
      revalidatePath('/menu');
      revalidatePath(`/menu/${dishId}`);
    } catch {
      // Safe no-op outside Next.js request context
    }

    return Response.json({
      success: true,
      dishId,
      isFavorite,
      message: isFavorite
        ? `${dish.name} added to favorites.`
        : `${dish.name} removed from favorites.`,
    });
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }
}
