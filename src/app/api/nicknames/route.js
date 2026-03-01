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

/**
 * 닉네임 우선순위:
 *  3 = 주 서버 서버 닉네임 (최우선)
 *  2 = 다른 서버 서버 닉네임
 *  1 = 글로벌 이름 / 유저네임 (최하위)
 */
async function getAllNicknames() {
  if (cached && Date.now() - cacheTime < CACHE_TTL) return cached;

  const guildsRes = await discordFetch('/users/@me/guilds');
  if (!guildsRes.ok) return {};
  const guilds = await guildsRes.json();

  // 주 서버 먼저 처리
  const sorted = guilds.sort((a, b) => {
    if (a.id === PRIMARY) return -1;
    if (b.id === PRIMARY) return 1;
    return 0;
  });

  const nicknameMap = {};  // { discordId: displayName }
  const priorityMap = {};  // { discordId: priority }

  for (const guild of sorted) {
    const isPrimary = guild.id === PRIMARY;
    let after = '0';

    while (true) {
      const res = await discordFetch(`/guilds/${guild.id}/members?limit=1000&after=${after}`);
      if (!res.ok) break;
      const batch = await res.json();
      if (!batch.length) break;

      for (const m of batch) {
        if (m.user.bot) continue;
        const uid = m.user.id;
        const hasNick = !!m.nick;
        const displayName = m.nick || m.user.global_name || m.user.username;
        const priority = hasNick ? (isPrimary ? 3 : 2) : 1;

        if (!nicknameMap[uid] || priority > (priorityMap[uid] || 0)) {
          nicknameMap[uid] = displayName;
          priorityMap[uid] = priority;
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
