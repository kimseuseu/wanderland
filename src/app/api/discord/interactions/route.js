import { NextResponse } from 'next/server';
import nacl from 'tweetnacl';

// Discord interaction types
const INTERACTION_TYPE = {
  PING: 1,
  APPLICATION_COMMAND: 2,
};

// Discord interaction response types
const RESPONSE_TYPE = {
  PONG: 1,
  CHANNEL_MESSAGE: 4,
};

// Severity labels for display
const SEVERITY_LABELS = {
  low: '🟢 낮음',
  medium: '🟡 중간',
  high: '🔴 높음',
};

/**
 * Verify Discord interaction signature
 */
function verifyDiscordRequest(body, signature, timestamp) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey || !signature || !timestamp) return false;

  try {
    return nacl.sign.detached.verify(
      new TextEncoder().encode(timestamp + body),
      hexToUint8Array(signature),
      hexToUint8Array(publicKey)
    );
  } catch {
    return false;
  }
}

function hexToUint8Array(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Check if the interaction is from an allowed channel
 */
function isAllowedChannel(channelId) {
  const allowedChannels = process.env.DISCORD_BOT_CHANNEL_IDS;
  if (!allowedChannels) return true; // If not configured, allow all
  return allowedChannels.split(',').map(id => id.trim()).includes(channelId);
}

/**
 * Check if the interaction is from an allowed guild
 */
function isAllowedGuild(guildId) {
  const allowedGuilds = [
    process.env.DISCORD_GUILD_ID,
    process.env.DISCORD_BOT_GUILD_ID_2,
  ].filter(Boolean);
  return allowedGuilds.includes(guildId);
}

/**
 * Extract slash command options as a key-value object
 */
function getOptions(options = []) {
  const result = {};
  for (const opt of options) {
    result[opt.name] = opt.value;
  }
  return result;
}

/**
 * Handle blacklist add subcommand
 */
async function handleBlacklistAdd(interaction) {
  const subcommand = interaction.data.options?.[0];
  if (!subcommand || subcommand.name !== 'add') {
    return respond('알 수 없는 명령어입니다.');
  }

  const opts = getOptions(subcommand.options);
  const reporter = interaction.member?.user?.username
    || interaction.member?.nick
    || '디스코드 봇';

  if (!opts.name) {
    return respond('❌ 이름은 필수 항목입니다.');
  }

  try {
    const { db } = await import('@/db');
    const { blacklist } = await import('@/db/schema');

    const entry = {
      name: opts.name,
      uuid: opts.uuid || '',
      alts: opts.alts || '',
      clan: opts.clan || '',
      incident: opts.incident || '',
      severity: opts.severity || 'medium',
      date: opts.date || new Date().toISOString().split('T')[0],
      reporter: reporter,
    };

    const result = await db.insert(blacklist).values(entry).returning();
    const saved = result[0];
    const severityLabel = SEVERITY_LABELS[saved.severity] || saved.severity;

    return respond(
      `✅ **블랙리스트에 등록되었습니다**\n` +
      `\n` +
      `> **이름:** ${saved.name}\n` +
      (saved.uuid ? `> **UUID:** ${saved.uuid}\n` : '') +
      (saved.alts ? `> **부캐:** ${saved.alts}\n` : '') +
      (saved.clan ? `> **클랜:** ${saved.clan}\n` : '') +
      (saved.incident ? `> **사건:** ${saved.incident}\n` : '') +
      `> **심각도:** ${severityLabel}\n` +
      `> **등록일:** ${saved.date}\n` +
      `> **등록자:** ${reporter}`
    );
  } catch (error) {
    console.error('Discord blacklist add error:', error);
    return respond('❌ 블랙리스트 등록에 실패했습니다. 서버 오류가 발생했습니다.');
  }
}

/**
 * Create a Discord interaction response
 */
function respond(content, ephemeral = false) {
  return NextResponse.json({
    type: RESPONSE_TYPE.CHANNEL_MESSAGE,
    data: {
      content,
      flags: ephemeral ? 64 : 0, // 64 = EPHEMERAL
    },
  });
}

export async function POST(req) {
  // Read the raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get('x-signature-ed25519');
  const timestamp = req.headers.get('x-signature-timestamp');

  // Verify the request is from Discord
  if (!verifyDiscordRequest(body, signature, timestamp)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const interaction = JSON.parse(body);

  // Handle Discord PING (required for setting up the endpoint)
  if (interaction.type === INTERACTION_TYPE.PING) {
    return NextResponse.json({ type: RESPONSE_TYPE.PONG });
  }

  // Only handle application commands
  if (interaction.type !== INTERACTION_TYPE.APPLICATION_COMMAND) {
    return respond('지원하지 않는 상호작용입니다.', true);
  }

  // Check guild restriction
  if (!isAllowedGuild(interaction.guild_id)) {
    return respond('❌ 이 서버에서는 사용할 수 없는 명령어입니다.', true);
  }

  // Check channel restriction
  if (!isAllowedChannel(interaction.channel_id)) {
    return respond('❌ 이 채널에서는 사용할 수 없는 명령어입니다. 지정된 채널에서 사용해주세요.', true);
  }

  // Route commands
  const { name } = interaction.data;

  if (name === 'blacklist') {
    return handleBlacklistAdd(interaction);
  }

  return respond('알 수 없는 명령어입니다.', true);
}
