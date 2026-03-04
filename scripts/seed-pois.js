const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// ── th.gl 추가 데이터 로드 ──
function loadThglAdditions() {
  const filepath = path.resolve(__dirname, 'seed-pois-tos-additions.json');
  if (!fs.existsSync(filepath)) {
    console.log('[seed] th.gl 추가 데이터 파일 없음 (seed-pois-tos-additions.json)');
    return [];
  }
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  console.log(`[seed] th.gl 추가 데이터 로드: ${data.length}개`);
  return data;
}

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

// ══════════════════════════════════════════════════════════
// 터치 오브 스카이 (Touch of Sky) POI 데이터
// 공식 한글명 기준 — 출처: 나무위키, DC인사이드, game.savetip.co.kr
// ══════════════════════════════════════════════════════════

const S = 'touch_of_sky';

const POI_DATA = [
  // ═══════════════════════════════════════════════
  // 모노리스 (group: locations, category: monolith)
  // ═══════════════════════════════════════════════
  { category: 'monolith', group: 'locations', label: '가이아 절벽 모노리스', x: 4584, y: -6024, note: 'Lv.20 · 무너진 삼각주 · 보스: 트렌트', scenario: S },
  { category: 'monolith', group: 'locations', label: '탐욕의 모노리스', x: 5990, y: -4728, note: 'Lv.10 · 데이턴 습지 · 보스: 라베노스 헌터', scenario: S },
  { category: 'monolith', group: 'locations', label: '신기루 모노리스', x: 6554, y: -2942, note: 'Lv.30 · 아이언 리버 · 보스: 아라크시암', scenario: S },
  { category: 'monolith', group: 'locations', label: '송곳니 모노리스', x: 1831, y: -4733, note: 'Lv.40 · 초크 피크 · 보스: 섀도우 하운드', scenario: S },
  { category: 'monolith', group: 'locations', label: '잊혀진 모노리스', x: 1905, y: -1508, note: 'Lv.50 · 레드 샌드 · 보스: 망각의 주인', scenario: S },

  // ═══════════════════════════════════════════════
  // 사일로 (group: locations, category: silo)
  // 명칭: 사일로 [이름]
  // ═══════════════════════════════════════════════
  { category: 'silo', group: 'locations', label: '사일로 시그마', x: 4900, y: -5422, note: 'Lv.15 · 무너진 삼각주', scenario: S },
  { category: 'silo', group: 'locations', label: '사일로 파이', x: 5142, y: -2943, note: 'Lv.25 · 아이언 리버', scenario: S },
  { category: 'silo', group: 'locations', label: '사일로 EX1', x: 2144, y: -6503, note: 'Lv.35 · 초크 피크', scenario: S },
  { category: 'silo', group: 'locations', label: '사일로 알파', x: 145, y: -3615, note: 'Lv.35 · 초크 피크', scenario: S },
  { category: 'silo', group: 'locations', label: '사일로 세타', x: 5485, y: -520, note: 'Lv.45 · 레드 샌드', scenario: S },
  { category: 'silo', group: 'locations', label: '사일로 프사이', x: 2490, y: -2570, note: 'Lv.45 · 레드 샌드', scenario: S },

  // ═══════════════════════════════════════════════
  // 세계석 (group: locations, category: worldstone)
  // ═══════════════════════════════════════════════
  // — 무너진 삼각주 —
  { category: 'worldstone', group: 'locations', label: '사냥개 섬 세계석', x: 6804, y: -7150, note: '무너진 삼각주', scenario: S },
  { category: 'worldstone', group: 'locations', label: '시그마 세계석', x: 5222, y: -5543, note: '무너진 삼각주', scenario: S },
  { category: 'worldstone', group: 'locations', label: '선버리 중앙 세계석', x: 5150, y: -6850, note: '무너진 삼각주', scenario: S },
  { category: 'worldstone', group: 'locations', label: '가이아 절벽 모노리스 세계석', x: 4501, y: -6010, note: '무너진 삼각주', scenario: S },
  { category: 'worldstone', group: 'locations', label: '남부 삼각주 세계석', x: 3865, y: -7361, note: '무너진 삼각주', scenario: S },
  { category: 'worldstone', group: 'locations', label: '가이아 절벽 세계석', x: 3369, y: -6375, note: '무너진 삼각주', scenario: S },

  // — 데이턴 습지 —
  { category: 'worldstone', group: 'locations', label: '전망 마을 세계석', x: 6906, y: -5849, note: '데이턴 습지', scenario: S },
  { category: 'worldstone', group: 'locations', label: '코스트사이드 플라자 세계석', x: 7633, y: -4791, note: '데이턴 습지', scenario: S },
  { category: 'worldstone', group: 'locations', label: '탐욕의 모노리스 세계석', x: 6014, y: -4640, note: '데이턴 습지', scenario: S },

  // — 아이언 리버 —
  { category: 'worldstone', group: 'locations', label: '북부 데이턴 세계석', x: 5540, y: -4115, note: '아이언 리버', scenario: S },
  { category: 'worldstone', group: 'locations', label: '서부 하이뱅크 세계석', x: 4584, y: -4314, note: '아이언 리버', scenario: S },
  { category: 'worldstone', group: 'locations', label: '와인딩 리지 세계석', x: 6239, y: -3481, note: '아이언 리버', scenario: S },
  { category: 'worldstone', group: 'locations', label: '북부 리플비 세계석', x: 7089, y: -3601, note: '아이언 리버', scenario: S },
  { category: 'worldstone', group: 'locations', label: '신기루 모노리스 세계석', x: 6625, y: -2762, note: '아이언 리버', scenario: S },
  { category: 'worldstone', group: 'locations', label: '윈드워드 세계석', x: 7424, y: -2457, note: '아이언 리버', scenario: S },

  // — 초크 피크 —
  { category: 'worldstone', group: 'locations', label: '내해 세계석', x: 1981, y: -6899, note: '초크 피크', scenario: S },
  { category: 'worldstone', group: 'locations', label: '북부 실버 해안 세계석', x: 431, y: -6968, note: '초크 피크', scenario: S },
  { category: 'worldstone', group: 'locations', label: '낡은 안장 세계석', x: 1366, y: -6200, note: '초크 피크', scenario: S },
  { category: 'worldstone', group: 'locations', label: '서부 가이아 세계석', x: 2750, y: -5680, note: '초크 피크', scenario: S },
  { category: 'worldstone', group: 'locations', label: '남부 그린레이크 세계석', x: 110, y: -4860, note: '초크 피크', scenario: S },
  { category: 'worldstone', group: 'locations', label: '송곳니 모노리스 세계석', x: 1690, y: -4800, note: '초크 피크', scenario: S },
  { category: 'worldstone', group: 'locations', label: '알파 세계석', x: 300, y: -3700, note: '초크 피크', scenario: S },
  { category: 'worldstone', group: 'locations', label: '동부 매너 세계석', x: 2000, y: -3480, note: '초크 피크', scenario: S },
  { category: 'worldstone', group: 'locations', label: '문레이크 세계석', x: 300, y: -2530, note: '초크 피크', scenario: S },
  { category: 'worldstone', group: 'locations', label: '북부 그린레이크 세계석', x: 1400, y: -4240, note: '초크 피크', scenario: S },

  // — 레드 샌드 —
  { category: 'worldstone', group: 'locations', label: '중앙 블랙펠 세계석', x: 4847, y: -1915, note: '레드 샌드', scenario: S },
  { category: 'worldstone', group: 'locations', label: '남부 밸리 세계석', x: 6548, y: -1521, note: '레드 샌드', scenario: S },
  { category: 'worldstone', group: 'locations', label: '세타 세계석', x: 5640, y: -950, note: '레드 샌드', scenario: S },
  { category: 'worldstone', group: 'locations', label: '잊혀진 모노리스 세계석', x: 1970, y: -1400, note: '레드 샌드', scenario: S },
  { category: 'worldstone', group: 'locations', label: '북부 포트 아이리 세계석', x: 2580, y: -2250, note: '레드 샌드', scenario: S },

  // — 블랙하트 지대 —
  { category: 'worldstone', group: 'locations', label: '거인의 계단 세계석', x: 3337, y: 181, note: '블랙하트 지대', scenario: S },
  { category: 'worldstone', group: 'locations', label: '블랙하트 만 세계석', x: 5900, y: 480, note: '블랙하트 지대', scenario: S },

  // ═══════════════════════════════════════════════
  // 마을 / 주요 정착지 (group: locations, category: village)
  // ═══════════════════════════════════════════════
  // — 무너진 삼각주 —
  { category: 'village', group: 'locations', label: '가이아 연구소 유적', x: 4080, y: -6380, note: '무너진 삼각주', scenario: S },
  { category: 'village', group: 'locations', label: '동부 철도 교차점', x: 4525, y: -5190, note: '무너진 삼각주', scenario: S },
  { category: 'village', group: 'locations', label: '선버리 중학교', x: 5300, y: -7060, note: '무너진 삼각주', scenario: S },
  { category: 'village', group: 'locations', label: '하이뱅크', x: 5455, y: -5784, note: '무너진 삼각주', scenario: S },
  { category: 'village', group: 'locations', label: '항구 마을', x: 5975, y: -7000, note: '무너진 삼각주', scenario: S },
  { category: 'village', group: 'locations', label: '허스트 공업', x: 6100, y: -6079, note: '무너진 삼각주', scenario: S },
  { category: 'village', group: 'locations', label: '허스트 마을', x: 6121, y: -6306, note: '무너진 삼각주', scenario: S },
  { category: 'village', group: 'locations', label: '허스트 갯벌', x: 6472, y: -6391, note: '무너진 삼각주', scenario: S },
  { category: 'village', group: 'locations', label: '선버리 병원', x: 4802, y: -6854, note: '무너진 삼각주', scenario: S },
  { category: 'village', group: 'locations', label: '서덜랜드 화학공장', x: 5065, y: -6207, note: '무너진 삼각주', scenario: S },
  { category: 'village', group: 'locations', label: '폐품장', x: 3676, y: -7085, note: '무너진 삼각주', scenario: S },
  { category: 'village', group: 'locations', label: '사냥개 섬 초소', x: 6988, y: -7286, note: '무너진 삼각주', scenario: S },

  // — 데이턴 습지 —
  { category: 'village', group: 'locations', label: '데이턴 병원', x: 5600, y: -4650, note: '데이턴 습지', scenario: S },
  { category: 'village', group: 'locations', label: '감귤 마을', x: 5650, y: -5210, note: '데이턴 습지', scenario: S },
  { category: 'village', group: 'locations', label: '부패한 저택', x: 5950, y: -5000, note: '데이턴 습지', scenario: S },
  { category: 'village', group: 'locations', label: '브룩햄', x: 6405, y: -4627, note: '데이턴 습지', scenario: S },
  { category: 'village', group: 'locations', label: '스루빌', x: 6415, y: -5159, note: '데이턴 습지', scenario: S },
  { category: 'village', group: 'locations', label: '전망 마을', x: 6759, y: -5770, note: '데이턴 습지', scenario: S },
  { category: 'village', group: 'locations', label: '몰라 섬', x: 7131, y: -5680, note: '데이턴 습지', scenario: S },
  { category: 'village', group: 'locations', label: '코스트사이드 플라자', x: 7351, y: -4811, note: '데이턴 습지', scenario: S },
  { category: 'village', group: 'locations', label: '케이프 매너', x: 7565, y: -5265, note: '데이턴 습지', scenario: S },
  { category: 'village', group: 'locations', label: '서덜랜드 과수원', x: 7279, y: -5335, note: '데이턴 습지', scenario: S },

  // — 아이언 리버 —
  { category: 'village', group: 'locations', label: '그레이워터 공업지대', x: 4753, y: -3054, note: '아이언 리버', scenario: S },
  { category: 'village', group: 'locations', label: '정유공장', x: 5189, y: -3723, note: '아이언 리버', scenario: S },
  { category: 'village', group: 'locations', label: '리플비', x: 7089, y: -3601, note: '아이언 리버', scenario: S },
  { category: 'village', group: 'locations', label: '알칼크', x: 6925, y: -2616, note: '아이언 리버', scenario: S },
  { category: 'village', group: 'locations', label: '하이랜드 전망대', x: 4894, y: -4455, note: '아이언 리버', scenario: S },
  { category: 'village', group: 'locations', label: '동부 블랙펠 교차점', x: 6163, y: -3066, note: '아이언 리버', scenario: S },
  { category: 'village', group: 'locations', label: '리치 보안지점', x: 6585, y: -3488, note: '아이언 리버', scenario: S },

  // — 초크 피크 —
  { category: 'village', group: 'locations', label: '홀트 마을', x: 3798, y: -4486, note: '초크 피크', scenario: S },
  { category: 'village', group: 'locations', label: '낡은 안장', x: 1697, y: -5990, note: '초크 피크', scenario: S },
  { category: 'village', group: 'locations', label: '가이아 군사기지', x: 2957, y: -6036, note: '초크 피크', scenario: S },
  { category: 'village', group: 'locations', label: '언덕 마을', x: 783, y: -4459, note: '초크 피크', scenario: S },
  { category: 'village', group: 'locations', label: '실버 해안 리조트', x: 253, y: -7194, note: '초크 피크', scenario: S },
  { category: 'village', group: 'locations', label: '상록수 포도원', x: 1451, y: -3298, note: '초크 피크', scenario: S },
  { category: 'village', group: 'locations', label: '용광로 소굴', x: 2448, y: -4093, note: '초크 피크', scenario: S },

  // — 레드 샌드 —
  { category: 'village', group: 'locations', label: '블랙펠 유전', x: 5297, y: -1568, note: '레드 샌드', scenario: S },
  { category: 'village', group: 'locations', label: '블랙펠 몰락지대', x: 4315, y: -1325, note: '레드 샌드', scenario: S },
  { category: 'village', group: 'locations', label: '에버그린', x: 4494, y: -2313, note: '레드 샌드', scenario: S },
  { category: 'village', group: 'locations', label: '포트 아이리', x: 2700, y: -2327, note: '레드 샌드', scenario: S },
  { category: 'village', group: 'locations', label: '대체현실 연구소', x: 6871, y: -1499, note: '레드 샌드', scenario: S },
  { category: 'village', group: 'locations', label: '73 소스 추출지점', x: 2907, y: -1588, note: '레드 샌드', scenario: S },

  // — 블랙하트 지대 —
  { category: 'village', group: 'locations', label: '선샤인 농장', x: 2867, y: -281, note: '블랙하트 지대', scenario: S },
  { category: 'village', group: 'locations', label: '화이트 클리프', x: 3499, y: 1245, note: '블랙하트 지대', scenario: S },

  // ═══════════════════════════════════════════════
  // 캠프 / 연합 거점 (group: locations, category: camp)
  // ═══════════════════════════════════════════════
  { category: 'camp', group: 'locations', label: '그라스 여관', x: 3051, y: -4853, note: '초크 피크 · 연합 거점', scenario: S },
  { category: 'camp', group: 'locations', label: '블랙펠', x: 4079, y: -1471, note: '레드 샌드 · 연합 거점', scenario: S },
  { category: 'camp', group: 'locations', label: '그레이워터 캠프', x: 5373, y: -3249, note: '아이언 리버 · 연합 거점', scenario: S },
  { category: 'camp', group: 'locations', label: '마이어스 마켓', x: 5766, y: -6575, note: '무너진 삼각주 · 연합 거점', scenario: S },
  { category: 'camp', group: 'locations', label: '데즈빌', x: 6006, y: -5524, note: '데이턴 습지 · 연합 거점', scenario: S },

  // ═══════════════════════════════════════════════
  // 보스 (group: creatures, category: boss)
  // 명칭: [모노리스이름] 모노리스 [보스이름]
  // ═══════════════════════════════════════════════
  { category: 'boss', group: 'creatures', label: '가이아 절벽 모노리스 트렌트', x: 4584, y: -6024, note: '가이아 절벽 모노리스 보스 · Lv.20', scenario: S },
  { category: 'boss', group: 'creatures', label: '탐욕의 모노리스 라베노스 헌터', x: 5990, y: -4728, note: '탐욕의 모노리스 보스 · Lv.10', scenario: S },
  { category: 'boss', group: 'creatures', label: '신기루 모노리스 아라크시암', x: 6554, y: -2942, note: '신기루 모노리스 보스 · Lv.30', scenario: S },
  { category: 'boss', group: 'creatures', label: '송곳니 모노리스 섀도우 하운드', x: 1831, y: -4733, note: '송곳니 모노리스 보스 · Lv.40', scenario: S },
  { category: 'boss', group: 'creatures', label: '잊혀진 모노리스 망각의 주인', x: 1905, y: -1508, note: '잊혀진 모노리스 보스 · Lv.50', scenario: S },

  // ═══════════════════════════════════════════════
  // 엘리트 (group: creatures, category: elite)
  // ═══════════════════════════════════════════════
  // — 데이턴 습지 —
  { category: 'elite', group: 'creatures', label: '글라토니 (서덜랜드)', x: 7279, y: -5335, note: 'Lv.3 · 데이턴 습지 · 서덜랜드 과수원', scenario: S },
  { category: 'elite', group: 'creatures', label: '글라토니 (전망 마을)', x: 6730, y: -5830, note: 'Lv.5 · 데이턴 습지 · 전망 마을', scenario: S },
  { category: 'elite', group: 'creatures', label: '아비터', x: 5999, y: -4782, note: 'Lv.8 · 데이턴 습지 · 탐욕의 모노리스', scenario: S },
  { category: 'elite', group: 'creatures', label: '글라토니 (브룩햄)', x: 6357, y: -4639, note: 'Lv.5 · 데이턴 습지 · 브룩햄', scenario: S },

  // — 무너진 삼각주 —
  { category: 'elite', group: 'creatures', label: '마더오브라이프', x: 6076, y: -5986, note: 'Lv.12 · 무너진 삼각주 · 허스트 공업', scenario: S },
  { category: 'elite', group: 'creatures', label: '강우 사신', x: 5948, y: -7149, note: 'Lv.12 · 무너진 삼각주 · 항구 마을', scenario: S },
  { category: 'elite', group: 'creatures', label: '에데', x: 5457, y: -5753, note: 'Lv.12 · 무너진 삼각주 · 하이뱅크', scenario: S },
  { category: 'elite', group: 'creatures', label: '스코처 (철도)', x: 4529, y: -5333, note: 'Lv.17 · 무너진 삼각주 · 동부 철도 교차점', scenario: S },
  { category: 'elite', group: 'creatures', label: '아비터 (선버리)', x: 5246, y: -6978, note: 'Lv.17 · 무너진 삼각주 · 선버리 중학교', scenario: S },
  { category: 'elite', group: 'creatures', label: '스코처 (허스트)', x: 6137, y: -6025, note: 'Lv.12 · 무너진 삼각주 · 허스트 공업', scenario: S },
  { category: 'elite', group: 'creatures', label: '로제타 브루저 (사냥개 섬)', x: 7040, y: -7326, note: 'Lv.17 · 무너진 삼각주 · 사냥개 섬 초소', scenario: S },
  { category: 'elite', group: 'creatures', label: '로제타 브루저 (가이아 연구소)', x: 3859, y: -6314, note: 'Lv.17 · 무너진 삼각주 · 가이아 연구소', scenario: S },

  // — 아이언 리버 —
  { category: 'elite', group: 'creatures', label: '미러걸', x: 5189, y: -3723, note: 'Lv.23 · 아이언 리버 · 정유공장', scenario: S },
  { category: 'elite', group: 'creatures', label: '버로워', x: 5178, y: -3585, note: 'Lv.23 · 아이언 리버 · 정유공장', scenario: S },
  { category: 'elite', group: 'creatures', label: '스타 워커 (알칼크)', x: 6925, y: -2616, note: 'Lv.28 · 아이언 리버 · 알칼크', scenario: S },
  { category: 'elite', group: 'creatures', label: '글라토니 (그레이워터)', x: 4753, y: -3054, note: 'Lv.23 · 아이언 리버 · 그레이워터 공업지대', scenario: S },
  { category: 'elite', group: 'creatures', label: '로제타 메카닉 (리치)', x: 6548, y: -3485, note: 'Lv.28 · 아이언 리버 · 리치 보안지점', scenario: S },

  // — 초크 피크 —
  { category: 'elite', group: 'creatures', label: '스타 워커 (홀트)', x: 3798, y: -4486, note: 'Lv.32 · 초크 피크 · 홀트 마을', scenario: S },
  { category: 'elite', group: 'creatures', label: '시너 센트리', x: 3706, y: -4352, note: 'Lv.32 · 초크 피크 · 홀트 마을', scenario: S },
  { category: 'elite', group: 'creatures', label: '샤가스 위빌', x: 1697, y: -5990, note: 'Lv.32 · 초크 피크 · 낡은 안장', scenario: S },
  { category: 'elite', group: 'creatures', label: '도살자 (언덕 마을)', x: 783, y: -4459, note: 'Lv.36 · 초크 피크 · 언덕 마을', scenario: S },
  { category: 'elite', group: 'creatures', label: '마더오브라이프 (실버 해안)', x: 132, y: -7248, note: 'Lv.36 · 초크 피크 · 실버 해안 리조트', scenario: S },
  { category: 'elite', group: 'creatures', label: '로제타 브루저 (알파)', x: 191, y: -3728, note: 'Lv.35 · 초크 피크 · 알파 연구소', scenario: S },

  // — 레드 샌드 —
  { category: 'elite', group: 'creatures', label: '기상술사', x: 4315, y: -1325, note: 'Lv.43 · 레드 샌드 · 블랙펠 몰락지대', scenario: S },
  { category: 'elite', group: 'creatures', label: '체르비타우르', x: 5154, y: -1479, note: 'Lv.43 · 레드 샌드 · 블랙펠 유전', scenario: S },
  { category: 'elite', group: 'creatures', label: '드래곤본 콜린', x: 6937, y: -1675, note: 'Lv.48 · 레드 샌드 · 대체현실 연구소', scenario: S },
  { category: 'elite', group: 'creatures', label: '클로머신 (블랙펠)', x: 4522, y: -1386, note: 'Lv.43 · 레드 샌드 · 블랙펠 몰락지대', scenario: S },
  { category: 'elite', group: 'creatures', label: '로제타 헤비 (73소스)', x: 2877, y: -1610, note: 'Lv.43 · 레드 샌드 · 73 소스 추출지점', scenario: S },

  // ═══════════════════════════════════════════════
  // 비밀 보물상자 (group: loot, category: crate_mystical)
  // ═══════════════════════════════════════════════
  // — 무너진 삼각주 —
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (가이아 절벽)', x: 4581, y: -5979, note: '가이아 절벽 모노리스 내부', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (허스트 공업)', x: 6076, y: -6002, note: '허스트 공업', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (항구 마을)', x: 5975, y: -7192, note: '항구 마을', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (하이뱅크)', x: 5386, y: -5886, note: '하이뱅크', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (동부 철도)', x: 4489, y: -5412, note: '동부 철도 교차점', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (서덜랜드 화학)', x: 4982, y: -6223, note: '서덜랜드 화학공장', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (선버리)', x: 4783, y: -6905, note: '선버리', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (선버리 중학교)', x: 5283, y: -7000, note: '선버리 중학교', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (사냥개 섬)', x: 6975, y: -7323, note: '사냥개 섬 초소', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (가이아 연구소)', x: 3966, y: -6360, note: '가이아 연구소 유적', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (폐품장)', x: 3617, y: -6995, note: '폐품장', scenario: S },

  // — 데이턴 습지 —
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (서덜랜드 과수원)', x: 7241, y: -5352, note: '서덜랜드 과수원', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (브룩햄)', x: 6344, y: -4704, note: '브룩햄', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (코스트사이드)', x: 7292, y: -4816, note: '코스트사이드 플라자', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (데이턴 병원)', x: 5811, y: -4471, note: '데이턴 병원', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (전망 마을)', x: 6706, y: -5703, note: '전망 마을', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (감귤 마을)', x: 5672, y: -5256, note: '감귤 마을', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (부패한 저택)', x: 5956, y: -4935, note: '부패한 저택', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (스루빌)', x: 6446, y: -5128, note: '스루빌', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (탐욕의 모노리스)', x: 5905, y: -4768, note: '탐욕의 모노리스', scenario: S },

  // — 아이언 리버 —
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (하이랜드)', x: 4894, y: -4455, note: '하이랜드', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (정유공장)', x: 5194, y: -3788, note: '정유공장', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (그레이워터)', x: 4734, y: -3053, note: '그레이워터 공업지대', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (동부 블랙펠)', x: 6163, y: -3066, note: '동부 블랙펠 교차점', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (알칼크)', x: 6309, y: -2488, note: '알칼크', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (리치)', x: 6585, y: -3488, note: '리치 보안지점', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (신기루)', x: 6507, y: -2853, note: '신기루 모노리스', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (리플비)', x: 7630, y: -3951, note: '리플비', scenario: S },

  // — 초크 피크 —
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (홀트 마을)', x: 3776, y: -4406, note: '홀트 마을', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (가이아 군사기지)', x: 3119, y: -5966, note: '가이아 군사기지', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (용광로 소굴)', x: 2448, y: -4093, note: '용광로 소굴', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (상록수 포도원)', x: 1451, y: -3298, note: '상록수 포도원', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (낡은 안장)', x: 1716, y: -5881, note: '낡은 안장', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (언덕 마을)', x: 740, y: -4492, note: '언덕 마을', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (송곳니)', x: 1632, y: -4756, note: '송곳니 모노리스', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (실버 해안)', x: 292, y: -7154, note: '실버 해안 리조트', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (알파)', x: -63, y: -3805, note: '알파 연구소', scenario: S },

  // — 레드 샌드 —
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (블랙펠 몰락)', x: 4308, y: -1321, note: '블랙펠 몰락지대', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (에버그린)', x: 4357, y: -2428, note: '에버그린', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (블랙펠 유전)', x: 5491, y: -1565, note: '블랙펠 유전', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (포트 아이리)', x: 3295, y: -2817, note: '포트 아이리', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (73소스)', x: 2907, y: -1588, note: '73 소스 추출지점', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (잊혀진)', x: 2005, y: -1527, note: '잊혀진 모노리스', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (대체현실)', x: 6932, y: -1765, note: '대체현실 연구소', scenario: S },

  // — 블랙하트 —
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (선샤인 농장)', x: 2867, y: -281, note: '선샤인 농장', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (화이트 클리프)', x: 3499, y: 1245, note: '화이트 클리프', scenario: S },

  // ═══════════════════════════════════════════════
  // 무기 상자 (group: loot, category: crate_weapon)
  // ═══════════════════════════════════════════════
  // — 무너진 삼각주 —
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (가이아 절벽 1)', x: 4539, y: -5930, note: '가이아 절벽 · 덩굴 상자', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (가이아 절벽 2)', x: 4567, y: -5819, note: '가이아 절벽 · 산 정상', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (허스트 공업 1)', x: 6130, y: -6084, note: '허스트 공업 · 굴뚝 위', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (항구 마을)', x: 5956, y: -7021, note: '항구 마을 · 배 하부', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (동부 철도 1)', x: 4526, y: -5186, note: '동부 철도 교차점 · 탱크', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (선버리 중학교)', x: 5306, y: -7054, note: '선버리 중학교 · 옥상', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (사냥개 섬)', x: 6988, y: -7286, note: '사냥개 섬 초소 · 유리방', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (가이아 연구소)', x: 4080, y: -6375, note: '가이아 연구소 유적', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (폐품장)', x: 3676, y: -7085, note: '폐품장', scenario: S },

  // — 데이턴 습지 —
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (스루빌)', x: 6431, y: -5197, note: '스루빌 · 공사 현장', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (브룩햄)', x: 6739, y: -4641, note: '브룩햄 · 교회 탑', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (코스트사이드)', x: 7324, y: -4812, note: '코스트사이드 플라자 · 병원 옥상', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (전망 마을)', x: 6731, y: -5769, note: '전망 마을 · 경기장', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (부패한 저택)', x: 5957, y: -4997, note: '부패한 저택 · 2층', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (케이프 매너)', x: 7565, y: -5265, note: '케이프 매너', scenario: S },

  // — 아이언 리버 —
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (그레이워터 1)', x: 4734, y: -3053, note: '그레이워터 공업지대', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (정유공장)', x: 5194, y: -3788, note: '정유공장', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (신기루 1)', x: 6519, y: -2912, note: '신기루 모노리스 · 접수처', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (신기루 2)', x: 6526, y: -2799, note: '신기루 모노리스 · 지하 시설', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (알칼크)', x: 6309, y: -2488, note: '알칼크 · 상점 옥상', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (리플비)', x: 7630, y: -3951, note: '리플비 · 선박 조타실', scenario: S },

  // — 초크 피크 —
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (홀트 마을)', x: 3776, y: -4406, note: '홀트 마을 · 박물관', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (가이아 군사기지 1)', x: 3119, y: -5966, note: '가이아 군사기지 · 헬기장', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (가이아 군사기지 2)', x: 2957, y: -6036, note: '가이아 군사기지 · 탑', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (상록수 포도원)', x: 1451, y: -3298, note: '상록수 포도원 · 와인 저장고', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (낡은 안장)', x: 1716, y: -5881, note: '낡은 안장', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (실버 해안)', x: 292, y: -7154, note: '실버 해안 리조트 · 수영장', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (알파)', x: -63, y: -3805, note: '알파 연구소 · 잠긴 방', scenario: S },

  // — 레드 샌드 —
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (블랙펠 몰락 1)', x: 4308, y: -1321, note: '블랙펠 몰락지대 · 주유소', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (블랙펠 유전)', x: 5491, y: -1565, note: '블랙펠 유전 · 플랫폼', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (포트 아이리)', x: 3295, y: -2817, note: '포트 아이리', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (73소스)', x: 2907, y: -1588, note: '73 소스 추출지점 · 잠긴 방', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (잊혀진)', x: 2005, y: -1527, note: '잊혀진 모노리스 · 캣워크', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (대체현실)', x: 6932, y: -1765, note: '대체현실 연구소', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (에버그린)', x: 4357, y: -2428, note: '에버그린 · 호텔', scenario: S },

  // ═══════════════════════════════════════════════
  // 장비 상자 (group: loot, category: crate_gear)
  // ═══════════════════════════════════════════════
  // — 무너진 삼각주 —
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (가이아 절벽 1)', x: 4587, y: -5930, note: '가이아 절벽 · 건물 옥상', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (가이아 절벽 2)', x: 4464, y: -5963, note: '가이아 절벽 · 사무실', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (허스트 공업)', x: 6100, y: -6079, note: '허스트 공업', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (항구 마을)', x: 5975, y: -7000, note: '항구 마을', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (동부 철도)', x: 4525, y: -5190, note: '동부 철도 교차점', scenario: S },

  // — 아이언 리버 —
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (신기루 1)', x: 6576, y: -2929, note: '신기루 모노리스 · 남측', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (신기루 2)', x: 6463, y: -2732, note: '신기루 모노리스 · 사무실', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (그레이워터)', x: 4753, y: -3054, note: '그레이워터 공업지대', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (정유공장)', x: 5189, y: -3723, note: '정유공장', scenario: S },

  // — 초크 피크 —
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (송곳니 1)', x: 1668, y: -4755, note: '송곳니 모노리스 · 사무실', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (홀트 마을)', x: 3798, y: -4486, note: '홀트 마을', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (가이아 군사기지)', x: 2957, y: -6036, note: '가이아 군사기지', scenario: S },

  // — 레드 샌드 —
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (잊혀진 1)', x: 2083, y: -1449, note: '잊혀진 모노리스 · 메인 로비', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (잊혀진 2)', x: 2052, y: -1503, note: '잊혀진 모노리스 · 2층', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (블랙펠 유전)', x: 5297, y: -1568, note: '블랙펠 유전', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (대체현실)', x: 6871, y: -1499, note: '대체현실 연구소', scenario: S },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('[seed] DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // th.gl 추가 데이터 병합
  const thglAdditions = loadThglAdditions();
  const allPois = [...POI_DATA, ...thglAdditions];

  // Delete only touch_of_sky POIs (preserve way_of_winter)
  console.log('[seed] Deleting existing touch_of_sky POIs...');
  await sql`DELETE FROM pois WHERE scenario = 'touch_of_sky'`;

  let inserted = 0;
  for (const poi of allPois) {
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

  console.log(`[seed] Successfully inserted ${inserted}/${allPois.length} touch_of_sky POIs (수동: ${POI_DATA.length}, th.gl: ${thglAdditions.length})`);

  // Print summary
  const summary = await sql`
    SELECT scenario, category, "group", COUNT(*) as count
    FROM pois
    GROUP BY scenario, category, "group"
    ORDER BY scenario, "group", category
  `;
  console.log('\n[seed] POI Summary:');
  for (const row of summary) {
    console.log(`  ${row.scenario} / ${row.group} / ${row.category}: ${row.count}`);
  }

  console.log('\n[seed] Done!');
}

seed().catch((err) => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});
