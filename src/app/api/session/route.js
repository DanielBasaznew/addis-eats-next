import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

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
