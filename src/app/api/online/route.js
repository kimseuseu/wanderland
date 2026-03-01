import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // 1시간 이내 활동 유저 조회
    const result = await db.execute(sql`
      SELECT discord_id, username, avatar, last_seen
      FROM online_sessions
      WHERE last_seen > NOW() - INTERVAL '1 hour'
      ORDER BY last_seen DESC
    `);

    // 2시간 이상 오래된 세션 정리
    db.execute(sql`
      DELETE FROM online_sessions
      WHERE last_seen < NOW() - INTERVAL '2 hours'
    `).catch(() => {});

    return NextResponse.json(result.rows || result);
  } catch (error) {
    console.error('[online] Error:', error);
    return NextResponse.json([]);
  }
}
