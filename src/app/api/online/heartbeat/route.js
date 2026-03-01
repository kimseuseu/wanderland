import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  const session = await getSession();
  if (!session?.discordId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.execute(sql`
      INSERT INTO online_sessions (discord_id, username, avatar, last_seen)
      VALUES (${session.discordId}, ${session.user?.name || '???'}, ${session.user?.image || null}, NOW())
      ON CONFLICT (discord_id)
      DO UPDATE SET
        username = ${session.user?.name || '???'},
        avatar = ${session.user?.image || null},
        last_seen = NOW()
    `);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[heartbeat] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
