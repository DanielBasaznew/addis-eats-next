import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import {
  getFavoriteIds,
  toggleFavorite as toggleFavoriteInStore,
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
