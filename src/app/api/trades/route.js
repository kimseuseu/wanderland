import { NextResponse } from 'next/server';

async function getFromDB() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { db } = await import('@/db');
    const { trades } = await import('@/db/schema');
    const { desc } = await import('drizzle-orm');
    return await db.select().from(trades).orderBy(desc(trades.createdAt));
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
  return NextResponse.json([]);
}

export async function POST(req) {
  const { requireMember } = await import('@/lib/auth');
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await import('@/db');
    const { trades } = await import('@/db/schema');
    const body = await req.json();
    const result = await db.insert(trades).values({
      type: body.type || 'sell',
      title: body.title,
      item: body.item,
      quantity: body.quantity || 1,
      price: body.price || null,
      description: body.description || '',
      image: body.image || null,
      status: 'open',
      author: session.user?.name || '익명',
      discordId: session.discordId || null,
      scenario: body.scenario || null,
      server: body.server || null,
    }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/trades error:', error);
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 });
  }
}
