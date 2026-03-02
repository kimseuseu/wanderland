const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load .env.local
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

// ── POI Data collected from game8, Fandom Wiki, th.gl guides ──

const POI_DATA = [
  // ═══════════════════════════════════════════════
  // MONOLITHS (group: locations, category: monolith)
  // ═══════════════════════════════════════════════
  { category: 'monolith', group: 'locations', label: '가이아 절벽 모노리스', x: 4584, y: -6024, note: 'Lv.17 · Broken Delta · 보스: Treant', scenario: 'touch_of_sky' },
  { category: 'monolith', group: 'locations', label: '탐욕의 모노리스', x: 5990, y: -4728, note: 'Lv.8 · Dayton Wetlands · 보스: Ravenous Hunter', scenario: 'touch_of_sky' },
  { category: 'monolith', group: 'locations', label: '신기루 모노리스', x: 6554, y: -2942, note: 'Lv.28 · Iron River · 보스: Arachsiam', scenario: 'touch_of_sky' },
  { category: 'monolith', group: 'locations', label: '갈증의 모노리스', x: 1831, y: -4733, note: 'Lv.36 · Chalk Peak · 보스: Shadow Hound', scenario: 'touch_of_sky' },
  { category: 'monolith', group: 'locations', label: '잊혀진 모노리스', x: 1905, y: -1508, note: 'Lv.48 · Red Sands · 보스: Mensdevoran', scenario: 'touch_of_sky' },

  // ═══════════════════════════════════════════════
  // SECUREMENT SILOS (group: locations, category: silo)
  // ═══════════════════════════════════════════════
  { category: 'silo', group: 'locations', label: '사일로 SIGMA', x: 4900, y: -5422, note: 'Lv.15 · Broken Delta', scenario: 'touch_of_sky' },
  { category: 'silo', group: 'locations', label: '사일로 PHI', x: 5142, y: -2943, note: 'Lv.25 · Iron River', scenario: 'touch_of_sky' },
  { category: 'silo', group: 'locations', label: '사일로 EX1', x: 2144, y: -6503, note: 'Lv.35 · Chalk Peak', scenario: 'touch_of_sky' },
  { category: 'silo', group: 'locations', label: '사일로 ALPHA', x: 145, y: -3615, note: 'Lv.35 · Chalk Peak', scenario: 'touch_of_sky' },
  { category: 'silo', group: 'locations', label: '사일로 THETA', x: 5485, y: -520, note: 'Lv.45 · Red Sands', scenario: 'touch_of_sky' },
  { category: 'silo', group: 'locations', label: '사일로 PSI', x: 2490, y: -2570, note: 'Lv.45 · Red Sands', scenario: 'touch_of_sky' },

  // ═══════════════════════════════════════════════
  // WORLDSTONES / TELEPORTATION TOWERS (group: locations, category: worldstone)
  // ═══════════════════════════════════════════════
  // — Broken Delta —
  { category: 'worldstone', group: 'locations', label: 'Wild Dog Isle 월드스톤', x: 6804, y: -7150, note: 'Broken Delta', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'SIGMA 월드스톤', x: 5222, y: -5543, note: 'Broken Delta', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Central Sunbury 월드스톤', x: 5150, y: -6850, note: 'Broken Delta', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Gaia Cliff Monolith 월드스톤', x: 4501, y: -6010, note: 'Broken Delta', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'South Delta 월드스톤', x: 3865, y: -7361, note: 'Broken Delta', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Gaia Cliff 월드스톤', x: 3369, y: -6375, note: 'Broken Delta', scenario: 'touch_of_sky' },

  // — Dayton Wetlands —
  { category: 'worldstone', group: 'locations', label: 'Overlook Town 월드스톤', x: 6906, y: -5849, note: 'Dayton Wetlands', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Coastside Plaza 월드스톤', x: 7633, y: -4791, note: 'Dayton Wetlands', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Monolith of Greed 월드스톤', x: 6014, y: -4640, note: 'Dayton Wetlands', scenario: 'touch_of_sky' },

  // — Iron River —
  { category: 'worldstone', group: 'locations', label: 'North Dayton 월드스톤', x: 5540, y: -4115, note: 'Iron River', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'West Highbank 월드스톤', x: 4584, y: -4314, note: 'Iron River', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Winding Ridge 월드스톤', x: 6239, y: -3481, note: 'Iron River', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'North Rippleby 월드스톤', x: 7089, y: -3601, note: 'Iron River', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Mirage Monolith 월드스톤', x: 6625, y: -2762, note: 'Iron River', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Windward 월드스톤', x: 7424, y: -2457, note: 'Iron River', scenario: 'touch_of_sky' },

  // — Chalk Peak —
  { category: 'worldstone', group: 'locations', label: 'Inner Sea 월드스톤', x: 1981, y: -6899, note: 'Chalk Peak', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'North Silvershore 월드스톤', x: 431, y: -6968, note: 'Chalk Peak', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Rotten Saddle 월드스톤', x: 1366, y: -6200, note: 'Chalk Peak', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'West Gaia 월드스톤', x: 2750, y: -5680, note: 'Chalk Peak', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'South Greenlake 월드스톤', x: 110, y: -4860, note: 'Chalk Peak', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Monolith of Thirst 월드스톤', x: 1690, y: -4800, note: 'Chalk Peak', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'ALPHA 월드스톤', x: 300, y: -3700, note: 'Chalk Peak', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'East Manor 월드스톤', x: 2000, y: -3480, note: 'Chalk Peak', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Moonlake 월드스톤', x: 300, y: -2530, note: 'Chalk Peak', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'North Greenlake 월드스톤', x: 1400, y: -4240, note: 'Chalk Peak', scenario: 'touch_of_sky' },

  // — Red Sands —
  { category: 'worldstone', group: 'locations', label: 'Central Blackfell 월드스톤', x: 4847, y: -1915, note: 'Red Sands', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'South Valley 월드스톤', x: 6548, y: -1521, note: 'Red Sands', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'THETA 월드스톤', x: 5640, y: -950, note: 'Red Sands', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'Forsaken Monolith 월드스톤', x: 1970, y: -1400, note: 'Red Sands', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: 'North Fort Eyrie 월드스톤', x: 2700, y: -2327, note: 'Red Sands', scenario: 'touch_of_sky' },

  // — Blackheart —
  { category: 'worldstone', group: 'locations', label: 'Giant Stairs 월드스톤', x: 3337, y: 181, note: 'Blackheart Region', scenario: 'touch_of_sky' },
  { category: 'worldstone', group: 'locations', label: "Blackheart's Bay 월드스톤", x: 5900, y: 480, note: 'Blackheart Region', scenario: 'touch_of_sky' },

  // ═══════════════════════════════════════════════
  // VILLAGES / TOWNS (group: locations, category: village)
  // ═══════════════════════════════════════════════
  // — Broken Delta —
  { category: 'village', group: 'locations', label: 'Gaia Research Center', x: 4080, y: -6380, note: 'Broken Delta · 가이아 연구센터 유적', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Eastern Railway Junction', x: 4525, y: -5190, note: 'Broken Delta · 동부 철도 교차점', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Sunbury Middle School', x: 5300, y: -7060, note: 'Broken Delta', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'High Banks', x: 5455, y: -5784, note: 'Broken Delta', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Harborside', x: 5975, y: -7000, note: 'Broken Delta · 항구 마을', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Hearst Industries', x: 6100, y: -6079, note: 'Broken Delta · 허스트 산업단지', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Hearst', x: 6121, y: -6306, note: 'Broken Delta · 허스트 마을', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Hearst Mudflats', x: 6472, y: -6391, note: 'Broken Delta · 허스트 갯벌', scenario: 'touch_of_sky' },

  // — Dayton Wetlands —
  { category: 'village', group: 'locations', label: 'Dayton Hospital', x: 5600, y: -4650, note: 'Dayton Wetlands · 데이턴 병원', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Citrus County', x: 5650, y: -5210, note: 'Dayton Wetlands', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Rotten Manor', x: 5950, y: -5000, note: 'Dayton Wetlands · 부패한 저택', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Brookham', x: 6405, y: -4627, note: 'Dayton Wetlands · 브룩햄', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Throughville', x: 6415, y: -5159, note: 'Dayton Wetlands', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Overlook Town', x: 6759, y: -5770, note: 'Dayton Wetlands · 오버룩 타운', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Mola Island', x: 7131, y: -5680, note: 'Dayton Wetlands · 몰라 아일랜드', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Coastside Plaza', x: 7351, y: -4811, note: 'Dayton Wetlands', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Cape Manor', x: 7565, y: -5265, note: 'Dayton Wetlands', scenario: 'touch_of_sky' },

  // — Iron River —
  { category: 'village', group: 'locations', label: 'Greywater Industrial Zone', x: 4753, y: -3054, note: 'Iron River · 그레이워터 산업지구', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Refinery Pollution Plant', x: 5189, y: -3723, note: 'Iron River · 정유공장', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Rippleby', x: 7089, y: -3601, note: 'Iron River · 리플비', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Alkirk', x: 6925, y: -2616, note: 'Iron River · 알커크', scenario: 'touch_of_sky' },

  // — Chalk Peak —
  { category: 'village', group: 'locations', label: 'Holt Town', x: 3798, y: -4486, note: 'Chalk Peak · 홀트 타운', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Rotten Saddle', x: 1697, y: -5990, note: 'Chalk Peak · 로튼 새들', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'GAIA Military Base', x: 2957, y: -6036, note: 'Chalk Peak · 가이아 군사기지', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Greenlake Hill', x: 783, y: -4459, note: 'Chalk Peak · 그린레이크 힐', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Silvershore Resort', x: 253, y: -7194, note: 'Chalk Peak · 실버쇼어 리조트', scenario: 'touch_of_sky' },

  // — Red Sands —
  { category: 'village', group: 'locations', label: 'Blackfell Oil Fields', x: 5297, y: -1568, note: 'Red Sands · 블랙펠 유전', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Blackfell Fallen Zone', x: 4315, y: -1325, note: 'Red Sands · 블랙펠 몰락지대', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Evergreen', x: 4494, y: -2313, note: 'Red Sands · 에버그린', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Fort Eyrie', x: 2700, y: -2327, note: 'Red Sands · 포트 아이리', scenario: 'touch_of_sky' },
  { category: 'village', group: 'locations', label: 'Alternative Reality Institute', x: 6871, y: -1499, note: 'Red Sands · 대체현실 연구소', scenario: 'touch_of_sky' },

  // ═══════════════════════════════════════════════
  // CAMPS / UNION STRONGHOLDS (group: locations, category: camp)
  // ═══════════════════════════════════════════════
  { category: 'camp', group: 'locations', label: 'Tall Grass Inn', x: 3051, y: -4853, note: 'Chalk Peak · 연합 거점', scenario: 'touch_of_sky' },
  { category: 'camp', group: 'locations', label: 'Blackfell', x: 4079, y: -1471, note: 'Red Sands · 연합 거점', scenario: 'touch_of_sky' },
  { category: 'camp', group: 'locations', label: 'Greywater Camp', x: 5373, y: -3249, note: 'Iron River · 연합 거점', scenario: 'touch_of_sky' },
  { category: 'camp', group: 'locations', label: "Meyer's Market", x: 5766, y: -6575, note: 'Broken Delta · 연합 거점', scenario: 'touch_of_sky' },
  { category: 'camp', group: 'locations', label: 'Deadsville', x: 6006, y: -5524, note: 'Dayton Wetlands · 연합 거점', scenario: 'touch_of_sky' },

  // ═══════════════════════════════════════════════
  // BOSSES (group: creatures, category: boss)
  // Monolith bosses — major dungeon encounters
  // ═══════════════════════════════════════════════
  { category: 'boss', group: 'creatures', label: 'Treant', x: 4584, y: -6024, note: 'Gaia Cliff Monolith 보스 · Lv.17', scenario: 'touch_of_sky' },
  { category: 'boss', group: 'creatures', label: 'Ravenous Hunter', x: 5990, y: -4728, note: '탐욕의 모노리스 보스 · Lv.8', scenario: 'touch_of_sky' },
  { category: 'boss', group: 'creatures', label: 'Arachsiam', x: 6554, y: -2942, note: '신기루 모노리스 보스 · Lv.28', scenario: 'touch_of_sky' },
  { category: 'boss', group: 'creatures', label: 'Shadow Hound', x: 1831, y: -4733, note: '갈증의 모노리스 보스 · Lv.36', scenario: 'touch_of_sky' },
  { category: 'boss', group: 'creatures', label: 'Mensdevoran', x: 1905, y: -1508, note: '잊혀진 모노리스 보스 · Lv.48', scenario: 'touch_of_sky' },

  // ═══════════════════════════════════════════════
  // ELITE ENEMIES (group: creatures, category: elite)
  // Representative selection from each region
  // ═══════════════════════════════════════════════
  // — Dayton Wetlands Elites —
  { category: 'elite', group: 'creatures', label: 'Glutton (Sutherland)', x: 7279, y: -5335, note: 'Lv.3 · Dayton Wetlands · Sutherland Family Orchard', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'Glutton (Overlook)', x: 6730, y: -5830, note: 'Lv.5 · Dayton Wetlands · Overlook Town', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'Arbiter', x: 5999, y: -4782, note: 'Lv.8 · Dayton Wetlands · Monolith of Greed', scenario: 'touch_of_sky' },

  // — Broken Delta Elites —
  { category: 'elite', group: 'creatures', label: 'Mother of Life', x: 6076, y: -5986, note: 'Lv.12 · Broken Delta · Hearst Industries', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'Rainfall Reaper', x: 5948, y: -7149, note: 'Lv.12 · Broken Delta · Harborside', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'Ede', x: 5457, y: -5753, note: 'Lv.12 · Broken Delta · High Banks', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'Scorcher (Railway)', x: 4529, y: -5333, note: 'Lv.17 · Broken Delta · Eastern Railway Junction', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'Arbiter (Sunbury)', x: 5246, y: -6978, note: 'Lv.17 · Broken Delta · Sunbury Middle School', scenario: 'touch_of_sky' },

  // — Iron River Elites —
  { category: 'elite', group: 'creatures', label: 'Mirror Girl', x: 5189, y: -3723, note: 'Lv.23 · Iron River · Refinery Pollution Plant', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'Burrower', x: 5178, y: -3585, note: 'Lv.23 · Iron River · Refinery Pollution Plant', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'Star Walker (Alkirk)', x: 6925, y: -2616, note: 'Lv.28 · Iron River · Alkirk', scenario: 'touch_of_sky' },

  // — Chalk Peak Elites —
  { category: 'elite', group: 'creatures', label: 'Star Walker (Holt)', x: 3798, y: -4486, note: 'Lv.32 · Chalk Peak · Holt Town', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'Sinner Sentry', x: 3706, y: -4352, note: 'Lv.32 · Chalk Peak · Holt Town', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'Chagas Weevil', x: 1697, y: -5990, note: 'Lv.32 · Chalk Peak · Rotten Saddle', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'The Butchers (Greenlake)', x: 783, y: -4459, note: 'Lv.36 · Chalk Peak · Greenlake Hill', scenario: 'touch_of_sky' },

  // — Red Sands Elites —
  { category: 'elite', group: 'creatures', label: 'Weather Girls', x: 4315, y: -1325, note: 'Lv.43 · Red Sands · Blackfell Fallen Zone', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: 'Cervitaur', x: 5154, y: -1479, note: 'Lv.43 · Red Sands · Blackfell Oil Fields', scenario: 'touch_of_sky' },
  { category: 'elite', group: 'creatures', label: "Dragon's Bone Colin", x: 6937, y: -1675, note: 'Lv.48 · Red Sands · Alternative Reality Research Institute', scenario: 'touch_of_sky' },

  // ═══════════════════════════════════════════════
  // LOOT — Mystical Crates (group: loot, category: crate_mystical)
  // From game8 monolith exploration guides
  // ═══════════════════════════════════════════════
  { category: 'crate_mystical', group: 'loot', label: '미스틱 상자 (Gaia Cliff)', x: 4581, y: -5979, note: 'Gaia Cliff Monolith 내부', scenario: 'touch_of_sky' },
  { category: 'crate_mystical', group: 'loot', label: '미스틱 상자 (Mirage)', x: 6507, y: -2853, note: 'Mirage Monolith · Rift Anchor 근처', scenario: 'touch_of_sky' },
  { category: 'crate_mystical', group: 'loot', label: '미스틱 상자 (Thirst)', x: 1632, y: -4756, note: 'Monolith of Thirst · Rift Anchor 근처', scenario: 'touch_of_sky' },
  { category: 'crate_mystical', group: 'loot', label: '미스틱 상자 (Forsaken)', x: 2005, y: -1527, note: 'Forsaken Monolith 내부', scenario: 'touch_of_sky' },

  // ═══════════════════════════════════════════════
  // LOOT — Weapon Crates (group: loot, category: crate_weapon)
  // ═══════════════════════════════════════════════
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (Gaia Cliff 1)', x: 4539, y: -5930, note: 'Gaia Cliff · 덩굴에 감싸인 상자', scenario: 'touch_of_sky' },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (Gaia Cliff 2)', x: 4567, y: -5819, note: 'Gaia Cliff · 산 정상', scenario: 'touch_of_sky' },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (Mirage 1)', x: 6519, y: -2912, note: 'Mirage Monolith · Reception Area', scenario: 'touch_of_sky' },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (Mirage 2)', x: 6526, y: -2799, note: 'Mirage Monolith · Underground Facility', scenario: 'touch_of_sky' },

  // ═══════════════════════════════════════════════
  // LOOT — Gear Crates (group: loot, category: crate_gear)
  // ═══════════════════════════════════════════════
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Gaia Cliff 1)', x: 4587, y: -5930, note: 'Gaia Cliff · 건물 옥상', scenario: 'touch_of_sky' },
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Gaia Cliff 2)', x: 4464, y: -5963, note: 'Gaia Cliff · 사무실', scenario: 'touch_of_sky' },
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Mirage 1)', x: 6576, y: -2929, note: 'Mirage Monolith · South Area', scenario: 'touch_of_sky' },
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Mirage 2)', x: 6463, y: -2732, note: 'Mirage Monolith · Office Room', scenario: 'touch_of_sky' },
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Thirst 1)', x: 1668, y: -4755, note: 'Monolith of Thirst · Office Room', scenario: 'touch_of_sky' },
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Forsaken 1)', x: 2083, y: -1449, note: 'Forsaken Monolith · Main Lobby', scenario: 'touch_of_sky' },
  { category: 'crate_gear', group: 'loot', label: '기어 상자 (Forsaken 2)', x: 2052, y: -1503, note: 'Forsaken Monolith · Second Floor', scenario: 'touch_of_sky' },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('[seed] DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Check how many POIs already exist
  const existing = await sql`SELECT COUNT(*) as count FROM pois`;
  const existingCount = parseInt(existing[0].count);
  console.log(`[seed] Existing POI count: ${existingCount}`);

  if (existingCount > 0) {
    console.log('[seed] Clearing existing POIs before re-seeding...');
    await sql`DELETE FROM pois`;
    // Reset sequence
    await sql`SELECT setval('pois_id_seq', 1, false)`;
    console.log('[seed] Cleared existing POIs');
  }

  let inserted = 0;
  for (const poi of POI_DATA) {
    try {
      await sql`
        INSERT INTO pois (category, "group", label, x, y, note, scenario)
        VALUES (${poi.category}, ${poi.group}, ${poi.label}, ${poi.x}, ${poi.y}, ${poi.note || null}, ${poi.scenario || null})
      `;
      inserted++;
    } catch (err) {
      console.error(`[seed] Failed to insert "${poi.label}":`, err.message);
    }
  }

  console.log(`[seed] Successfully inserted ${inserted}/${POI_DATA.length} POIs`);

  // Print summary by category
  const summary = await sql`
    SELECT category, "group", COUNT(*) as count
    FROM pois
    GROUP BY category, "group"
    ORDER BY "group", category
  `;
  console.log('\n[seed] POI Summary:');
  for (const row of summary) {
    console.log(`  ${row.group} / ${row.category}: ${row.count}`);
  }

  console.log('\n[seed] Done!');
}

seed().catch((err) => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});
