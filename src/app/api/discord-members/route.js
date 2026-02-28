import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_API = 'https://discord.com/api/v10';

// ── Cache (2분 TTL) ──
const cache = new Map();
const CACHE_TTL = 2 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
  return null;
}
function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

function discordFetch(path) {
  return fetch(`${DISCORD_API}${path}`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  });
}

// ── 봇이 속한 서버 목록 ──
async function getGuilds() {
  const cached = getCached('guilds');
  if (cached) return cached;

  const res = await discordFetch('/users/@me/guilds');
  if (!res.ok) return [];
  const guilds = await res.json();

  // 각 서버 상세 정보 (이름, 아이콘, 멤버 수)
  const infos = await Promise.all(
    guilds.map(async (g) => {
      const r = await discordFetch(`/guilds/${g.id}?with_counts=true`);
      if (!r.ok) return null;
      const info = await r.json();
      return {
        id: info.id,
        name: info.name,
        icon: info.icon
          ? `https://cdn.discordapp.com/icons/${info.id}/${info.icon}.png?size=64`
          : null,
        memberCount: info.approximate_member_count || 0,
      };
    })
  );

  const result = infos.filter(Boolean);
  setCache('guilds', result);
  return result;
}

// ── 특정 서버 멤버 목록 (봇 제외) ──
async function getMembers(guildId) {
  const cacheKey = `members:${guildId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // 멤버 전체 가져오기 (1000명 단위 페이지네이션)
  let allMembers = [];
  let after = '0';
  while (true) {
    const res = await discordFetch(`/guilds/${guildId}/members?limit=1000&after=${after}`);
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[discord-members] Failed to fetch members for ${guildId}: ${res.status} ${errText}`);
      break;
    }
    const batch = await res.json();
    if (!batch.length) break;
    allMembers = allMembers.concat(batch);
    if (batch.length < 1000) break;
    after = batch[batch.length - 1].user.id;
  }

  // 역할 정보
  const rolesRes = await discordFetch(`/guilds/${guildId}/roles`);
  const roles = rolesRes.ok ? await rolesRes.json() : [];

  const roleMap = {};
  for (const r of roles) {
    if (r.name === '@everyone') continue;
    roleMap[r.id] = {
      id: r.id,
      name: r.name,
      color: r.color === 0 ? null : `#${r.color.toString(16).padStart(6, '0')}`,
      position: r.position,
    };
  }

  // 봇 제외, 데이터 정리
  const members = allMembers
    .filter((m) => !m.user.bot)
    .map((m) => ({
      id: m.user.id,
      username: m.user.username,
      displayName: m.nick || m.user.global_name || m.user.username,
      avatar: m.user.avatar
        ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png?size=64`
        : null,
      roles: m.roles
        .map((rid) => roleMap[rid])
        .filter(Boolean)
        .sort((a, b) => b.position - a.position),
      joinedAt: m.joined_at,
    }))
    .sort((a, b) => {
      // 역할 position 높은 순 → 이름순
      const aPos = a.roles[0]?.position ?? -1;
      const bPos = b.roles[0]?.position ?? -1;
      if (bPos !== aPos) return bPos - aPos;
      return a.displayName.localeCompare(b.displayName);
    });

  const result = { members, roles: Object.values(roleMap).sort((a, b) => b.position - a.position) };
  setCache(cacheKey, result);
  return result;
}

export async function GET(req) {
  const { requireMember } = await import('@/lib/auth');
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    if (action === 'guilds') {
      const guilds = await getGuilds();
      return NextResponse.json(guilds);
    }

    if (action === 'members') {
      const guildId = searchParams.get('guildId');
      if (!guildId) {
        return NextResponse.json({ error: 'guildId required' }, { status: 400 });
      }

      // 봇이 해당 서버에 있는지 확인
      const guilds = await getGuilds();
      if (!guilds.some((g) => g.id === guildId)) {
        return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
      }

      const data = await getMembers(guildId);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[discord-members] Error:', error);
    return NextResponse.json({ error: 'Discord API error' }, { status: 502 });
  }
}
