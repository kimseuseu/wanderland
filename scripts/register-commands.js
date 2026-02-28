/**
 * Discord 슬래시 커맨드 등록 스크립트 (글로벌)
 *
 * 사용법:
 *   node scripts/register-commands.js
 *
 * 필요한 환경변수 (.env.local 또는 시스템 환경변수):
 *   DISCORD_APP_ID    - Discord 애플리케이션 ID
 *   DISCORD_BOT_TOKEN - Discord 봇 토큰
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

async function main() {
  const { DISCORD_APP_ID, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_BOT_GUILD_ID_2 } = process.env;

  if (!DISCORD_APP_ID || !DISCORD_BOT_TOKEN) {
    console.error('❌ DISCORD_APP_ID와 DISCORD_BOT_TOKEN 환경변수가 필요합니다.');
    process.exit(1);
  }

  console.log('🤖 Discord 글로벌 커맨드 등록을 시작합니다...\n');

  // ── 1. 글로벌 커맨드 등록 (봇이 있는 모든 서버에 적용) ──
  const globalUrl = `${DISCORD_API}/applications/${DISCORD_APP_ID}/commands`;

  console.log('[글로벌] 커맨드 등록 중...');
  const res = await fetch(globalUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify([BLACKLIST_CHANNEL_COMMAND, BLACKLIST_COMMAND]),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`[글로벌] ❌ 등록 실패 (${res.status}):`, error);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`[글로벌] ✅ ${data.length}개 커맨드 등록 완료`);
  for (const cmd of data) {
    console.log(`  - /${cmd.name}: ${cmd.description}`);
  }

  // ── 2. 기존 길드 커맨드 정리 (중복 방지) ──
  const guildIds = [DISCORD_GUILD_ID, DISCORD_BOT_GUILD_ID_2].filter(Boolean);
  for (const guildId of guildIds) {
    const guildUrl = `${DISCORD_API}/applications/${DISCORD_APP_ID}/guilds/${guildId}/commands`;
    console.log(`\n[길드 ${guildId}] 기존 길드 커맨드 정리 중...`);
    const guildRes = await fetch(guildUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
      body: JSON.stringify([]), // 빈 배열 = 길드 커맨드 전부 삭제
    });
    if (guildRes.ok) {
      console.log(`[길드 ${guildId}] ✅ 길드 커맨드 정리 완료`);
    } else {
      console.log(`[길드 ${guildId}] ⚠️ 정리 실패 (${guildRes.status}) — 무시하고 진행`);
    }
  }

  console.log('\n✨ 완료! (글로벌 커맨드는 반영까지 최대 1시간 소요될 수 있습니다)');
}

main().catch((err) => {
  console.error('스크립트 실행 중 오류:', err);
  process.exit(1);
});
