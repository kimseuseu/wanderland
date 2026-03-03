const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

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
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile();

// ══════════════════════════════════════════════════════════
// 무한의꿈 (Endless Dream) POI 데이터
// 드림존 보스는 동적 스폰이지만, 기존 인프라(사일로/모노리스) 근처에 출현
// 영면의 킨 → 사일로 근처, 깊이 잠든 자 → 모노리스/워프타워 근처
// 얕게 잠든 자 → 필드 전역 (동적, 대표 위치만 표시)
// ══════════════════════════════════════════════════════════

const S = 'endless_dream';

const ENDLESS_DATA = [
  // ═══════════════════════════════════════════════
  // 영면의 킨 (group: creatures, category: eternal_kin)
  // 사일로 근처 스폰 — 1000 자각의 모래 필요
  // ═══════════════════════════════════════════════
  // — 남부 (터치오브스카이 지역) —
  { category: 'eternal_kin', group: 'creatures', label: '영면의 킨 (사일로 시그마)', x: 4900, y: -5422, note: '1000 자각의 모래 · 사일로 시그마 부근 · 동적 스폰', scenario: S },
  { category: 'eternal_kin', group: 'creatures', label: '영면의 킨 (사일로 파이)', x: 5142, y: -2943, note: '1000 자각의 모래 · 사일로 파이 부근 · 동적 스폰', scenario: S },
  { category: 'eternal_kin', group: 'creatures', label: '영면의 킨 (사일로 EX1)', x: 2144, y: -6503, note: '1000 자각의 모래 · 사일로 EX1 부근 · 동적 스폰', scenario: S },
  { category: 'eternal_kin', group: 'creatures', label: '영면의 킨 (사일로 알파)', x: 145, y: -3615, note: '1000 자각의 모래 · 사일로 알파 부근 · 동적 스폰', scenario: S },
  { category: 'eternal_kin', group: 'creatures', label: '영면의 킨 (사일로 세타)', x: 5485, y: -520, note: '1000 자각의 모래 · 사일로 세타 부근 · 동적 스폰', scenario: S },
  { category: 'eternal_kin', group: 'creatures', label: '영면의 킨 (사일로 프사이)', x: 2490, y: -2570, note: '1000 자각의 모래 · 사일로 프사이 부근 · 동적 스폰', scenario: S },

  // — 북부 (혹독한 겨울 지역) —
  { category: 'eternal_kin', group: 'creatures', label: '영면의 킨 (사일로 델타)', x: 3525, y: 3898, note: '1000 자각의 모래 · 사일로 델타 부근 · 동적 스폰', scenario: S },
  { category: 'eternal_kin', group: 'creatures', label: '영면의 킨 (사일로 스티그마)', x: 4197, y: 4600, note: '1000 자각의 모래 · 사일로 스티그마 부근 · 동적 스폰', scenario: S },
  { category: 'eternal_kin', group: 'creatures', label: '영면의 킨 (사일로 타우)', x: -500, y: 5800, note: '1000 자각의 모래 · 사일로 타우 부근 · 동적 스폰', scenario: S },
  { category: 'eternal_kin', group: 'creatures', label: '영면의 킨 (사일로 페이)', x: -218, y: 6004, note: '1000 자각의 모래 · 사일로 페이 부근 · 동적 스폰', scenario: S },

  // ═══════════════════════════════════════════════
  // 깊이 잠든 자 (group: creatures, category: deep_dreamer)
  // 모노리스/워프타워 근처 스폰 — 100 자각의 모래 필요
  // ═══════════════════════════════════════════════
  // — 남부 모노리스 부근 —
  { category: 'deep_dreamer', group: 'creatures', label: '깊이 잠든 자 (가이아 절벽)', x: 4584, y: -6024, note: '100 자각의 모래 · 가이아 절벽 모노리스 부근 · 동적 스폰', scenario: S },
  { category: 'deep_dreamer', group: 'creatures', label: '깊이 잠든 자 (탐욕의)', x: 5990, y: -4728, note: '100 자각의 모래 · 탐욕의 모노리스 부근 · 동적 스폰', scenario: S },
  { category: 'deep_dreamer', group: 'creatures', label: '깊이 잠든 자 (신기루)', x: 6554, y: -2942, note: '100 자각의 모래 · 신기루 모노리스 부근 · 동적 스폰', scenario: S },
  { category: 'deep_dreamer', group: 'creatures', label: '깊이 잠든 자 (송곳니)', x: 1831, y: -4733, note: '100 자각의 모래 · 송곳니 모노리스 부근 · 동적 스폰', scenario: S },
  { category: 'deep_dreamer', group: 'creatures', label: '깊이 잠든 자 (잊혀진)', x: 1905, y: -1508, note: '100 자각의 모래 · 잊혀진 모노리스 부근 · 동적 스폰', scenario: S },

  // — 북부 모노리스 부근 —
  { category: 'deep_dreamer', group: 'creatures', label: '깊이 잠든 자 (툰드라)', x: 2559, y: 4491, note: '100 자각의 모래 · 툰드라 모노리스 부근 · 동적 스폰', scenario: S },
  { category: 'deep_dreamer', group: 'creatures', label: '깊이 잠든 자 (눈사태)', x: 105, y: 4388, note: '100 자각의 모래 · 눈사태 모노리스 부근 · 동적 스폰', scenario: S },
  { category: 'deep_dreamer', group: 'creatures', label: '깊이 잠든 자 (플레임 더스트)', x: -3831, y: 2447, note: '100 자각의 모래 · 플레임 더스트 모노리스 부근 · 동적 스폰', scenario: S },

  // ═══════════════════════════════════════════════
  // 얕게 잠든 자 (group: creatures, category: light_dreamer)
  // 필드 전역 동적 스폰 — 50 자각의 모래 필요
  // 대표 지역 거점만 표시 (실제로는 700+ 위치에서 랜덤 출현)
  // ═══════════════════════════════════════════════
  // — 남부 대표 위치 —
  { category: 'light_dreamer', group: 'creatures', label: '얕게 잠든 자 (무너진 삼각주)', x: 5200, y: -6200, note: '50 자각의 모래 · 무너진 삼각주 필드 · 동적 스폰', scenario: S },
  { category: 'light_dreamer', group: 'creatures', label: '얕게 잠든 자 (데이턴 습지)', x: 6400, y: -5000, note: '50 자각의 모래 · 데이턴 습지 필드 · 동적 스폰', scenario: S },
  { category: 'light_dreamer', group: 'creatures', label: '얕게 잠든 자 (아이언 리버)', x: 5800, y: -3200, note: '50 자각의 모래 · 아이언 리버 필드 · 동적 스폰', scenario: S },
  { category: 'light_dreamer', group: 'creatures', label: '얕게 잠든 자 (초크 피크)', x: 1500, y: -5000, note: '50 자각의 모래 · 초크 피크 필드 · 동적 스폰', scenario: S },
  { category: 'light_dreamer', group: 'creatures', label: '얕게 잠든 자 (레드 샌드)', x: 4500, y: -1700, note: '50 자각의 모래 · 레드 샌드 필드 · 동적 스폰', scenario: S },

  // — 북부 대표 위치 —
  { category: 'light_dreamer', group: 'creatures', label: '얕게 잠든 자 (마노 툰드라)', x: 4000, y: 4800, note: '50 자각의 모래 · 마노 툰드라 필드 · 동적 스폰', scenario: S },
  { category: 'light_dreamer', group: 'creatures', label: '얕게 잠든 자 (비너 피오르드)', x: 0, y: 5500, note: '50 자각의 모래 · 비너 피오르드 필드 · 동적 스폰', scenario: S },
  { category: 'light_dreamer', group: 'creatures', label: '얕게 잠든 자 (잿더미 해변)', x: -5000, y: 4000, note: '50 자각의 모래 · 잿더미 해변 필드 · 동적 스폰', scenario: S },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('[seed-endless] DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Remove old Endless Dream data
  const existing = await sql`SELECT COUNT(*) as count FROM pois WHERE scenario = 'endless_dream'`;
  if (parseInt(existing[0].count) > 0) {
    console.log(`[seed-endless] Clearing ${existing[0].count} existing Endless Dream POIs...`);
    await sql`DELETE FROM pois WHERE scenario = 'endless_dream'`;
  }

  let inserted = 0;
  for (const poi of ENDLESS_DATA) {
    try {
      await sql`
        INSERT INTO pois (category, "group", label, x, y, note, scenario)
        VALUES (${poi.category}, ${poi.group}, ${poi.label}, ${poi.x}, ${poi.y}, ${poi.note || null}, ${poi.scenario || null})
      `;
      inserted++;
    } catch (err) {
      console.error(`[seed-endless] Failed to insert "${poi.label}":`, err.message);
    }
  }

  console.log(`[seed-endless] Inserted ${inserted}/${ENDLESS_DATA.length} Endless Dream POIs`);

  // Print full summary
  const summary = await sql`
    SELECT scenario, category, COUNT(*) as count
    FROM pois
    GROUP BY scenario, category
    ORDER BY scenario, category
  `;
  console.log('\n[seed-endless] Full POI Summary:');
  let total = 0;
  for (const row of summary) {
    console.log(`  ${row.scenario} / ${row.category}: ${row.count}`);
    total += parseInt(row.count);
  }
  console.log(`Total: ${total}`);
}

seed().catch((err) => {
  console.error('[seed-endless] Fatal error:', err);
  process.exit(1);
});
