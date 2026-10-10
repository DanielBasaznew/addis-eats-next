import { NextResponse } from 'next/server';
import { getSession, deleteSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      session: null,
    });
  }

  return NextResponse.json({
    authenticated: true,
    session: {
      id: session.id,
      role: session.role,
    },
  });
}

export async function DELETE() {
  await deleteSession();
  return NextResponse.json({
    success: true,
    authenticated: false,
    session: null,
  });
}
