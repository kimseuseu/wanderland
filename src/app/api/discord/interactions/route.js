import { NextResponse } from 'next/server';

// Discord interaction types
const INTERACTION_TYPE = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MODAL_SUBMIT: 5,
};

// Discord response types
const RESPONSE_TYPE = {
  PONG: 1,
  CHANNEL_MESSAGE: 4,
  MODAL: 9,
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

function isAllowedChannel(channelId) {
  const allowed = process.env.DISCORD_BOT_CHANNEL_IDS;
  if (!allowed) return true;
  return allowed.split(',').map(id => id.trim()).includes(channelId);
}

function isAllowedGuild(guildId) {
  const guilds = [
    process.env.DISCORD_GUILD_ID,
    process.env.DISCORD_BOT_GUILD_ID_2,
  ].filter(Boolean);
  if (guilds.length === 0) return true; // 환경변수 미설정시 모든 서버 허용
  return guilds.includes(guildId);
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
 * Build modal response object
 */
function buildModalData() {
  return {
    type: RESPONSE_TYPE.MODAL,
    data: {
      custom_id: 'blacklist_form',
      title: '블랙리스트 등록',
      components: [
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: 'name',
            label: '이름 (필수)',
            style: 1,
            required: true,
            placeholder: '블랙리스트 대상 이름',
            max_length: 100,
          }],
        },
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: 'uuid',
            label: 'UUID',
            style: 1,
            required: false,
            placeholder: 'OH-XXXXX-KR',
            max_length: 100,
          }],
        },
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: 'clan_alts',
            label: '소속 클랜 / 부캐',
            style: 1,
            required: false,
            placeholder: '클랜명 / 부캐1, 부캐2',
            max_length: 200,
          }],
        },
        {
          type: 1,
          components: [{
            type: 4,
            custom_id: 'incident',
            label: '사건 내용 (필수)',
            style: 2,
            required: true,
            placeholder: '어떤 사건이 있었는지 자세히 적어주세요',
            max_length: 1000,
          }],
        },
      ],
    },
  };
}

/**
 * /blacklist command → Open modal form
 */
function openBlacklistModal() {
  return NextResponse.json(buildModalData());
}

/**
 * Handle modal form submission → Save to DB
 */
async function handleModalSubmit(interaction) {
  const fields = {};
  for (const row of interaction.data.components) {
    for (const comp of row.components) {
      fields[comp.custom_id] = comp.value || '';
    }
  }

  const reporter = interaction.member?.user?.username
    || interaction.member?.nick
    || '디스코드 봇';

  // Parse clan and alts from combined field
  let clan = '';
  let alts = '';
  if (fields.clan_alts) {
    const parts = fields.clan_alts.split('/').map(s => s.trim());
    if (parts.length >= 2) {
      clan = parts[0];
      alts = parts.slice(1).join(', ');
    } else {
      clan = fields.clan_alts;
    }
  }

  try {
    const { db } = await import('@/db');
    const { blacklist } = await import('@/db/schema');

    const result = await db.insert(blacklist).values({
      name: fields.name,
      uuid: fields.uuid || '',
      alts,
      clan,
      incident: fields.incident || '',
      date: new Date().toISOString().split('T')[0],
      reporter,
    }).returning();

    const saved = result[0];

    return respond(
      `✅ **블랙리스트 #${saved.id} 등록 완료**\n\n` +
      `> **이름:** ${saved.name}\n` +
      (saved.uuid ? `> **UUID:** ${saved.uuid}\n` : '') +
      (saved.clan ? `> **클랜:** ${saved.clan}\n` : '') +
      (saved.alts ? `> **부캐:** ${saved.alts}\n` : '') +
      `> **사건:** ${saved.incident}\n` +
      `> **등록일:** ${saved.date}\n` +
      `> **등록자:** ${reporter}\n\n` +
      `📸 스크린샷을 추가하려면 \`/blacklist-image\` 명령어에 이미지를 첨부해주세요.`
    );
  } catch (error) {
    console.error('[Discord] blacklist save error:', error);
    return respond('❌ 블랙리스트 등록에 실패했습니다. 서버 오류가 발생했습니다.', true);
  }
}

/**
 * /blacklist-image command → Upload screenshot for a blacklist entry
 */
async function handleBlacklistImage(interaction) {
  const options = {};
  for (const opt of interaction.data.options || []) {
    options[opt.name] = opt.value;
  }

  const entryId = options.id;
  if (!entryId) {
    return respond('❌ 블랙리스트 번호(id)를 입력해주세요.', true);
  }

  // Get attachment URL from resolved data
  const attachmentId = options.image;
  const attachment = interaction.data.resolved?.attachments?.[attachmentId];
  if (!attachment?.url) {
    return respond('❌ 이미지를 첨부해주세요.', true);
  }

  // Check if it's an image
  if (!attachment.content_type?.startsWith('image/')) {
    return respond('❌ 이미지 파일만 첨부할 수 있습니다.', true);
  }

  try {
    const { db } = await import('@/db');
    const { blacklist } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');

    // Check if entry exists
    const existing = await db.select().from(blacklist).where(eq(blacklist.id, entryId));
    if (existing.length === 0) {
      return respond(`❌ 블랙리스트 #${entryId}을(를) 찾을 수 없습니다.`, true);
    }

    // Update with Discord CDN image URL
    await db.update(blacklist)
      .set({ image: attachment.url })
      .where(eq(blacklist.id, entryId));

    return respond(
      `📸 **블랙리스트 #${entryId}에 스크린샷이 추가되었습니다**\n\n` +
      `> **대상:** ${existing[0].name}\n` +
      `> **이미지:** [첨부됨](${attachment.url})`
    );
  } catch (error) {
    console.error('[Discord] blacklist image error:', error);
    return respond('❌ 이미지 추가에 실패했습니다.', true);
  }
}

/**
 * GET: 진단용 엔드포인트 - 환경변수 설정 상태 & 모달 JSON 확인
 */
export async function GET() {
  const envCheck = {
    DISCORD_PUBLIC_KEY: !!process.env.DISCORD_PUBLIC_KEY,
    DISCORD_APP_ID: !!process.env.DISCORD_APP_ID,
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID || '(not set)',
    DISCORD_BOT_GUILD_ID_2: process.env.DISCORD_BOT_GUILD_ID_2 || '(not set)',
    DISCORD_BOT_CHANNEL_IDS: process.env.DISCORD_BOT_CHANNEL_IDS || '(not set)',
    DATABASE_URL: !!process.env.DATABASE_URL,
  };

  return NextResponse.json({
    status: 'ok',
    env: envCheck,
    modalResponse: buildModalData(),
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
      // 디버깅용: 서명 실패 시에도 진행하되, 에러 메시지 반환
      // TODO: 디버깅 완료 후 401 반환으로 복원
      const parsed = JSON.parse(body);
      if (parsed.type === INTERACTION_TYPE.PING) {
        return NextResponse.json({ type: RESPONSE_TYPE.PONG });
      }
      return respond('⚠️ [디버그] 서명 검증 실패 - 관리자에게 문의하세요', true);
    }
    const interaction = JSON.parse(body);
    console.log('[Discord] type:', interaction.type);

    // PING
    if (interaction.type === INTERACTION_TYPE.PING) {
      return NextResponse.json({ type: RESPONSE_TYPE.PONG });
    }

    // Modal submit
    if (interaction.type === INTERACTION_TYPE.MODAL_SUBMIT) {
      console.log('[Discord] Modal submit:', interaction.data.custom_id);
      if (interaction.data.custom_id === 'blacklist_form') {
        return handleModalSubmit(interaction);
      }
      return respond('알 수 없는 폼입니다.', true);
    }

    // Slash commands
    if (interaction.type === INTERACTION_TYPE.APPLICATION_COMMAND) {
      const guildOk = isAllowedGuild(interaction.guild_id);
      const channelOk = isAllowedChannel(interaction.channel_id);
      console.log('[Discord] Guild:', interaction.guild_id, '→', guildOk, '| Channel:', interaction.channel_id, '→', channelOk);

      if (!guildOk) {
        return respond('❌ 이 서버에서는 사용할 수 없는 명령어입니다.', true);
      }
      if (!channelOk) {
        return respond('❌ 이 채널에서는 사용할 수 없습니다. 지정된 채널에서 사용해주세요.', true);
      }

      const { name } = interaction.data;
      console.log('[Discord] Command:', name);

      if (name === 'blacklist') {
        console.log('[Discord] Opening blacklist modal');
        return openBlacklistModal();
      }
      if (name === 'blacklist-image') {
        return handleBlacklistImage(interaction);
      }

      return respond('알 수 없는 명령어입니다.', true);
    }

    return respond('지원하지 않는 상호작용입니다.', true);
  } catch (e) {
    console.error('[Discord] Unhandled error:', e?.message, e?.stack);
    return respond('❌ 서버 오류가 발생했습니다: ' + (e?.message || 'Unknown'), true);
  }
}
