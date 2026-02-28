import { NextResponse } from 'next/server';
import { MAP_PINS } from '@/data';

async function getFromDB() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { db } = await import('@/db');
    const { mapPins } = await import('@/db/schema');
    return await db.select().from(mapPins);
  } catch { return null; }
}

export async function GET() {
  const { requireMember } = await import('@/lib/auth');
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbData = await getFromDB();
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
    const result = await db.insert(mapPins).values({
      x: body.x,
      y: body.y,
      label: body.label,
      author: body.author || session.user?.name || '익명',
      discordId: session.discordId || null,
      note: body.note || '',
      color: body.color || '#44ff88',
      scenario: body.scenario || null,
      server: body.server ? parseInt(body.server) : null,
    }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/map-pins error:', error);
    return NextResponse.json({ error: 'Failed to create pin' }, { status: 500 });
  }
}
