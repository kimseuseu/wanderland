import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const PRIMARY = process.env.DISCORD_GUILD_ID;
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

async function getAllNicknames() {
  if (cached && Date.now() - cacheTime < CACHE_TTL) return cached;

  // 봇이 속한 모든 서버 조회
  const guildsRes = await discordFetch('/users/@me/guilds');
  if (!guildsRes.ok) return {};
  const guilds = await guildsRes.json();

  // 주 서버 먼저, 나머지 뒤에 (주 서버 닉네임 우선)
  const sorted = guilds.sort((a, b) => {
    if (a.id === PRIMARY) return -1;
    if (b.id === PRIMARY) return 1;
    return 0;
  });

  const nicknameMap = {}; // { discordId: displayName }

  for (const guild of sorted) {
    let after = '0';
    while (true) {
      const res = await discordFetch(`/guilds/${guild.id}/members?limit=1000&after=${after}`);
      if (!res.ok) break;
      const batch = await res.json();
      if (!batch.length) break;

      for (const m of batch) {
        if (m.user.bot) continue;
        const uid = m.user.id;
        const displayName = m.nick || m.user.global_name || m.user.username;
        // 주 서버(PRIMARY)가 먼저 처리되므로, 이미 있으면 덮어쓰지 않음
        if (!nicknameMap[uid]) {
          nicknameMap[uid] = displayName;
        }
      }

      if (batch.length < 1000) break;
      after = batch[batch.length - 1].user.id;
    }
  }

  cached = nicknameMap;
  cacheTime = Date.now();
  return nicknameMap;
}

export async function GET() {
  if (!BOT_TOKEN) {
    return NextResponse.json({});
  }

  try {
    const map = await getAllNicknames();
    return NextResponse.json(map);
  } catch (error) {
    console.error('[nicknames] Error:', error);
    return NextResponse.json({});
  }
}
