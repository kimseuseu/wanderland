import { NextResponse } from 'next/server';
import { or, eq } from 'drizzle-orm';

async function getFromDB(discordId) {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { db } = await import('@/db');
    const { mapRoutes } = await import('@/db/schema');
    // Return public routes + current user's private routes
    return await db.select().from(mapRoutes).where(
      or(
        eq(mapRoutes.visibility, 'public'),
        eq(mapRoutes.discordId, discordId || '')
      )
    );
  } catch { return null; }
}

export async function GET() {
  const { requireMember } = await import('@/lib/auth');
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const dbData = await getFromDB(session.discordId);
  return NextResponse.json(dbData || []);
}

export async function POST(req) {
  const { requireMember } = await import('@/lib/auth');
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await import('@/db');
    const { mapRoutes } = await import('@/db/schema');
    const body = await req.json();
    if (!body.points || body.points.length < 2) {
      return NextResponse.json({ error: 'At least 2 points required' }, { status: 400 });
    }
    const result = await db.insert(mapRoutes).values({
      label: body.label || '경로',
      points: body.points,
      color: body.color || '#ffaa44',
      author: session.user?.name || '익명',
      discordId: session.discordId || null,
      note: body.note || '',
      scenario: body.scenario || null,
      visibility: body.visibility || 'public',
    }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/map-routes error:', error);
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 });
  }
}
