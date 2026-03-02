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

// ── Way of Winter (혹독한 겨울) POI Data ──
const WOW_DATA = [
  // ═══════════════════════════════════════════════
  // MONOLITHS
  // ═══════════════════════════════════════════════
  { category: 'monolith', group: 'locations', label: '툰드라 모노리스', x: 2559, y: 4491, note: 'Lv.19 · Onyx Tundra', scenario: 'way_of_winter' },
  { category: 'monolith', group: 'locations', label: '눈사태 모노리스', x: 105, y: 4388, note: 'Lv.29 · Vena Fjord', scenario: 'way_of_winter' },
  { category: 'monolith', group: 'locations', label: '화진 모노리스', x: -3831, y: 2447, note: 'Lv.39 · Ember Strand', scenario: 'way_of_winter' },

  // ═══════════════════════════════════════════════
  // SILOS
  // ═══════════════════════════════════════════════
  { category: 'silo', group: 'locations', label: '사일로 Delta', x: 3525, y: 3898, note: 'Onyx Tundra · Great River 부근', scenario: 'way_of_winter' },
  { category: 'silo', group: 'locations', label: '사일로 EX1 (WoW)', x: 4197, y: 4600, note: 'Onyx Tundra · Moose City 남쪽', scenario: 'way_of_winter' },
  { category: 'silo', group: 'locations', label: '사일로 PSI (WoW)', x: -500, y: 5800, note: 'Vena Fjord · Whalebone 동쪽', scenario: 'way_of_winter' },
  { category: 'silo', group: 'locations', label: '사일로 08 (Taurus)', x: -218, y: 6004, note: 'Ember Strand', scenario: 'way_of_winter' },

  // ═══════════════════════════════════════════════
  // WORLDSTONES — Ember Strand (좌표 확인됨)
  // ═══════════════════════════════════════════════
  { category: 'worldstone', group: 'locations', label: 'Frost West 월드스톤', x: -3830, y: 5427, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Fire Throat East 월드스톤', x: -3867, y: 2417, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Firedust Monolith 월드스톤', x: -4279, y: 3365, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Sulfur Pool 월드스톤', x: -4845, y: 4634, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Fire Throat Rise 월드스톤', x: -5271, y: 5400, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Fire Throat North 월드스톤', x: -5176, y: 6335, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Ripe Land 월드스톤', x: -5960, y: 5089, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Ashenton 월드스톤', x: -5702, y: 4256, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Fire Throat Base 월드스톤', x: -5983, y: 3085, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Blazewind 월드스톤', x: -7435, y: 3745, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Silentfire 월드스톤', x: -6441, y: 6850, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Snakeye Pass 월드스톤', x: -5552, y: 7097, note: 'Ember Strand', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Snakebelly 월드스톤', x: -4637, y: 6709, note: 'Ember Strand', scenario: 'way_of_winter' },

  // ═══════════════════════════════════════════════
  // WORLDSTONES — Onyx Tundra (추정 좌표)
  // ═══════════════════════════════════════════════
  { category: 'worldstone', group: 'locations', label: 'East Blackstone 월드스톤', x: 6186, y: 4160, note: 'Onyx Tundra', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Tundra Monolith 월드스톤', x: 2883, y: 4657, note: 'Onyx Tundra', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Wishland 월드스톤', x: 2545, y: 5766, note: 'Onyx Tundra · Wish Land East', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Mousseville 월드스톤', x: 5301, y: 4600, note: 'Onyx Tundra · Moose City', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Obsidian Camp 월드스톤', x: 5569, y: 3272, note: 'Onyx Tundra', scenario: 'way_of_winter' },

  // ═══════════════════════════════════════════════
  // WORLDSTONES — Vena Fjord (추정 좌표)
  // ═══════════════════════════════════════════════
  { category: 'worldstone', group: 'locations', label: 'Avalanche Monolith 월드스톤', x: 181, y: 4679, note: 'Vena Fjord', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Fiskur Harbor 월드스톤', x: 733, y: 6840, note: 'Vena Fjord', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Whalebone 월드스톤', x: -733, y: 5949, note: 'Vena Fjord', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Hiverail 월드스톤', x: 1303, y: 4642, note: 'Vena Fjord', scenario: 'way_of_winter' },
  { category: 'worldstone', group: 'locations', label: 'Frost Forge 월드스톤', x: -2369, y: 5008, note: 'Vena Fjord', scenario: 'way_of_winter' },

  // ═══════════════════════════════════════════════
  // VILLAGES / TOWNS
  // ═══════════════════════════════════════════════
  // — Onyx Tundra —
  { category: 'village', group: 'locations', label: 'Moose City', x: 5301, y: 4600, note: 'Onyx Tundra · 무스 시티', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Moose City Food Factory', x: 4197, y: 4960, note: 'Onyx Tundra · 식품 공장', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Obsidian Camp', x: 5569, y: 3272, note: 'Onyx Tundra · 옵시디안 캠프', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Wish Land East', x: 2545, y: 5766, note: 'Onyx Tundra · 위시 랜드 동쪽', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Great River Shelter', x: 3525, y: 3898, note: 'Onyx Tundra · 대하 쉘터', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Camp Igloo', x: 3480, y: 6111, note: 'Onyx Tundra · 캠프 이글루', scenario: 'way_of_winter' },

  // — Vena Fjord —
  { category: 'village', group: 'locations', label: 'Fiskur Harbor', x: 733, y: 6840, note: 'Vena Fjord · 피스쿠르 항구', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Whalebone Cape', x: -733, y: 5949, note: 'Vena Fjord · 웨일본 곶', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Whalebone Ruins', x: -899, y: 5677, note: 'Vena Fjord · 웨일본 유적', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Frost Forge', x: -2369, y: 5008, note: 'Vena Fjord · 프로스트 포지', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: "Bear's Den", x: -1181, y: 5152, note: 'Vena Fjord · 곰의 소굴', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Western Paradise', x: 1011, y: 6033, note: 'Vena Fjord', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Wish Land West', x: 2075, y: 5845, note: 'Vena Fjord · 위시 랜드 서쪽', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Bright Sea', x: -1889, y: 7156, note: 'Vena Fjord', scenario: 'way_of_winter' },

  // — Ember Strand —
  { category: 'village', group: 'locations', label: 'Fire God Research Center', x: -5134, y: 3258, note: 'Ember Strand · 화신 연구센터', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Ashenton', x: -6285, y: 4591, note: 'Ember Strand · 애쉬턴', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Fire Throat Fortress', x: -5044, y: 4414, note: 'Ember Strand · 화목 요새', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Sunshroud Cave', x: -5875, y: 7294, note: 'Ember Strand · 일영 동굴', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Fire Throat', x: -4719, y: 4713, note: 'Ember Strand · 화목', scenario: 'way_of_winter' },
  { category: 'village', group: 'locations', label: 'Silver Wall', x: -1465, y: 4944, note: 'Vena Fjord · 은벽', scenario: 'way_of_winter' },

  // ═══════════════════════════════════════════════
  // CAMPS
  // ═══════════════════════════════════════════════
  { category: 'camp', group: 'locations', label: 'Whalebone Camp', x: -649, y: 6365, note: 'Vena Fjord · 연합 거점', scenario: 'way_of_winter' },

  // ═══════════════════════════════════════════════
  // BOSSES
  // ═══════════════════════════════════════════════
  { category: 'boss', group: 'creatures', label: 'Tundra Monolith Boss', x: 2559, y: 4491, note: '툰드라 모노리스 보스 · Lv.19', scenario: 'way_of_winter' },
  { category: 'boss', group: 'creatures', label: 'Avalanche Monolith Boss', x: 105, y: 4388, note: '눈사태 모노리스 보스 · Lv.29', scenario: 'way_of_winter' },
  { category: 'boss', group: 'creatures', label: 'Firedust Monolith Boss', x: -3831, y: 2447, note: '화진 모노리스 보스 · Lv.39', scenario: 'way_of_winter' },

  // ═══════════════════════════════════════════════
  // ELITES
  // ═══════════════════════════════════════════════
  { category: 'elite', group: 'creatures', label: 'Glutton (Moose City)', x: 4220, y: 4961, note: 'Lv.6 · Onyx Tundra', scenario: 'way_of_winter' },
  { category: 'elite', group: 'creatures', label: 'The Scorcher (Food Factory)', x: 4242, y: 4919, note: 'Lv.9 · Onyx Tundra', scenario: 'way_of_winter' },
  { category: 'elite', group: 'creatures', label: 'Claw Machine (Wish Land E)', x: 2520, y: 5639, note: 'Lv.15 · Onyx Tundra', scenario: 'way_of_winter' },
  { category: 'elite', group: 'creatures', label: 'Siren (Fiskur)', x: 6426, y: 6399, note: 'Lv.11 · Onyx Tundra', scenario: 'way_of_winter' },
  { category: 'elite', group: 'creatures', label: 'Vulture Conqueror', x: 5544, y: 3291, note: 'Onyx Tundra', scenario: 'way_of_winter' },
  { category: 'elite', group: 'creatures', label: 'Dutch Van Pelt', x: 3507, y: 4051, note: 'Onyx Tundra', scenario: 'way_of_winter' },
  { category: 'elite', group: 'creatures', label: 'Claw Machine (Wish Land W)', x: 1978, y: 5800, note: 'Lv.16 · Vena Fjord', scenario: 'way_of_winter' },
  { category: 'elite', group: 'creatures', label: 'Rainfall Reaper (Fiskur)', x: 714, y: 6967, note: 'Lv.9 · Vena Fjord', scenario: 'way_of_winter' },
  { category: 'elite', group: 'creatures', label: "Igna's Vanguard", x: -2423, y: 5016, note: 'Lv.29 · Vena Fjord · Frost Forge', scenario: 'way_of_winter' },
  { category: 'elite', group: 'creatures', label: 'Weather Vane', x: -376, y: 5514, note: 'Vena Fjord · Dangling Vessel Cove', scenario: 'way_of_winter' },

  // ═══════════════════════════════════════════════
  // LOOT — Mystical Crates
  // ═══════════════════════════════════════════════
  { category: 'crate_mystical', group: 'loot', label: '미스틱 상자 (Tundra)', x: 2479, y: 4346, note: 'Tundra Monolith · 컨테이너 위', scenario: 'way_of_winter' },
  { category: 'crate_mystical', group: 'loot', label: '미스틱 상자 (Avalanche)', x: -94, y: 4485, note: 'Avalanche · 캠프', scenario: 'way_of_winter' },
  { category: 'crate_mystical', group: 'loot', label: '미스틱 상자 (Firedust)', x: -3818, y: 2539, note: 'Firedust Monolith · 망루 옆', scenario: 'way_of_winter' },

  // ═══════════════════════════════════════════════
  // LOOT — Weapon Crates
  // ═══════════════════════════════════════════════
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (Tundra 1)', x: 2601, y: 4768, note: 'Tundra Monolith · 02 건물 내부', scenario: 'way_of_winter' },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (Tundra 2)', x: 2335, y: 4366, note: 'Tundra · 다리 서쪽', scenario: 'way_of_winter' },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (Firedust)', x: -3838, y: 2639, note: 'Firedust Monolith · Rosetta 시설', scenario: 'way_of_winter' },

  // ═══════════════════════════════════════════════
  // LOOT — Gear Crates
  // ═══════════════════════════════════════════════
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Tundra 1)', x: 2999, y: 4810, note: 'Tundra · 터널 근처', scenario: 'way_of_winter' },
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Tundra 2)', x: 2914, y: 4663, note: 'Tundra · 노란 텐트', scenario: 'way_of_winter' },
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Avalanche)', x: 103, y: 4426, note: 'Avalanche · 2층', scenario: 'way_of_winter' },
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Firedust 1)', x: -3998, y: 2475, note: 'Firedust · 다리 옆 창고', scenario: 'way_of_winter' },
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Firedust 2)', x: -3849, y: 2434, note: 'Firedust · 사무실', scenario: 'way_of_winter' },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('[seed-wow] DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Remove old WoW data if exists
  const existing = await sql`SELECT COUNT(*) as count FROM pois WHERE scenario = 'way_of_winter'`;
  if (parseInt(existing[0].count) > 0) {
    console.log(`[seed-wow] Clearing ${existing[0].count} existing Way of Winter POIs...`);
    await sql`DELETE FROM pois WHERE scenario = 'way_of_winter'`;
  }

  let inserted = 0;
  for (const poi of WOW_DATA) {
    try {
      await sql`
        INSERT INTO pois (category, "group", label, x, y, note, scenario)
        VALUES (${poi.category}, ${poi.group}, ${poi.label}, ${poi.x}, ${poi.y}, ${poi.note || null}, ${poi.scenario || null})
      `;
      inserted++;
    } catch (err) {
      console.error(`[seed-wow] Failed to insert "${poi.label}":`, err.message);
    }
  }

  console.log(`[seed-wow] Inserted ${inserted}/${WOW_DATA.length} Way of Winter POIs`);

  // Print full summary
  const summary = await sql`
    SELECT scenario, category, COUNT(*) as count
    FROM pois
    GROUP BY scenario, category
    ORDER BY scenario, category
  `;
  console.log('\n[seed-wow] Full POI Summary:');
  let total = 0;
  for (const row of summary) {
    console.log(`  ${row.scenario} / ${row.category}: ${row.count}`);
    total += parseInt(row.count);
  }
  console.log(`Total: ${total}`);
}

seed().catch((err) => {
  console.error('[seed-wow] Fatal error:', err);
  process.exit(1);
});
