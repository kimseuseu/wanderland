import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const PRIMARY = process.env.DISCORD_GUILD_ID;

/** 봇이 들어가 있는 서버 ID 목록을 Discord API로 자동 조회 (5분 캐시) */
let _botGuildsCache = null;
let _botGuildsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5분

async function getBotGuildIds() {
  if (!BOT_TOKEN) return [PRIMARY].filter(Boolean);

  const now = Date.now();
  if (_botGuildsCache && now - _botGuildsCacheTime < CACHE_TTL) {
    return _botGuildsCache;
  }

  try {
    const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    });
    if (res.ok) {
      const guilds = await res.json();
      _botGuildsCache = guilds.map((g) => g.id);
      _botGuildsCacheTime = now;
      return _botGuildsCache;
    }
  } catch { /* fallback */ }

  // API 실패 시 env fallback
  return [PRIMARY].filter(Boolean);
}

/** 봇 토큰으로 특정 서버의 멤버 닉네임 조회 */
async function fetchMemberInfo(guildId, userId) {
  if (!BOT_TOKEN || !guildId || !userId) return null;
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
    );
    if (!res.ok) return null;
    const member = await res.json();
    return {
      nick: member.nick || null,
      globalName: member.user?.global_name || null,
      username: member.user?.username || null,
    };
  } catch {
    return null;
  }
}

/**
 * 다중 서버에서 닉네임 우선순위 결정
 * 1. 주 서버 서버 닉네임 (최우선)
 * 2. 다른 서버 서버 닉네임
 * 3. 글로벌 이름 / 유저네임 (최하위)
 */
async function resolveNickname(matchedGuildIds, userId, fallbackUsername) {
  const sorted = [...matchedGuildIds].sort((a, b) => {
    const p = (id) => (id === PRIMARY ? 0 : 1);
    return p(a) - p(b);
  });

  let bestNick = null;
  let bestGuildId = sorted[0] || null;
  let globalName = null;

  for (const guildId of sorted) {
    const info = await fetchMemberInfo(guildId, userId);
    if (!info) continue;

    // 서버 닉네임이 있으면 즉시 사용 (주 서버 먼저 처리되므로 주 서버 우선)
    if (info.nick) {
      return { nickname: info.nick, guildId };
    }

    // 글로벌 이름 백업 (첫 번째로 발견된 것 사용)
    if (!globalName) {
      globalName = info.globalName || info.username;
    }
  }

  return { nickname: globalName || fallbackUsername, guildId: bestGuildId };
}

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'identify guilds',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.discordId = profile?.id;
        token.avatar = profile?.avatar;
        token.username = profile?.global_name || profile?.username;

        try {
          // 1. 유저가 속한 서버 목록 (OAuth)
          const res = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${account.access_token}` },
          });

          if (res.ok) {
            const userGuilds = await res.json();
            const userGuildIds = new Set(userGuilds.map((g) => g.id));
            const botGuildIds = await getBotGuildIds();

            // 2. 봇 서버 ∩ 유저 서버 = 매칭된 서버
            const matchedGuildIds = botGuildIds.filter((id) => userGuildIds.has(id));
            token.isMember = matchedGuildIds.length > 0;

            // 3. 매칭된 서버 중 하나라도 관리자면 isAdmin
            if (token.isMember) {
              token.isAdmin = matchedGuildIds.some((botGuildId) => {
                const guild = userGuilds.find((g) => g.id === botGuildId);
                if (!guild) return false;
                if (guild.owner) return true;
                const perms = BigInt(guild.permissions || '0');
                // ADMINISTRATOR(0x8) 또는 MANAGE_GUILD(0x20)
                const isAdm = (perms & BigInt(0x8)) !== BigInt(0) || (perms & BigInt(0x20)) !== BigInt(0);
                console.log(`[auth] guild=${guild.name} owner=${guild.owner} perms=${guild.permissions} isAdmin=${isAdm}`);
                return isAdm;
              });
              console.log(`[auth] user=${token.username} isAdmin=${token.isAdmin}`);
            } else {
              token.isAdmin = false;
            }

            // 4. 서버 닉네임 가져오기 (멤버인 경우만)
            if (token.isMember && token.discordId) {
              const { nickname, guildId } = await resolveNickname(
                matchedGuildIds,
                token.discordId,
                token.username
              );
              token.username = nickname;
              token.guildId = guildId;
            }
          } else {
            token.isMember = false;
            token.isAdmin = false;
          }
        } catch {
          token.isMember = false;
          token.isAdmin = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.isMember = token.isMember ?? false;
      session.isAdmin = token.isAdmin ?? false;
      session.discordId = token.discordId;
      session.guildId = token.guildId || null;
      session.user.image = token.avatar
        ? `https://cdn.discordapp.com/avatars/${token.discordId}/${token.avatar}.png`
        : null;
      session.user.name = token.username || session.user.name;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
