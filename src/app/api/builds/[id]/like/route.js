import { db } from '@/db';
import { builds, buildLikes } from '@/db/schema';
import { requireMember } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(req, { params }) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const buildId = parseInt(id);
    const discordId = session.discordId;

    // 이미 좋아요 했는지 확인
    const existing = await db.select()
      .from(buildLikes)
      .where(and(eq(buildLikes.buildId, buildId), eq(buildLikes.discordId, discordId)));

    let liked;
    if (existing.length > 0) {
      // 좋아요 취소
      await db.delete(buildLikes)
        .where(and(eq(buildLikes.buildId, buildId), eq(buildLikes.discordId, discordId)));
      await db.update(builds)
        .set({ likes: sql`GREATEST(COALESCE(${builds.likes}, 0) - 1, 0)` })
        .where(eq(builds.id, buildId));
      liked = false;
    } else {
      // 좋아요
      await db.insert(buildLikes).values({ discordId, buildId });
      await db.update(builds)
        .set({ likes: sql`COALESCE(${builds.likes}, 0) + 1` })
        .where(eq(builds.id, buildId));
      liked = true;
    }

    const result = await db.select().from(builds).where(eq(builds.id, buildId));
    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ likes: result[0].likes, liked });
  } catch (error) {
    console.error('POST /api/builds/[id]/like error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
