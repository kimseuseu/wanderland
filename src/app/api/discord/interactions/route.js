import { NextResponse } from 'next/server';

// Discord interaction types
const INTERACTION_TYPE = {
  PING: 1,
  APPLICATION_COMMAND: 2,
};

// Discord response types
const RESPONSE_TYPE = {
  PONG: 1,
  CHANNEL_MESSAGE: 4,
};

function hexToUint8Array(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function verifyDiscordRequest(body, signature, timestamp) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey || !signature || !timestamp) return false;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      hexToUint8Array(publicKey),
      { name: 'Ed25519' },
      false,
      ['verify']
    );
    return await crypto.subtle.verify(
      'Ed25519',
      key,
      hexToUint8Array(signature),
      new TextEncoder().encode(timestamp + body)
    );
  } catch (e) {
    console.error('[Discord] Verify error:', e);
    return false;
  }
}


function respond(content, ephemeral = false) {
  return NextResponse.json({
    type: RESPONSE_TYPE.CHANNEL_MESSAGE,
    data: {
      content,
      flags: ephemeral ? 64 : 0,
    },
  });
}

/**
 * DB에서 지정된 블랙리스트 채널 조회
 */
async function getDesignatedChannel(guildId, feature = 'blacklist') {
  try {
    const { db } = await import('@/db');
    const { botChannels } = await import('@/db/schema');
    const { eq, and } = await import('drizzle-orm');
    const rows = await db.select().from(botChannels).where(
      and(eq(botChannels.guildId, guildId), eq(botChannels.feature, feature))
    );
    return rows[0]?.channelId || null;
  } catch (e) {
    console.error('[Discord] getDesignatedChannel error:', e);
    return null;
  }
}

/**
 * /blacklist-channel → 현재 채널을 블랙리스트 검색 채널로 지정
 */
async function handleBlacklistChannel(interaction) {
  const guildId = interaction.guild_id;
  const channelId = interaction.channel_id;

  try {
    const { db } = await import('@/db');
    const { botChannels } = await import('@/db/schema');
    const { eq, and } = await import('drizzle-orm');

    // 기존 설정 확인
    const existing = await db.select().from(botChannels).where(
      and(eq(botChannels.guildId, guildId), eq(botChannels.feature, 'blacklist'))
    );

    if (existing.length > 0) {
      // 업데이트
      await db.update(botChannels)
        .set({ channelId })
        .where(eq(botChannels.id, existing[0].id));
    } else {
      // 새로 등록
      await db.insert(botChannels).values({
        guildId,
        channelId,
        feature: 'blacklist',
      });
    }

    return respond(`✅ <#${channelId}> 채널이 블랙리스트 검색 채널로 지정되었습니다.`);
  } catch (error) {
    console.error('[Discord] blacklist-channel error:', error);
    return respond('❌ 채널 지정에 실패했습니다.', true);
  }
}

/**
 * /blacklist <검색어> → 블랙리스트 DB 검색
 */
async function handleBlacklistSearch(interaction) {
  const guildId = interaction.guild_id;
  const channelId = interaction.channel_id;

  // 지정된 채널인지 확인
  const designatedChannel = await getDesignatedChannel(guildId);
  if (!designatedChannel) {
    return respond(
      '❌ 블랙리스트 검색 채널이 지정되지 않았습니다.\n' +
      '관리자가 `/blacklist-channel` 명령어로 채널을 지정해주세요.',
      true
    );
  }
  if (designatedChannel !== channelId) {
    return respond(
      `❌ 이 채널에서는 사용할 수 없습니다.\n<#${designatedChannel}> 채널에서 사용해주세요.`,
      true
    );
  }

  // 검색어 추출
  const query = interaction.data.options?.find(o => o.name === '검색어')?.value;
  if (!query || query.trim().length === 0) {
    return respond('❌ 검색어를 입력해주세요.', true);
  }

  const searchTerm = query.trim();

  try {
    const { db } = await import('@/db');
    const { blacklist } = await import('@/db/schema');
    const { ilike, or } = await import('drizzle-orm');

    const results = await db.select().from(blacklist).where(
      or(
        ilike(blacklist.name, `%${searchTerm}%`),
        ilike(blacklist.uuid, `%${searchTerm}%`),
        ilike(blacklist.clan, `%${searchTerm}%`),
        ilike(blacklist.alts, `%${searchTerm}%`),
      )
    ).limit(10);

    if (results.length === 0) {
      return respond(`🔍 **"${searchTerm}"** 검색 결과가 없습니다.`);
    }

    const displayCount = Math.min(results.length, 5);
    const lines = [`🔍 **"${searchTerm}"** 검색 결과 (${results.length}건)\n`];

    for (let i = 0; i < displayCount; i++) {
      const entry = results[i];
      lines.push(`━━━ #${entry.id} ━━━`);
      lines.push(`> **이름:** ${entry.name}`);
      if (entry.uuid) lines.push(`> **UUID:** ${entry.uuid}`);
      if (entry.clan) lines.push(`> **클랜:** ${entry.clan}`);
      if (entry.alts) lines.push(`> **부캐:** ${entry.alts}`);
      if (entry.incident) lines.push(`> **사건:** ${entry.incident}`);
      if (entry.date) lines.push(`> **등록일:** ${entry.date}`);
      if (entry.reporter) lines.push(`> **등록자:** ${entry.reporter}`);
      lines.push('');
    }

    if (results.length > 5) {
      lines.push(`외 ${results.length - 5}건 — 웹사이트에서 전체 목록을 확인하세요.`);
    }

    return respond(lines.join('\n'));
  } catch (error) {
    console.error('[Discord] blacklist search error:', error);
    return respond('❌ 검색 중 오류가 발생했습니다.', true);
  }
}

/**
 * GET: 진단용 엔드포인트
 */
export async function GET() {
  const envCheck = {
    DISCORD_PUBLIC_KEY: !!process.env.DISCORD_PUBLIC_KEY,
    DISCORD_APP_ID: !!process.env.DISCORD_APP_ID,
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID || '(not set)',
    DISCORD_BOT_GUILD_ID_2: process.env.DISCORD_BOT_GUILD_ID_2 || '(not set)',
    DATABASE_URL: !!process.env.DATABASE_URL,
  };

  return NextResponse.json({
    status: 'ok',
    env: envCheck,
    commands: ['blacklist-channel', 'blacklist'],
  });
}

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature-ed25519');
    const timestamp = req.headers.get('x-signature-timestamp');

    console.log('[Discord] POST received, body length:', body.length);

    const verified = await verifyDiscordRequest(body, signature, timestamp);
    console.log('[Discord] Signature verified:', verified);

    if (!verified) {
      const parsed = JSON.parse(body);
      if (parsed.type === INTERACTION_TYPE.PING) {
        return NextResponse.json({ type: RESPONSE_TYPE.PONG });
      }
      return respond('⚠️ 서명 검증 실패 — 관리자에게 문의하세요', true);
    }

    const interaction = JSON.parse(body);
    console.log('[Discord] type:', interaction.type);

    // PING
    if (interaction.type === INTERACTION_TYPE.PING) {
      return NextResponse.json({ type: RESPONSE_TYPE.PONG });
    }

    // Slash commands
    if (interaction.type === INTERACTION_TYPE.APPLICATION_COMMAND) {
      const { name } = interaction.data;
      console.log('[Discord] Command:', name);

      if (name === 'blacklist-channel') {
        return handleBlacklistChannel(interaction);
      }
      if (name === 'blacklist') {
        return handleBlacklistSearch(interaction);
      }

      return respond('알 수 없는 명령어입니다.', true);
    }

    return respond('지원하지 않는 상호작용입니다.', true);
  } catch (e) {
    console.error('[Discord] Unhandled error:', e?.message, e?.stack);
    return respond('❌ 서버 오류가 발생했습니다: ' + (e?.message || 'Unknown'), true);
  }
}
