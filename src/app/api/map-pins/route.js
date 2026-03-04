import { NextResponse } from 'next/server';
import { MAP_PINS } from '@/data';
import { or, eq } from 'drizzle-orm';

async function getFromDB(discordId) {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { db } = await import('@/db');
    const { mapPins } = await import('@/db/schema');
    // Return public pins + current user's private pins
    return await db.select().from(mapPins).where(
      or(
        eq(mapPins.visibility, 'public'),
        eq(mapPins.discordId, discordId || '')
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
  if (dbData) return NextResponse.json(dbData);
  return NextResponse.json(MAP_PINS);
}

export async function POST(req) {
  const { requireMember } = await import('@/lib/auth');
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await import('@/db');
    const { mapPins } = await import('@/db/schema');
    const body = await req.json();
    if (!body.label || typeof body.label !== 'string' || body.x == null || body.y == null || isNaN(Number(body.x)) || isNaN(Number(body.y))) {
      return NextResponse.json({ error: 'Missing or invalid required fields (label, x, y)' }, { status: 400 });
    }
    const result = await db.insert(mapPins).values({
      x: Number(body.x),
      y: Number(body.y),
      label: body.label.trim(),
      author: body.author || session.user?.name || '익명',
      discordId: session.discordId || null,
      note: body.note || '',
      color: body.color || '#44ff88',
      category: body.category || 'etc',
      scenario: body.scenario || null,
      server: body.server ? parseInt(body.server) : null,
      visibility: body.visibility || 'public',
    }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/map-pins error:', error);
    return NextResponse.json({ error: 'Failed to create pin' }, { status: 500 });
  }
}
