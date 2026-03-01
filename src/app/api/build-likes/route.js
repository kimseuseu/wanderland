import { db } from '@/db';
import { buildLikes } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

// 로그인한 유저의 좋아요 빌드 ID 목록
export async function GET() {
  const session = await getSession();
  if (!session?.discordId) {
    return NextResponse.json({ ids: [] });
  }

  try {
    const rows = await db.select({ buildId: buildLikes.buildId })
      .from(buildLikes)
      .where(eq(buildLikes.discordId, session.discordId));

    return NextResponse.json({ ids: rows.map((r) => r.buildId) });
  } catch (error) {
    console.error('[build-likes] Error:', error);
    return NextResponse.json({ ids: [] });
  }
}
