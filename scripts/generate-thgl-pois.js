/**
 * th.gl 데이터에서 누락된 POI를 추출하여 시드 데이터 형식으로 출력
 *
 * 좌표 변환: th.gl p[0] = wanderland_y, p[1] = wanderland_x
 *
 * Usage: node scripts/generate-thgl-pois.js
 */

const fs = require('fs');
const path = require('path');

// ─── th.gl → wanderland 카테고리 매핑 ───
const CATEGORY_MAP = {
  // locations
  'fanmaiji': { category: 'monolith', group: 'locations' },
  'securementsilos': { category: 'silo', group: 'locations' },
  'hud_icon_resourse_null': { category: 'worldstone', group: 'locations' },
  'juluo': { category: 'village', group: 'locations' },
  'scattered': { category: 'village', group: 'locations' },
  'yingdi': { category: 'camp', group: 'locations' },
  'transport': { category: 'transport', group: 'locations' },
  'map_cbt2_view_icon_temperature': { category: 'entropy_hub', group: 'locations' },

  // loot
  'mystical_crate': { category: 'crate_mystical', group: 'loot' },
  'weapon_crate': { category: 'crate_weapon', group: 'loot' },
  'gear_crate': { category: 'crate_gear', group: 'loot' },
  'morphic_crate': { category: 'crate_morphic', group: 'loot' },
  'hoard_loot_crate': { category: 'hoard', group: 'loot' },

  // knowledge
  'landscape_viewpoint_camera': { category: 'viewpoint', group: 'knowledge' },
  'echoes_of_stardust': { category: 'echo', group: 'knowledge' },
};

// riddle은 접두사 매칭
const RIDDLE_PREFIXES = ['riddle_', 'puzzle_'];

// 한글 라벨 매핑
const CATEGORY_LABELS = {
  worldstone: '세계석',
  transport: '이동장치',
  village: '마을',
  camp: '캠프',
  entropy_hub: '엔트로피 허브',
  crate_mystical: '비밀 보물상자',
  crate_weapon: '무기 상자',
  crate_gear: '장비 상자',
  crate_morphic: '모르픽 상자',
  hoard: '비축물',
  viewpoint: '전망대',
  echo: '별빛 메아리',
  riddle: '수수께끼',
};

function loadJson(filename) {
  const filepath = path.resolve(__dirname, '..', 'public', 'data', 'oncehuman', filename);
  const raw = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  // JSON 구조: { mapKey, scenarioName, categoryCount, totalSpawns, categories: [...] }
  return raw.categories;
}

function convertCoord(p) {
  return { x: Math.round(p[1]), y: Math.round(p[0]) };
}

function extractPois(data, targetCategories) {
  const results = {};

  for (const entry of data) {
    const thglType = entry.type;
    let mapped = CATEGORY_MAP[thglType];

    // riddle 접두사 매칭
    if (!mapped) {
      for (const prefix of RIDDLE_PREFIXES) {
        if (thglType.startsWith(prefix)) {
          mapped = { category: 'riddle', group: 'knowledge' };
          break;
        }
      }
    }

    if (!mapped) continue;
    if (targetCategories && !targetCategories.includes(mapped.category)) continue;

    const cat = mapped.category;
    if (!results[cat]) results[cat] = [];

    for (const spawn of entry.spawns) {
      const coord = convertCoord(spawn.p);
      const label = spawn.data?.name?.[0] || spawn.id || null;
      results[cat].push({
        category: cat,
        group: mapped.group,
        x: coord.x,
        y: coord.y,
        thglType,
        label,
        id: spawn.id,
        data: spawn.data,
      });
    }
  }

  return results;
}

function dedup(pois, threshold = 50) {
  // 가까운 좌표를 중복으로 처리
  const unique = [];
  for (const poi of pois) {
    const isDup = unique.some(u =>
      Math.abs(u.x - poi.x) < threshold && Math.abs(u.y - poi.y) < threshold
    );
    if (!isDup) unique.push(poi);
  }
  return unique;
}

function findNewPois(thglPois, existingPois, threshold = 80) {
  return thglPois.filter(tp => {
    return !existingPois.some(ep =>
      Math.abs(ep.x - tp.x) < threshold && Math.abs(ep.y - tp.y) < threshold
    );
  });
}

function formatPoiEntry(poi, scenario, idx) {
  const catLabel = CATEGORY_LABELS[poi.category] || poi.category;
  let label;

  if (poi.label && typeof poi.label === 'string' && poi.label.length < 100) {
    label = `${catLabel} (${poi.label})`;
  } else {
    label = `${catLabel} #${idx}`;
  }

  const s = scenario === 'touch_of_sky' ? 'S' : 'S';
  return `  { category: '${poi.category}', group: '${poi.group}', label: '${label}', x: ${poi.x}, y: ${poi.y}, note: null, scenario: ${s} },`;
}

// ─── 기존 시드 데이터에서 좌표 추출 ───
function parseExistingCoords(seedFile) {
  const content = fs.readFileSync(path.resolve(__dirname, seedFile), 'utf8');
  const coords = {};
  const regex = /category:\s*'(\w+)'.*?x:\s*(-?\d+),\s*y:\s*(-?\d+)/g;
  let match;
  while ((match = regex.exec(content))) {
    const cat = match[1];
    if (!coords[cat]) coords[cat] = [];
    coords[cat].push({ x: parseInt(match[2]), y: parseInt(match[3]) });
  }
  return coords;
}

// ─── 메인 ───
function main() {
  console.log('=== th.gl POI 데이터 분석 ===\n');

  // 중요한 카테고리만 타겟
  const targetCats = [
    'worldstone', 'transport', 'village', 'camp', 'entropy_hub',
    'crate_mystical', 'crate_weapon', 'crate_gear', 'crate_morphic', 'hoard',
    'viewpoint', 'echo', 'riddle',
  ];

  // ═══ Touch of Sky ═══
  console.log('══════════════════════════════════════');
  console.log('  터치 오브 스카이 (Touch of Sky)');
  console.log('══════════════════════════════════════\n');

  const defaultData = loadJson('default.json');
  const tosThgl = extractPois(defaultData, targetCats);
  const tosExisting = parseExistingCoords('seed-pois.js');

  const tosSummary = {};

  for (const cat of targetCats) {
    const thglPois = tosThgl[cat] || [];
    const thglDeduped = dedup(thglPois, 30);
    const existing = tosExisting[cat] || [];
    const newPois = findNewPois(thglDeduped, existing, 80);

    tosSummary[cat] = {
      thgl: thglDeduped.length,
      existing: existing.length,
      new: newPois.length,
      pois: newPois,
    };

    if (newPois.length > 0) {
      console.log(`[${cat}] th.gl: ${thglDeduped.length}, 기존: ${existing.length}, 새로 추가 가능: ${newPois.length}`);
    }
  }

  // ═══ Way of Winter ═══
  console.log('\n══════════════════════════════════════');
  console.log('  혹독한 겨울 (Way of Winter)');
  console.log('══════════════════════════════════════\n');

  const northData = loadJson('north_snow_pve.json');
  const wowThgl = extractPois(northData, targetCats);
  const wowExisting = parseExistingCoords('seed-pois-wow.js');

  const wowSummary = {};

  for (const cat of targetCats) {
    const thglPois = wowThgl[cat] || [];
    const thglDeduped = dedup(thglPois, 30);
    const existing = wowExisting[cat] || [];
    const newPois = findNewPois(thglDeduped, existing, 80);

    wowSummary[cat] = {
      thgl: thglDeduped.length,
      existing: existing.length,
      new: newPois.length,
      pois: newPois,
    };

    if (newPois.length > 0) {
      console.log(`[${cat}] th.gl: ${thglDeduped.length}, 기존: ${existing.length}, 새로 추가 가능: ${newPois.length}`);
    }
  }

  // ═══ 출력: 새 POI 데이터 파일 생성 ═══
  console.log('\n══════════════════════════════════════');
  console.log('  추가 데이터 생성 중...');
  console.log('══════════════════════════════════════\n');

  // Touch of Sky 추가분
  generateSeedAdditions('touch_of_sky', tosSummary, 'seed-pois-tos-additions.json');

  // Way of Winter 추가분
  generateSeedAdditions('way_of_winter', wowSummary, 'seed-pois-wow-additions.json');
}

function generateSeedAdditions(scenario, summary, filename) {
  const additions = [];
  let totalNew = 0;

  for (const [cat, data] of Object.entries(summary)) {
    if (data.new === 0) continue;

    const catLabel = CATEGORY_LABELS[cat] || cat;
    let idx = data.existing + 1;

    for (const poi of data.pois) {
      let label;
      if (poi.label && typeof poi.label === 'string' && poi.label.length < 80) {
        // 영어 이름이 있으면 사용
        label = `${catLabel} (${poi.label})`;
      } else {
        label = `${catLabel} #${idx}`;
      }

      additions.push({
        category: cat,
        group: poi.group,
        label,
        x: poi.x,
        y: poi.y,
        note: poi.thglType !== cat ? poi.thglType : null,
        scenario,
      });
      idx++;
    }
    totalNew += data.new;
  }

  const outPath = path.resolve(__dirname, filename);
  fs.writeFileSync(outPath, JSON.stringify(additions, null, 2));
  console.log(`[${scenario}] ${totalNew}개 추가 POI → ${filename}`);

  // 카테고리별 요약
  for (const [cat, data] of Object.entries(summary)) {
    if (data.new > 0) {
      console.log(`  ${cat}: +${data.new} (${data.existing} → ${data.existing + data.new})`);
    }
  }
}

main();
