/**
 * Discord 슬래시 커맨드 등록 스크립트
 *
 * 사용법:
 *   node scripts/register-commands.js
 *
 * 필요한 환경변수 (.env.local 또는 시스템 환경변수):
 *   DISCORD_APP_ID         - Discord 애플리케이션 ID
 *   DISCORD_BOT_TOKEN      - Discord 봇 토큰
 *   DISCORD_GUILD_ID       - 첫 번째 서버 ID
 *   DISCORD_BOT_GUILD_ID_2 - 두 번째 서버 ID (선택)
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually (no dotenv dependency)
function loadEnvFile() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let val = trimmed.slice(eqIndex + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvFile();

const DISCORD_API = 'https://discord.com/api/v10';

// /blacklist-channel → 관리자가 블랙리스트 검색 채널을 지정
const BLACKLIST_CHANNEL_COMMAND = {
  name: 'blacklist-channel',
  description: '이 채널을 블랙리스트 검색 채널로 지정합니다 (관리자 전용)',
};

// /blacklist <검색어> → 블랙리스트 DB 검색
const BLACKLIST_COMMAND = {
  name: 'blacklist',
  description: '블랙리스트를 검색합니다',
  options: [
    {
      name: '검색어',
      description: '이름, UUID, 클랜명 등',
      type: 3, // STRING
      required: true,
    },
  ],
};

async function registerCommandsForGuild(guildId, guildLabel) {
  const appId = process.env.DISCORD_APP_ID;
  const token = process.env.DISCORD_BOT_TOKEN;

  const url = `${DISCORD_API}/applications/${appId}/guilds/${guildId}/commands`;

  console.log(`[${guildLabel}] 서버 ${guildId}에 커맨드 등록 중...`);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${token}`,
    },
    body: JSON.stringify([BLACKLIST_CHANNEL_COMMAND, BLACKLIST_COMMAND]),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`[${guildLabel}] ❌ 등록 실패 (${res.status}):`, error);
    return false;
  }

  const data = await res.json();
  console.log(`[${guildLabel}] ✅ ${data.length}개 커맨드 등록 완료`);
  for (const cmd of data) {
    console.log(`  - /${cmd.name}: ${cmd.description}`);
  }
  return true;
}

async function main() {
  const { DISCORD_APP_ID, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_BOT_GUILD_ID_2 } = process.env;

  if (!DISCORD_APP_ID || !DISCORD_BOT_TOKEN) {
    console.error('❌ DISCORD_APP_ID와 DISCORD_BOT_TOKEN 환경변수가 필요합니다.');
    process.exit(1);
  }

  if (!DISCORD_GUILD_ID) {
    console.error('❌ DISCORD_GUILD_ID 환경변수가 필요합니다.');
    process.exit(1);
  }

  console.log('🤖 Discord 슬래시 커맨드 등록을 시작합니다...\n');

  // Register on first guild
  await registerCommandsForGuild(DISCORD_GUILD_ID, '서버 1');

  // Register on second guild if configured
  if (DISCORD_BOT_GUILD_ID_2) {
    await registerCommandsForGuild(DISCORD_BOT_GUILD_ID_2, '서버 2');
  } else {
    console.log('\n[서버 2] DISCORD_BOT_GUILD_ID_2가 설정되지 않아 건너뜁니다.');
  }

  console.log('\n✨ 완료!');
}

main().catch((err) => {
  console.error('스크립트 실행 중 오류:', err);
  process.exit(1);
});
