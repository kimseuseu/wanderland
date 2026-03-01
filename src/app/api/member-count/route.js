import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_API = 'https://discord.com/api/v10';

// 5분 캐시
let cached = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

function discordFetch(path) {
  return fetch(`${DISCORD_API}${path}`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  });
}

// 특정 길드의 멤버 목록 가져오기 (봇 제외, user.id 반환)
async function getGuildMemberIds(guildId) {
  const ids = new Set();
  let after = '0';
  while (true) {
    const res = await discordFetch(`/guilds/${guildId}/members?limit=1000&after=${after}`);
    if (!res.ok) break;
    const batch = await res.json();
    if (!batch.length) break;
    for (const m of batch) {
      if (!m.user.bot) ids.add(m.user.id);
    }
    if (batch.length < 1000) break;
    after = batch[batch.length - 1].user.id;
  }
  return ids;
}

async function getMemberCount() {
  if (cached !== null && Date.now() - cacheTime < CACHE_TTL) return cached;

  // 봇이 속한 모든 서버 가져오기
  const guildsRes = await discordFetch('/users/@me/guilds');
  if (!guildsRes.ok) return 0;
  const guilds = await guildsRes.json();

  // 모든 서버에서 멤버 수집 (유저 ID 기준 중복 제거)
  const allUserIds = new Set();
  await Promise.all(
    guilds.map(async (g) => {
      const ids = await getGuildMemberIds(g.id);
      for (const id of ids) allUserIds.add(id);
    })
  );

  const count = allUserIds.size;
  cached = count;
  cacheTime = Date.now();
  return count;
}

export async function GET() {
  if (!BOT_TOKEN) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await getMemberCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('[member-count] Error:', error);
    return NextResponse.json({ count: 0 });
  }
}
