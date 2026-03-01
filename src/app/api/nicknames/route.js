import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const PRIMARY = process.env.DISCORD_GUILD_ID;
const DISCORD_API = 'https://discord.com/api/v10';

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

  const guildsRes = await discordFetch('/users/@me/guilds');
  if (!guildsRes.ok) return { byId: {}, byName: {} };
  const guilds = await guildsRes.json();

  const sorted = guilds.sort((a, b) => {
    if (a.id === PRIMARY) return -1;
    if (b.id === PRIMARY) return 1;
    return 0;
  });

  const byId = {};         // { discordId: displayName }
  const priorityMap = {};   // { discordId: priority }
  const userNames = {};     // { discordId: [username, globalName, ...] } — 역조회용 raw 이름들

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

        if (!byId[uid] || priority > (priorityMap[uid] || 0)) {
          byId[uid] = displayName;
          priorityMap[uid] = priority;
        }

        // 역조회용: 이 유저의 모든 이름 변형 수집
        if (!userNames[uid]) userNames[uid] = new Set();
        if (m.user.username) userNames[uid].add(m.user.username.toLowerCase());
        if (m.user.global_name) userNames[uid].add(m.user.global_name.toLowerCase());
        if (m.nick) userNames[uid].add(m.nick.toLowerCase());
      }

      if (batch.length < 1000) break;
      after = batch[batch.length - 1].user.id;
    }
  }

  // byName 역조회 맵: 저장된 이름(username/global_name/nick) → 최종 displayName
  const byName = {};
  for (const [uid, names] of Object.entries(userNames)) {
    const displayName = byId[uid];
    for (const name of names) {
      // 이미 있으면 덮어쓰지 않음 (먼저 발견된 것 우선)
      if (!byName[name]) {
        byName[name] = displayName;
      }
    }
  }

  cached = { byId, byName };
  cacheTime = Date.now();
  return cached;
}

export async function GET() {
  if (!BOT_TOKEN) {
    return NextResponse.json({ byId: {}, byName: {} });
  }

  try {
    const data = await getAllNicknames();
    // Set을 JSON으로 직렬화할 수 없으므로 이미 plain object
    return NextResponse.json(data);
  } catch (error) {
    console.error('[nicknames] Error:', error);
    return NextResponse.json({ byId: {}, byName: {} });
  }
}
