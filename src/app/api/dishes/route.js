import { revalidatePath } from 'next/cache';
import {
  getDishes,
  createDish,
  updateDish,
  deleteDish,
} from '@/lib/dishes';
import { dishSchema } from '@/lib/schema';
import { getSession } from '@/lib/session';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q')?.trim().toLowerCase() || '';
  const rawPage = parseInt(searchParams.get('page'), 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const pageSize = 3;

  const dishes = await getDishes();

  const filteredDishes = query
    ? dishes.filter(
        (dish) =>
          dish.name.toLowerCase().includes(query) ||
          dish.category.toLowerCase().includes(query)
      )
    : dishes;

  const totalPages = Math.max(1, Math.ceil(filteredDishes.length / pageSize));
  const start = (page - 1) * pageSize;

  const paginatedDishes = filteredDishes.slice(
    start,
    start + pageSize
  );

  return Response.json({
    dishes: paginatedDishes,
    page,
    totalPages,
    total: filteredDishes.length,
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

  if (session.role !== 'staff') {
    return Response.json(
      { success: false, error: 'Forbidden: Staff role required.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parseResult = dishSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        {
          success: false,
          error: 'Validation failed',
          fieldErrors: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const dish = await createDish(parseResult.data);
    try {
      revalidatePath('/menu');
      revalidatePath('/admin');
      revalidatePath('/api/dishes');
    } catch {
      // Safe no-op outside Next.js request context
    }
    return Response.json({ success: true, dish }, { status: 201 });
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }
}

export async function PUT(request) {
  const session = await getSession();
  if (!session) {
    return Response.json(
      { success: false, error: 'Unauthorized: Authentication required.' },
      { status: 401 }
    );
  }

  if (session.role !== 'staff') {
    return Response.json(
      { success: false, error: 'Forbidden: Staff role required.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return Response.json(
        { success: false, error: 'Dish ID is required.' },
        { status: 400 }
      );
    }

    const parseResult = dishSchema.safeParse(data);
    if (!parseResult.success) {
      return Response.json(
        {
          success: false,
          error: 'Validation failed',
          fieldErrors: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const updated = await updateDish(id, parseResult.data);
    if (!updated) {
      return Response.json(
        { success: false, error: 'Dish not found.' },
        { status: 404 }
      );
    }

    try {
      revalidatePath('/menu');
      revalidatePath(`/menu/${id}`);
      revalidatePath('/admin');
      revalidatePath('/api/dishes');
    } catch {
      // Safe no-op outside Next.js request context
    }

    return Response.json({ success: true, dish: updated });
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  const session = await getSession();
  if (!session) {
    return Response.json(
      { success: false, error: 'Unauthorized: Authentication required.' },
      { status: 401 }
    );
  }

  if (session.role !== 'staff') {
    return Response.json(
      { success: false, error: 'Forbidden: Staff role required.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json(
      { success: false, error: 'Dish ID query parameter is required.' },
      { status: 400 }
    );
  }

  const deleted = await deleteDish(id);
  if (!deleted) {
    return Response.json(
      { success: false, error: 'Dish not found or could not be deleted.' },
      { status: 404 }
    );
  }

  try {
    revalidatePath('/menu');
    revalidatePath(`/menu/${id}`);
    revalidatePath('/admin');
    revalidatePath('/api/dishes');
    revalidatePath('/favorites');
  } catch {
    // Safe no-op outside Next.js request context
  }

  return Response.json({ success: true, message: `Dish ${id} deleted.` });
}