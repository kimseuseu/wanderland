import { NextResponse } from 'next/server';

async function getFromDB() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { db } = await import('@/db');
    const { guides } = await import('@/db/schema');
    const { desc } = await import('drizzle-orm');
    return await db.select().from(guides).orderBy(desc(guides.createdAt));
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
    const { guides } = await import('@/db/schema');
    const body = await req.json();
    const result = await db.insert(guides).values({
      title: body.title,
      category: body.category || 'tips',
      content: body.content || '',
      summary: body.summary || '',
      image: body.image || null,
      tags: body.tags || [],
      author: session.user?.name || '익명',
      discordId: session.discordId || null,
    }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/guides error:', error);
    return NextResponse.json({ error: 'Failed to create guide' }, { status: 500 });
  }
}
