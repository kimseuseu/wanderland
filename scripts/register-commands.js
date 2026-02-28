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
    const val = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvFile();

const DISCORD_API = 'https://discord.com/api/v10';

const BLACKLIST_COMMAND = {
  name: 'blacklist',
  description: '블랙리스트 관리',
  options: [
    {
      name: 'add',
      description: '블랙리스트에 새 항목을 등록합니다',
      type: 1, // SUB_COMMAND
      options: [
        {
          name: 'name',
          description: '블랙리스트 대상 이름 (필수)',
          type: 3, // STRING
          required: true,
        },
        {
          name: 'incident',
          description: '사건 내용 (필수)',
          type: 3,
          required: true,
        },
        {
          name: 'uuid',
          description: '대상 UUID (예: OH-XXXXX-KR)',
          type: 3,
          required: false,
        },
        {
          name: 'severity',
          description: '심각도',
          type: 3,
          required: false,
          choices: [
            { name: '🟢 낮음 (low)', value: 'low' },
            { name: '🟡 중간 (medium)', value: 'medium' },
            { name: '🔴 높음 (high)', value: 'high' },
          ],
        },
        {
          name: 'alts',
          description: '부캐 이름 (쉼표로 구분)',
          type: 3,
          required: false,
        },
        {
          name: 'clan',
          description: '소속 클랜',
          type: 3,
          required: false,
        },
        {
          name: 'date',
          description: '사건 날짜 (YYYY-MM-DD, 미입력 시 오늘)',
          type: 3,
          required: false,
        },
      ],
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
    body: JSON.stringify([BLACKLIST_COMMAND]),
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
