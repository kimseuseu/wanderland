const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// ── th.gl 추가 데이터 로드 ──
function loadThglAdditions() {
  const filepath = path.resolve(__dirname, 'seed-pois-wow-additions.json');
  if (!fs.existsSync(filepath)) {
    console.log('[seed-wow] th.gl 추가 데이터 파일 없음 (seed-pois-wow-additions.json)');
    return [];
  }
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  console.log(`[seed-wow] th.gl 추가 데이터 로드: ${data.length}개`);
  return data;
}

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
// 혹독한 겨울 (Way of Winter) POI 데이터
// 공식 한글명 기준
// ══════════════════════════════════════════════════════════

const S = 'way_of_winter';

const WOW_DATA = [
  // ═══════════════════════════════════════════════
  // 모노리스 (group: locations, category: monolith)
  // ═══════════════════════════════════════════════
  { category: 'monolith', group: 'locations', label: '툰드라 모노리스', x: 2559, y: 4491, note: 'Lv.19 · 마노 툰드라 · 보스: 시크릿 서번트', scenario: S },
  { category: 'monolith', group: 'locations', label: '눈사태 모노리스', x: 105, y: 4388, note: 'Lv.29 · 비너 피오르드 · 보스: 엔트로피 트렌트', scenario: S },
  { category: 'monolith', group: 'locations', label: '플레임 더스트 모노리스', x: -3831, y: 2447, note: 'Lv.39 · 잿더미 해변 · 위험 구역', scenario: S },

  // ═══════════════════════════════════════════════
  // 사일로 (group: locations, category: silo)
  // 명칭: 사일로 [이름]
  // ═══════════════════════════════════════════════
  { category: 'silo', group: 'locations', label: '사일로 델타', x: 5160, y: 4191, note: '마노 툰드라 · 무스 시 남동쪽', scenario: S },
  { category: 'silo', group: 'locations', label: '사일로 EX1', x: 4197, y: 4600, note: '마노 툰드라 · 다크헬 · 무스 식품 공장 남서쪽', scenario: S },
  { category: 'silo', group: 'locations', label: '사일로 PSI', x: -500, y: 5800, note: '비너 피오르드 · 설국 · 웨일본 동쪽', scenario: S },
  { category: 'silo', group: 'locations', label: '사일로 08', x: -6500, y: 4200, note: '잿더미 해변 · 애쉬튼시 서쪽', scenario: S },

  // ═══════════════════════════════════════════════
  // 세계석 (group: locations, category: worldstone)
  // ═══════════════════════════════════════════════
  // — 마노 툰드라 —
  { category: 'worldstone', group: 'locations', label: '동부 흑석 세계석', x: 6186, y: 4160, note: '마노 툰드라', scenario: S },
  { category: 'worldstone', group: 'locations', label: '툰드라 모노리스 세계석', x: 2883, y: 4657, note: '마노 툰드라', scenario: S },
  { category: 'worldstone', group: 'locations', label: '원더랜드 동쪽 세계석', x: 2680, y: 5710, note: '마노 툰드라', scenario: S },
  { category: 'worldstone', group: 'locations', label: '무스 시 세계석', x: 5180, y: 4530, note: '마노 툰드라', scenario: S },
  { category: 'worldstone', group: 'locations', label: '흑석요새 세계석', x: 5450, y: 3340, note: '마노 툰드라', scenario: S },
  { category: 'worldstone', group: 'locations', label: '무스빌 세계석', x: 5050, y: 5100, note: '마노 툰드라 · 무스빌', scenario: S },
  { category: 'worldstone', group: 'locations', label: '파이프 아일 세계석', x: 6500, y: 6200, note: '마노 툰드라 · 토바코 파이프 리조트 부근', scenario: S },
  { category: 'worldstone', group: 'locations', label: '오션뷰 세계석', x: 6400, y: 5300, note: '마노 툰드라 · 좌초 습지 부근', scenario: S },
  { category: 'worldstone', group: 'locations', label: '북부 흑석 세계석', x: 5700, y: 3800, note: '마노 툰드라 · 흑석요새 북쪽', scenario: S },
  { category: 'worldstone', group: 'locations', label: '우드랜드 랜치 세계석', x: 4400, y: 4300, note: '마노 툰드라 · 사일로 EX1 부근', scenario: S },

  // — 비너 피오르드 —
  { category: 'worldstone', group: 'locations', label: '눈사태 모노리스 세계석', x: 181, y: 4679, note: '비너 피오르드', scenario: S },
  { category: 'worldstone', group: 'locations', label: '피스쿨 항구 세계석', x: 610, y: 6920, note: '비너 피오르드', scenario: S },
  { category: 'worldstone', group: 'locations', label: '웨일본 세계석', x: -620, y: 6050, note: '비너 피오르드', scenario: S },
  { category: 'worldstone', group: 'locations', label: '하이브 수용장 세계석', x: 1180, y: 4710, note: '비너 피오르드', scenario: S },
  { category: 'worldstone', group: 'locations', label: '프로스트 포지 세계석', x: -2250, y: 5090, note: '비너 피오르드', scenario: S },
  { category: 'worldstone', group: 'locations', label: '브로큰 리프 세계석', x: 500, y: 5400, note: '비너 피오르드 · 원더랜드 서쪽 남부', scenario: S },

  // — 잿더미 해변 —
  { category: 'worldstone', group: 'locations', label: '서부 프로스트 세계석', x: -3830, y: 5427, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '동부 화목 세계석', x: -3867, y: 2417, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '플레임 더스트 모노리스 세계석', x: -4279, y: 3365, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '유황 연못 세계석', x: -4845, y: 4634, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '화목 고지 세계석', x: -5271, y: 5400, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '북부 화목 세계석', x: -5176, y: 6335, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '풍요의 땅 세계석', x: -5960, y: 5089, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '애쉬튼시 세계석', x: -5702, y: 4256, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '화목 기지 세계석', x: -5983, y: 3085, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '열풍 세계석', x: -7435, y: 3745, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '침묵의 불 세계석', x: -6441, y: 6850, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '뱀눈 고개 세계석', x: -5552, y: 7097, note: '잿더미 해변', scenario: S },
  { category: 'worldstone', group: 'locations', label: '뱀배 세계석', x: -4637, y: 6709, note: '잿더미 해변', scenario: S },

  // ═══════════════════════════════════════════════
  // 엔트로피 허브 (group: locations, category: entropy_hub)
  // 공용 온도탑 — 지역당 1개
  // ═══════════════════════════════════════════════
  { category: 'entropy_hub', group: 'locations', label: '마노 툰드라 엔트로피 허브', x: 3500, y: 4500, note: '마노 툰드라 · 공용 온도탑 · 엔트로피 하트 투입', scenario: S },
  { category: 'entropy_hub', group: 'locations', label: '비너 피오르드 엔트로피 허브', x: -500, y: 5500, note: '비너 피오르드 · 공용 온도탑 · 엔트로피 하트 투입', scenario: S },
  { category: 'entropy_hub', group: 'locations', label: '잿더미 해변 엔트로피 허브', x: -5000, y: 4500, note: '잿더미 해변 · 공용 온도탑 · 엔트로피 하트 투입', scenario: S },

  // ═══════════════════════════════════════════════
  // 마을 / 주요 정착지 (group: locations, category: village)
  // ═══════════════════════════════════════════════
  // — 마노 툰드라 —
  { category: 'village', group: 'locations', label: '무스 시', x: 5301, y: 4600, note: '마노 툰드라', scenario: S },
  { category: 'village', group: 'locations', label: '무스 식품 공장', x: 4197, y: 4960, note: '마노 툰드라', scenario: S },
  { category: 'village', group: 'locations', label: '흑석요새', x: 5569, y: 3272, note: '마노 툰드라', scenario: S },
  { category: 'village', group: 'locations', label: '원더랜드 동쪽구역', x: 2545, y: 5766, note: '마노 툰드라', scenario: S },
  { category: 'village', group: 'locations', label: '그레이트 리버 수용 구역', x: 3525, y: 3898, note: '마노 툰드라', scenario: S },
  { category: 'village', group: 'locations', label: '이글루 캠프', x: 3480, y: 6111, note: '마노 툰드라', scenario: S },
  { category: 'village', group: 'locations', label: '토바코 파이프 리조트', x: 6386, y: 6383, note: '마노 툰드라', scenario: S },

  // — 비너 피오르드 —
  { category: 'village', group: 'locations', label: '피스쿨 항구', x: 733, y: 6840, note: '비너 피오르드', scenario: S },
  { category: 'village', group: 'locations', label: '웨일본 곶', x: -733, y: 5949, note: '비너 피오르드', scenario: S },
  { category: 'village', group: 'locations', label: '프로스트 포지', x: -2369, y: 5008, note: '비너 피오르드', scenario: S },
  { category: 'village', group: 'locations', label: '원더랜드 서쪽구역', x: 2075, y: 5845, note: '비너 피오르드', scenario: S },
  { category: 'village', group: 'locations', label: '하이브 수용장', x: 1303, y: 4642, note: '비너 피오르드', scenario: S },
  { category: 'village', group: 'locations', label: '은벽', x: -1465, y: 4944, note: '비너 피오르드', scenario: S },
  { category: 'village', group: 'locations', label: '곰의 소굴', x: -1181, y: 5152, note: '비너 피오르드', scenario: S },

  // — 잿더미 해변 —
  { category: 'village', group: 'locations', label: '불의 신 연구소', x: -5134, y: 3258, note: '잿더미 해변', scenario: S },
  { category: 'village', group: 'locations', label: '애쉬튼시', x: -6285, y: 4591, note: '잿더미 해변', scenario: S },
  { category: 'village', group: 'locations', label: '불의 성역', x: -5044, y: 4414, note: '잿더미 해변', scenario: S },
  { category: 'village', group: 'locations', label: '화목', x: -4719, y: 4713, note: '잿더미 해변', scenario: S },
  { category: 'village', group: 'locations', label: '이클립스', x: -5875, y: 7294, note: '잿더미 해변', scenario: S },
  { category: 'village', group: 'locations', label: '유황 채석장', x: -3701, y: 3549, note: '잿더미 해변', scenario: S },
  { category: 'village', group: 'locations', label: '폐정유소', x: -4132, y: 5257, note: '잿더미 해변', scenario: S },

  // ═══════════════════════════════════════════════
  // 캠프 / 거점 (group: locations, category: camp)
  // ═══════════════════════════════════════════════
  { category: 'camp', group: 'locations', label: '웨일본 캠프', x: -649, y: 6365, note: '비너 피오르드 · 연합 거점', scenario: S },
  { category: 'camp', group: 'locations', label: '그라운드 언폴른', x: -3500, y: 3870, note: '잿더미 해변 · 거점 · 불시착 비행기 부근', scenario: S },
  { category: 'camp', group: 'locations', label: '오블리비온', x: -6200, y: 4400, note: '잿더미 해변 · 거점 · 애쉬튼시 부근', scenario: S },

  // ═══════════════════════════════════════════════
  // 보스 (group: creatures, category: boss)
  // 명칭: [모노리스이름] 모노리스 [보스이름]
  // ═══════════════════════════════════════════════
  { category: 'boss', group: 'creatures', label: '툰드라 모노리스 시크릿 서번트', x: 2559, y: 4491, note: '툰드라 모노리스 보스 · Lv.19 · 4인 권장', scenario: S },
  { category: 'boss', group: 'creatures', label: '눈사태 모노리스 엔트로피 트렌트', x: 105, y: 4388, note: '눈사태 모노리스 보스 · Lv.29 · 4인 권장', scenario: S },
  { category: 'boss', group: 'creatures', label: '플레임 더스트 모노리스 위험 구역', x: -3831, y: 2447, note: '플레임 더스트 위험 구역 · Lv.39 · 탐색 던전', scenario: S },

  // ═══════════════════════════════════════════════
  // 엘리트 (group: creatures, category: elite)
  // ═══════════════════════════════════════════════
  // — 마노 툰드라 —
  { category: 'elite', group: 'creatures', label: '글라토니 (무스 시)', x: 4220, y: 4961, note: 'Lv.6 · 마노 툰드라 · 무스 식품 공장', scenario: S },
  { category: 'elite', group: 'creatures', label: '스코처 (식품 공장)', x: 4242, y: 4919, note: 'Lv.9 · 마노 툰드라', scenario: S },
  { category: 'elite', group: 'creatures', label: '클로머신 (원더랜드 동쪽)', x: 2520, y: 5639, note: 'Lv.15 · 마노 툰드라', scenario: S },
  { category: 'elite', group: 'creatures', label: '벌처 정복자', x: 5544, y: 3291, note: '마노 툰드라 · 흑석요새', scenario: S },
  { category: 'elite', group: 'creatures', label: '더치 반 펠트', x: 3507, y: 4051, note: '마노 툰드라 · 그레이트 리버', scenario: S },
  { category: 'elite', group: 'creatures', label: '로제타 헤비 (그레이트 리버)', x: 2467, y: 4286, note: 'Lv.19 · 마노 툰드라', scenario: S },

  // — 비너 피오르드 —
  { category: 'elite', group: 'creatures', label: '클로머신 (원더랜드 서쪽)', x: 1978, y: 5800, note: 'Lv.16 · 비너 피오르드', scenario: S },
  { category: 'elite', group: 'creatures', label: '강우 사신 (피스쿨)', x: 714, y: 6967, note: 'Lv.9 · 비너 피오르드 · 피스쿨 항구', scenario: S },
  { category: 'elite', group: 'creatures', label: '이그나의 전위 (프로스트 포지)', x: -2423, y: 5016, note: 'Lv.29 · 비너 피오르드', scenario: S },
  { category: 'elite', group: 'creatures', label: '풍향계', x: -376, y: 5514, note: '비너 피오르드', scenario: S },
  { category: 'elite', group: 'creatures', label: '로제타 메카닉 (하이브)', x: 1312, y: 4648, note: 'Lv.22 · 비너 피오르드 · 하이브 수용장', scenario: S },

  // — 잿더미 해변 —
  { category: 'elite', group: 'creatures', label: '이그나의 전령 (불의 신)', x: -5134, y: 3258, note: 'Lv.35 · 잿더미 해변 · 불의 신 연구소', scenario: S },
  { category: 'elite', group: 'creatures', label: '이그나의 전령 (애쉬튼시)', x: -6285, y: 4591, note: 'Lv.35 · 잿더미 해변 · 애쉬튼시', scenario: S },

  // ═══════════════════════════════════════════════
  // 비밀 보물상자 (group: loot, category: crate_mystical)
  // ═══════════════════════════════════════════════
  // — 마노 툰드라 —
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (툰드라)', x: 2479, y: 4346, note: '툰드라 모노리스', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (무스 시)', x: 5301, y: 4677, note: '무스 시', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (무스 식품)', x: 4184, y: 5024, note: '무스 식품 공장', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (흑석요새)', x: 5574, y: 3287, note: '흑석요새', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (원더랜드 동쪽)', x: 2520, y: 5757, note: '원더랜드 동쪽구역', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (그레이트 리버)', x: 3524, y: 3986, note: '그레이트 리버 수용 구역', scenario: S },

  // — 비너 피오르드 —
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (눈사태)', x: -94, y: 4485, note: '눈사태 모노리스', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (피스쿨)', x: 771, y: 6970, note: '피스쿨 항구', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (원더랜드 서쪽)', x: 2080, y: 5803, note: '원더랜드 서쪽구역', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (하이브)', x: 1356, y: 4268, note: '하이브 수용장', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (프로스트 포지)', x: -2427, y: 5044, note: '프로스트 포지', scenario: S },

  // — 잿더미 해변 —
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (플레임 더스트)', x: -3818, y: 2539, note: '플레임 더스트 모노리스', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (불의 신)', x: -5177, y: 3276, note: '불의 신 연구소', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (불의 성역)', x: -5102, y: 4472, note: '불의 성역', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (애쉬튼시)', x: -6359, y: 4625, note: '애쉬튼시', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (화목)', x: -4683, y: 4711, note: '화목', scenario: S },
  { category: 'crate_mystical', group: 'loot', label: '비밀 보물상자 (이클립스)', x: -5877, y: 7317, note: '이클립스', scenario: S },

  // ═══════════════════════════════════════════════
  // 무기 상자 (group: loot, category: crate_weapon)
  // ═══════════════════════════════════════════════
  // — 마노 툰드라 —
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (무스 시 스쿨버스)', x: 5228, y: 4697, note: '무스 시 · 스쿨버스', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (무스 시 컵케이크)', x: 5256, y: 4756, note: '무스 시 · 컵케이크 빌딩', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (식품 공장 도넛)', x: 4288, y: 5060, note: '무스 식품 공장 · 도넛 창고', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (흑석요새 망루)', x: 5545, y: 3193, note: '흑석요새 · 망루 하부', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (원더랜드 동쪽 동물원)', x: 2600, y: 5648, note: '원더랜드 동쪽구역 · 동물원', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (그레이트 리버)', x: 3599, y: 3948, note: '그레이트 리버 · 얼음 방', scenario: S },

  // — 비너 피오르드 —
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (피스쿨 난파선)', x: 844, y: 6800, note: '피스쿨 항구 · 난파선', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (원더랜드 서쪽 폭포)', x: 2070, y: 5802, note: '원더랜드 서쪽 · 폭포 동굴', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (하이브 차원앵커)', x: 1393, y: 4377, note: '하이브 수용장 · 차원 앵커 부근', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (프로스트 포지)', x: -2291, y: 4985, note: '프로스트 포지 · 남동쪽 건물', scenario: S },

  // — 잿더미 해변 —
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (불의 신 연구소)', x: -5187, y: 3231, note: '불의 신 연구소 · 로제타 트레일러', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (불의 성역)', x: -5317, y: 4318, note: '불의 성역 · 서쪽 건물', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (애쉬튼시 1)', x: -6480, y: 4698, note: '애쉬튼시 · 흰 컨테이너', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (애쉬튼시 2)', x: -6402, y: 4804, note: '애쉬튼시 · 용암 건물', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (화목 북부)', x: -4795, y: 4801, note: '화목 · 북부 기지', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (이클립스 1)', x: -5894, y: 7253, note: '이클립스 · 컨테이너', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (이클립스 2)', x: -5771, y: 7339, note: '이클립스 · 경비 플랫폼', scenario: S },

  // — 마노 툰드라 추가 —
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (무스 시 쿠키)', x: 5198, y: 4591, note: '무스 시 · 분홍 지붕 쿠키 건물', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (흑석요새 벌처)', x: 5556, y: 3282, note: '흑석요새 · 벌처 빌딩 옥상', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (원더랜드 동쪽 성)', x: 2515, y: 5750, note: '원더랜드 동쪽구역 · 롤러코스터 오렌지 성', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (그레이트 리버 2)', x: 3516, y: 3942, note: '그레이트 리버 · 입구 왼쪽 방', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (툰드라 위험구역)', x: 2601, y: 4768, note: '툰드라 위험구역 · 두 번째 터널', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (툰드라 모노리스 창고)', x: 2335, y: 4366, note: '툰드라 모노리스 · 다리 서쪽 창고', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (툰드라 배제구역 1)', x: 2478, y: 4281, note: '툰드라 배제구역 · 로제타 시설 남쪽', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (툰드라 배제구역 2)', x: 2689, y: 4578, note: '툰드라 배제구역 · 소형 로제타 시설', scenario: S },

  // — 비너 피오르드 추가 —
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (피스쿨 화장실)', x: 774, y: 6555, note: '피스쿨 항구 · 2층 욕조 옆', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (원더랜드 서쪽 크랩버거)', x: 2212, y: 5944, note: '원더랜드 서쪽 · 크랩버거 건물 옥상', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (하이브 옥상)', x: 1193, y: 4586, note: '하이브 수용장 · 소형 건물 옥상', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (프로스트 포지 2)', x: -2317, y: 5070, note: '프로스트 포지 · 동쪽 건물 2층', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (원더랜드 서쪽 버섯)', x: 2225, y: 5716, note: '원더랜드 서쪽 · 버섯 캐빈', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (원더랜드 서쪽 목조)', x: 1618, y: 6443, note: '원더랜드 서쪽 북서쪽 · 목조 2층집', scenario: S },

  // — 잿더미 해변 추가 —
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (플레임 더스트)', x: -3838, y: 2639, note: '플레임 더스트 위험구역 · 도로변 로제타 시설', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (불의 신 게이트)', x: -5235, y: 3285, note: '불의 신 연구소 · 로제타 접근카드 게이트', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (화목 벌처)', x: -4710, y: 4609, note: '화목 · 벌처 적 플랫폼', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (화목 중앙)', x: -4637, y: 4739, note: '화목 · 가장 안쪽 중앙부', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (이클립스 3)', x: -5890, y: 7236, note: '이클립스 · 나무 상자 위', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (이클립스 4)', x: -5892, y: 7241, note: '이클립스 · 계단 옆', scenario: S },
  { category: 'crate_weapon', group: 'loot', label: '무기 상자 (이클립스 5)', x: -5889, y: 7362, note: '이클립스 · 동굴 깊은 곳 캠프파이어', scenario: S },

  // ═══════════════════════════════════════════════
  // 장비 상자 (group: loot, category: crate_gear)
  // ═══════════════════════════════════════════════
  // — 마노 툰드라 —
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (토바코 리조트)', x: 6386, y: 6383, note: '토바코 파이프 리조트', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (무스 시)', x: 5186, y: 4756, note: '무스 시', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (식품 공장 1)', x: 4236, y: 4901, note: '무스 식품 공장', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (식품 공장 2)', x: 4161, y: 4956, note: '무스 식품 공장', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (흑석요새 1)', x: 5520, y: 3223, note: '흑석요새', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (원더랜드 동쪽)', x: 2535, y: 5592, note: '원더랜드 동쪽구역', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (그레이트 리버)', x: 3574, y: 4028, note: '그레이트 리버 수용 구역', scenario: S },

  // — 비너 피오르드 —
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (피스쿨 1)', x: 696, y: 6761, note: '피스쿨 항구', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (피스쿨 2)', x: 682, y: 7042, note: '피스쿨 항구', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (원더랜드 서쪽)', x: 2081, y: 5869, note: '원더랜드 서쪽구역', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (하이브 1)', x: 1392, y: 4538, note: '하이브 수용장', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (프로스트 포지)', x: -2343, y: 5013, note: '프로스트 포지', scenario: S },

  // — 잿더미 해변 —
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (유황 채석장)', x: -3701, y: 3549, note: '유황 채석장', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (애쉬튼시)', x: -6218, y: 4721, note: '애쉬튼시', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (불의 신)', x: -5240, y: 3156, note: '불의 신 연구소', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (불의 성역)', x: -5455, y: 4369, note: '불의 성역', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (화목)', x: -4604, y: 4700, note: '화목', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (이클립스 1)', x: -5910, y: 7237, note: '이클립스', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (이클립스 2)', x: -5787, y: 7356, note: '이클립스', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (폐정유소)', x: -4132, y: 5257, note: '폐정유소', scenario: S },

  // — 마노 툰드라 추가 —
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (식품 공장 3)', x: 4186, y: 4907, note: '무스 식품 공장 · 강철 탱크 사이 통로', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (흑석요새 2)', x: 5567, y: 3207, note: '흑석요새 · 대기실 높은 구역', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (원더랜드 동쪽 2)', x: 2436, y: 5949, note: '원더랜드 동쪽구역 · 회전목마 극장', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (원더랜드 동쪽 3)', x: 2619, y: 5888, note: '원더랜드 동쪽구역 · 북동쪽', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (툰드라 위험구역 1)', x: 2999, y: 4810, note: '툰드라 위험구역 · 터널 앞 플랫폼', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (툰드라 위험구역 2)', x: 2914, y: 4663, note: '툰드라 위험구역 · 노란 텐트', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (툰드라 모노리스)', x: 2363, y: 4380, note: '툰드라 모노리스 위험구역 · 도로변 플랫폼', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (툰드라 배제구역 1)', x: 2503, y: 4302, note: '툰드라 배제구역 · 산길 앞 망루', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (툰드라 배제구역 2)', x: 2573, y: 4527, note: '툰드라 배제구역 · 모노리스 오른쪽 방', scenario: S },

  // — 비너 피오르드 추가 —
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (하이브 2)', x: 1354, y: 4312, note: '하이브 수용장 · 상승기류 바위 구조물', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (하이브 3)', x: 1314, y: 4318, note: '하이브 수용장 · 사다리 바위길', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (눈사태 위험구역 1)', x: 165, y: 4652, note: '눈사태 위험구역 · 입구 왼쪽 타워 꼭대기', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (눈사태 위험구역 2)', x: 13, y: 4634, note: '눈사태 위험구역 · 소형 로제타 캠프', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (눈사태 위험구역 3)', x: 103, y: 4426, note: '눈사태 위험구역 · 모노리스 2층', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (프로스트 포지 2)', x: -2423, y: 5018, note: '프로스트 포지 · 이그나 전위 경비 구덩이', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (프로스트 포지 3)', x: -2372, y: 5137, note: '프로스트 포지 · 서쪽 빨강/파랑 포탈', scenario: S },

  // — 잿더미 해변 추가 —
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (애쉬튼시 2)', x: -6465, y: 4734, note: '애쉬튼시 · 북서쪽 백화점', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (불의 신 2)', x: -5051, y: 3341, note: '불의 신 연구소 · 북동쪽 타워 옥상', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (플레임 더스트 1)', x: -3998, y: 2475, note: '플레임 더스트 위험구역 · 다리 옆 창고', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (플레임 더스트 2)', x: -3849, y: 2434, note: '플레임 더스트 위험구역 · 모노리스 사무실', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (불의 성역 2)', x: -5188, y: 4406, note: '불의 성역 · 용암폭포 옆 창고', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (불의 성역 3)', x: -4929, y: 4586, note: '불의 성역 · 채플 위 동굴 입구', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (이클립스 3)', x: -5896, y: 7284, note: '이클립스 · 차원 앵커 부근 통로', scenario: S },
  { category: 'crate_gear', group: 'loot', label: '장비 상자 (이클립스 4)', x: -5888, y: 7219, note: '이클립스 · 계단 옆', scenario: S },

  // ═══════════════════════════════════════════════
  // 전망대 (group: knowledge, category: viewpoint)
  // ═══════════════════════════════════════════════
  // — 마노 툰드라 —
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (좌초 습지)', x: 6237, y: 5485, note: '마노 툰드라 · 좌초 습지', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (흑석요새 비계)', x: 5543, y: 3308, note: '마노 툰드라 · 흑석요새', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (무스 케이크)', x: 5322, y: 4669, note: '마노 툰드라 · 무스 시', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (꽃밭)', x: 5152, y: 5172, note: '마노 툰드라', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (식품 공장 아치)', x: 4318, y: 4987, note: '마노 툰드라 · 무스 식품 공장', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (그레이트 리버 입구)', x: 3634, y: 4076, note: '마노 툰드라', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (이글루 트럭)', x: 3389, y: 6225, note: '마노 툰드라 · 이글루 캠프', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (툰드라 모노리스 다리)', x: 2323, y: 4373, note: '마노 툰드라', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (원더랜드 씨월드)', x: 2480, y: 5636, note: '마노 툰드라', scenario: S },

  // — 비너 피오르드 —
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (원더랜드 오렌지 저택)', x: 2502, y: 5793, note: '비너 피오르드', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (하이브 동굴 입구)', x: 1204, y: 4365, note: '비너 피오르드', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (피스쿨 상자)', x: 722, y: 6928, note: '비너 피오르드', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (웨일본 언덕)', x: -380, y: 6139, note: '비너 피오르드', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (마운틴셰이드 북쪽)', x: -845, y: 5719, note: '비너 피오르드', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (곰 캠프 석상)', x: -1542, y: 5218, note: '비너 피오르드', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (눈사태 남서쪽)', x: -22, y: 4260, note: '비너 피오르드', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (프로스트 포지 남쪽)', x: -2198, y: 4992, note: '비너 피오르드', scenario: S },

  // — 잿더미 해변 —
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (불시착 비행기)', x: -3493, y: 3869, note: '잿더미 해변', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (불의 신 손)', x: -5162, y: 3257, note: '잿더미 해변 · 불의 신 연구소', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (머리 없는 조각상)', x: -6778, y: 4283, note: '잿더미 해변', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (이클립스 내부)', x: -5869, y: 7298, note: '잿더미 해변', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (애쉬튼시 바위)', x: -6282, y: 4722, note: '잿더미 해변', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (플레임 더스트 절벽)', x: -3816, y: 2352, note: '잿더미 해변', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (사일로 차원앵커)', x: -7148, y: 4606, note: '잿더미 해변', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (불의 성역 경사로)', x: -5246, y: 4339, note: '잿더미 해변', scenario: S },
  { category: 'viewpoint', group: 'knowledge', label: '전망대 (부서진 다리 용암)', x: -4790, y: 4648, note: '잿더미 해변', scenario: S },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('[seed-wow] DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // th.gl 추가 데이터 병합
  const thglAdditions = loadThglAdditions();
  const allPois = [...WOW_DATA, ...thglAdditions];

  // Remove old WoW data
  const existing = await sql`SELECT COUNT(*) as count FROM pois WHERE scenario = 'way_of_winter'`;
  if (parseInt(existing[0].count) > 0) {
    console.log(`[seed-wow] Clearing ${existing[0].count} existing Way of Winter POIs...`);
    await sql`DELETE FROM pois WHERE scenario = 'way_of_winter'`;
  }

  let inserted = 0;
  for (const poi of allPois) {
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

  console.log(`[seed-wow] Inserted ${inserted}/${allPois.length} Way of Winter POIs (수동: ${WOW_DATA.length}, th.gl: ${thglAdditions.length})`);

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
