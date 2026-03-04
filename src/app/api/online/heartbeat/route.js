import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST(request) {
  try {
    const token = await getToken({ req: request });
    if (!token?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const username = token.username || token.name || '???';
    const avatar = token.avatar
      ? `https://cdn.discordapp.com/avatars/${token.discordId}/${token.avatar}.png`
      : null;

    await db.execute(sql`
      INSERT INTO online_sessions (discord_id, username, avatar, last_seen)
      VALUES (${token.discordId}, ${username}, ${avatar}, NOW())
      ON CONFLICT (discord_id)
      DO UPDATE SET
        username = ${username},
        avatar = ${avatar},
        last_seen = NOW()
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[heartbeat] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
