import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  const { requireMember } = await import('@/lib/auth');
  const session = await requireMember();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { db } = await import('@/db');
    const { pinFavorites } = await import('@/db/schema');
    const rows = await db.select().from(pinFavorites).where(eq(pinFavorites.discordId, session.discordId));
    return NextResponse.json(rows.map((r) => r.pinId));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req) {
  const { requireMember } = await import('@/lib/auth');
  const session = await requireMember();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { db } = await import('@/db');
    const { pinFavorites } = await import('@/db/schema');
    const { pinId } = await req.json();

    // Check if already favorited
    const existing = await db.select().from(pinFavorites).where(
      and(eq(pinFavorites.discordId, session.discordId), eq(pinFavorites.pinId, pinId))
    );

    if (existing.length > 0) {
      // Remove favorite
      await db.delete(pinFavorites).where(
        and(eq(pinFavorites.discordId, session.discordId), eq(pinFavorites.pinId, pinId))
      );
      return NextResponse.json({ favorited: false });
    } else {
      // Add favorite
      await db.insert(pinFavorites).values({ discordId: session.discordId, pinId });
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error('POST /api/pin-favorites error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
