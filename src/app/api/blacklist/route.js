import { NextResponse } from 'next/server';
import { BLACKLIST } from '@/data';

async function getFromDB() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { db } = await import('@/db');
    const { blacklist } = await import('@/db/schema');
    return await db.select().from(blacklist);
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
  return NextResponse.json(BLACKLIST);
}

export async function POST(req) {
  const { requireMember } = await import('@/lib/auth');
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await import('@/db');
    const { blacklist } = await import('@/db/schema');
    const body = await req.json();
    const result = await db.insert(blacklist).values({
      name: body.name,
      uuid: body.uuid || '',
      alts: body.alts || '',
      clan: body.clan || '',
      incident: body.incident || '',
      date: body.date || new Date().toISOString().split('T')[0],
      reporter: body.reporter || session.user?.name || '익명',
    }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/blacklist error:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
