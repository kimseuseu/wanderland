/**
 * POI 라벨 수정 스크립트 v2
 * - th.gl 영어 사전으로 UUID/ID를 실제 이름으로 변환
 * - 영어 이름을 한국어로 번역/음역
 * - 이미 번호가 매겨진 상자류는 유지
 *
 * Usage: node scripts/fix-poi-labels.js
 */

const fs = require('fs');
const path = require('path');

// ─── th.gl 영어 사전 로드 ───
const DICT = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'public', 'data', 'oncehuman', 'dict_en.json'), 'utf8')
);

// ─── 카테고리별 한국어 이름 ───
const CAT_KR = {
  worldstone: '세계석', transport: '이동장치', village: '마을', camp: '캠프', extraction_site: '추출 거점',
  entropy_hub: '엔트로피 허브', monolith: '모노리스', silo: '사일로',
  crate_mystical: '비밀 보물상자', crate_weapon: '무기 상자', crate_gear: '장비 상자',
  crate_morphic: '모르픽 상자', hoard: '비축물', viewpoint: '전망대',
  echo: '별빛 메아리', riddle: '수수께끼', boss: '보스', elite: '엘리트',
  deviant: '변이체', ore: '광석', plant: '식물', fish_spot: '낚시터',
  record: '지역 기록', note: '노트',
};

// ═══ 영어 → 한국어 완전 매핑 (295개) ═══

// --- transport (세계석 이름) ---
const TRANSPORT_KR = {
  'ALPHA Worldstone': '알파 세계석',
  'Ashenton Worldstone': '애쉬턴 세계석',
  'Avalanche Monolith Worldstone': '애벌런치 모노리스 세계석',
  'Barren Crag Worldstone': '배런 크래그 세계석',
  'Blackheart\'s Bay Worldstone': '블랙하트 베이 세계석',
  'Blazewind Worldstone': '블레이즈윈드 세계석',
  'Bridgeview Worldstone': '브릿지뷰 세계석',
  'Broken Reefs Worldstone': '브로큰 리프 세계석',
  'Central Blackfell Worldstone': '블랙펠 중앙 세계석',
  'Central Sunbury Worldstone': '선버리 중앙 세계석',
  'Central Tundra Worldstone': '센트럴 툰드라 세계석',
  'Chalk Peak West Worldstone': '초크 피크 서쪽 세계석',
  'Coastside Plaza Worldstone': '코스트사이드 광장 세계석',
  'Dayton Inspection Point Worldstone': '데이턴 검문소 세계석',
  'Delta Worldstone': '델타 세계석',
  'East Blackstone Worldstone': '블랙스톤 동쪽 세계석',
  'East Brookham Worldstone': '브루컴 동쪽 세계석',
  'East Manor Worldstone': '매너 동쪽 세계석',
  'Evergreen Southbank Worldstone': '에버그린 사우스뱅크 세계석',
  'Fire Throat Base Worldstone': '파이어스로트 기지 세계석',
  'Fire Throat East Worldstone': '파이어스로트 동쪽 세계석',
  'Fire Throat North Worldstone': '파이어스로트 북쪽 세계석',
  'Fire Throat Rise Worldstone': '파이어스로트 라이즈 세계석',
  'Firedust Worldstone': '파이어더스트 세계석',
  'Forsaken Monolith Worldstone': '포세이큰 모노리스 세계석',
  'Frost Forge Worldstone': '프로스트 포지 세계석',
  'Frost North Worldstone': '프로스트 북쪽 세계석',
  'Frost West Worldstone': '프로스트 서쪽 세계석',
  'Furnace Lair Worldstone': '퍼니스 레어 세계석',
  'Gaia Cliff Monolith Worldstone': '가이아 절벽 모노리스 세계석',
  'Gaia Cliff Worldstone': '가이아 절벽 세계석',
  'Giant\'s Stairs Worldstone': '자이언트 계단 세계석',
  'Green Field Worldstone': '그린 필드 세계석',
  'Harbor District Worldstone': '항구 구역 세계석',
  'Heaven\'s Gate Worldstone': '헤븐스 게이트 세계석',
  'Hiverail Cave Worldstone': '하이브레일 동굴 세계석',
  'Impact Zone Worldstone': '임팩트 존 세계석',
  'Inner Sea Worldstone': '내해 세계석',
  'Institute South Worldstone': '인스티튜트 남쪽 세계석',
  'Iron River Mouth Worldstone': '아이언 리버 어귀 세계석',
  'Mirage Monolith Worldstone': '미라지 모노리스 세계석',
  'Monolith of Greed Worldstone': '탐욕의 모노리스 세계석',
  'Monolith of Thirst Worldstone': '갈증의 모노리스 세계석',
  'Moonlake East Worldstone': '문레이크 동쪽 세계석',
  'Moonlake Worldstone': '문레이크 세계석',
  'Mountain Shade Worldstone': '마운틴 쉐이드 세계석',
  'Mousseville Worldstone': '무스빌 세계석',
  'North Blackstone Worldstone': '블랙스톤 북쪽 세계석',
  'North Dayton Worldstone': '데이턴 북쪽 세계석',
  'North Fort Eyrie Worldstone': '포트 에이리 북쪽 세계석',
  'North Greenlake Worldstone': '그린레이크 북쪽 세계석',
  'North Rippleby Worldstone': '리플비 북쪽 세계석',
  'North Silvershore Worldstone': '실버쇼어 북쪽 세계석',
  'Oceanview Worldstone': '오션뷰 세계석',
  'Offshore Oilfield Worldstone': '해상 유전 세계석',
  'Oil Fields North Worldstone': '유전 북쪽 세계석',
  'Oil Fields South Worldstone': '유전 남쪽 세계석',
  'Overlook Town Worldstone': '오버룩 타운 세계석',
  'Pipe Isles Worldstone': '파이프 아일즈 세계석',
  'Rift Valley Worldstone': '리프트 밸리 세계석',
  'Ripe Land Worldstone': '라이프 랜드 세계석',
  'Rotten Saddle West Worldstone': '로튼 새들 서쪽 세계석',
  'Rotten Saddle Worldstone': '로튼 새들 세계석',
  'Shadow Cape Worldstone': '쉐도우 케이프 세계석',
  'SIGMA Worldstone': '시그마 세계석',
  'Silentfire Worldstone': '사일런트파이어 세계석',
  'Snakebelly Worldstone': '스네이크벨리 세계석',
  'Snaketail Worldstone': '스네이크테일 세계석',
  'Snakeye Pass Worldstone': '스네이크아이 패스 세계석',
  'Snow Cliffs Worldstone': '스노 클리프 세계석',
  'South Delta Worldstone': '사우스 델타 세계석',
  'South Fort Eyrie Worldstone': '포트 에이리 남쪽 세계석',
  'South Greenlake Worldstone': '그린레이크 남쪽 세계석',
  'South Highbank Worldstone': '하이뱅크 남쪽 세계석',
  'South Valley Worldstone': '사우스 밸리 세계석',
  'Sulfur Pool Worldstone': '유황 풀 세계석',
  'Taiga Exclusion Zone Worldstone': '타이가 격리구역 세계석',
  'THETA Worldstone': '세타 세계석',
  'Tidal Bore Worldstone': '타이달 보어 세계석',
  'Tundra Monolith Worldstone': '툰드라 모노리스 세계석',
  'Waterfall Worldstone': '폭포 세계석',
  'Waterside Worldstone': '워터사이드 세계석',
  'West Gaia Worldstone': '가이아 서쪽 세계석',
  'West Highbank Worldstone': '하이뱅크 서쪽 세계석',
  'Whalebone Bay Worldstone': '웨일본 베이 세계석',
  'Wild Dog Isle Worldstone': '들개 섬 세계석',
  'Winding Ridge Worldstone': '와인딩 리지 세계석',
  'Windward Worldstone': '윈드워드 세계석',
  'Wish Land Worldstone': '위시 랜드 세계석',
  'Woodland Ranch Worldstone': '우드랜드 랜치 세계석',
};

// --- village (정착지/마을 이름) ---
const VILLAGE_KR = {
  'Abandoned Farm': '폐 농장',
  'Abandoned Hideout': '폐 은신처',
  'Abandoned Water Tower': '폐 급수탑',
  'Aiden\'s Auto Repair': '에이든의 정비소',
  'Aiden\'s Hideout': '에이든의 은신처',
  'Alkirk Wind Power Station': '알커크 풍력발전소',
  'Ashenton Bus Station': '애쉬턴 버스정류장',
  'Barque Farmstead': '바크 농장',
  'Believer Colony': '신도 식민지',
  'Black Lake Harbor': '블랙 레이크 항구',
  'Boardwalk Cabin': '보드워크 오두막',
  'Breezy Shores Resort': '브리지 쇼어스 리조트',
  'Brewery Estate': '양조장 에스테이트',
  'Broken Bridge': '무너진 다리',
  'Brookham Camp': '브루컴 캠프',
  'Brookham Guardhouse': '브루컴 초소',
  'Cable Camp': '케이블 캠프',
  'Cable Warehouse': '케이블 창고',
  'Cave Mouth Camp': '동굴 입구 캠프',
  'Cedar Cabin': '시더 오두막',
  'Charred Wasteland': '불탄 황무지',
  'Citrus County Camp': '시트러스 카운티 캠프',
  'Cliffside Camp': '절벽 캠프',
  'Cliffside Ruins': '절벽 유적',
  'Clifton': '클리프턴',
  'Column Lookout': '칼럼 전망대',
  'Column Outpost': '칼럼 전초기지',
  'Container Restaurant': '컨테이너 식당',
  'Containers Near Overlook Town': '오버룩 타운 근처 컨테이너',
  'Dangling Vessel Cove': '댕글링 배 만',
  'Davis Point': '데이비스 포인트',
  'Depleted Oil Well': '고갈된 유정',
  'Derelict Wharf': '폐 부두',
  'Deserted House': '버려진 집',
  'Desolate Dock': '황량한 부두',
  'Emberglow Cavern': '엠버글로 동굴',
  'Factory Sentry': '팩토리 센트리',
  'Fire Ascent': '파이어 어센트',
  'Firethroat Outskirts': '파이어스로트 외곽',
  'Firethroat Slums': '파이어스로트 빈민가',
  'Firewatch Harbor': '파이어워치 항구',
  'Fisherman\'s Wharf': '어부의 부두',
  'Flame Sanctuary': '플레임 생츄어리',
  'Forgotten Camp': '잊혀진 캠프',
  'Fortress Perch': '포트리스 퍼치',
  'Furnace Windmills': '퍼니스 풍차',
  'Gaia Communication Array': '가이아 통신 시설',
  'Ghost Village': '유령 마을',
  'Gloomsport': '글룸스포트',
  'Grandma Nina\'s Diner': '할머니 니나의 식당',
  'Grandview mansion': '그랜드뷰 맨션',
  'Greendale': '그린데일',
  'Greenlake Visitor Center': '그린레이크 방문자센터',
  'Greywater Windmill': '그레이워터 풍차',
  'High Banks Inspection Point': '하이 뱅크스 검문소',
  'High Banks Nest': '하이 뱅크스 둥지',
  'Highland Residential Zone': '하이랜드 주거지구',
  'Hilly Homestead': '힐리 홈스테드',
  'Holt Power Station': '홀트 발전소',
  'Hot Spring Inn': '온천 여관',
  'Inspection Point 023': '검문소 023',
  'Inspection Point 024': '검문소 024',
  'Inspection Point 091': '검문소 091',
  'Inspection Point 266': '검문소 266',
  'Inspection Point 3771': '검문소 3771',
  'Inspection Point 384': '검문소 384',
  'Inspection Point 653': '검문소 653',
  'Inspection Point 7802': '검문소 7802',
  'Inspection Point 9043': '검문소 9043',
  'Knight Vehicle Repairs': '나이트 차량 정비소',
  'Lakefront Cabin': '레이크프론트 오두막',
  'Lakeheart Camp': '레이크하트 캠프',
  'Lakeshore Camp': '레이크쇼어 캠프',
  'Lakeside Market': '레이크사이드 마켓',
  'Lighthouse': '등대',
  'Lookout': '전망대',
  'Lookout Point': '전망 포인트',
  'Lost Harbor': '로스트 하버',
  'Meyer': '마이어',
  'Mining Town': '광산 마을',
  'Mola Island Visitor Center': '몰라 섬 방문자센터',
  'Monolith Base Camp': '모노리스 베이스 캠프',
  'Monolith Ruin Transition Zone': '모노리스 유적 전환구역',
  'Mount Guel Power': '마운트 구엘 발전소',
  'Mountain Path': '산길',
  'Mountain Trail Camp': '산길 캠프',
  'Nestwood Overlook': '네스트우드 전망대',
  'Nestwood Station': '네스트우드 스테이션',
  'North Shore Camp': '노스 쇼어 캠프',
  'Norton Farm': '노턴 농장',
  'Obsidian Lighthouse': '옵시디언 등대',
  'Offshore Stardust Monitoring Station': '해상 스타더스트 관측소',
  'Offshore Wind Farm': '해상 풍력발전소',
  'Overlook Lumberyard': '오버룩 제재소',
  'Overlook Town Dock': '오버룩 타운 부두',
  'Paisley Plaza': '페이즐리 광장',
  'Petit Harbor': '프티 하버',
  'Pine Hunting Ground': '파인 사냥터',
  'Pollution Inspection Point 77': '오염 검문소 77',
  'Prospect Heights': '프로스펙트 하이츠',
  'Prospect Observation Desk': '프로스펙트 관측소',
  'Ransacked Camp': '약탈된 캠프',
  'Redshore Power': '레드쇼어 발전소',
  'Ridge Camp': '리지 캠프',
  'Ridge Transfer Station': '리지 환승역',
  'Ripe Earth Farmstead': '라이프 어스 농장',
  'Rippleby Market': '리플비 마켓',
  'Riverhart Harbor': '리버하트 항구',
  'Riverheart Camp': '리버하트 캠프',
  'Riverside Souvenirs': '리버사이드 기념품점',
  'Roadside Picnic': '로드사이드 피크닉',
  'Rosetta Outpost': '로제타 전초기지',
  'Rundown Camp': '낡은 캠프',
  'Saddlefront Camp': '새들프론트 캠프',
  'Sanctuary Camp': '생츄어리 캠프',
  'Sandview': '샌드뷰',
  'Scorchwind Observatory': '스코치윈드 전망대',
  'Sea-view Mansion': '시뷰 맨션',
  'Seaside Hut': '해변 오두막',
  'Secret Harbor': '시크릿 하버',
  'Serpent\'s Belly Cave': '서펜트 배 동굴',
  'Serpent\'s Gaze Lookout': '서펜트 시선 전망대',
  'Serpent\'s Tail Camp': '서펜트 꼬리 캠프',
  'Shanty House': '판잣집',
  'Ship Graveyard': '선박 묘지',
  'Shoal Park': '숄 파크',
  'Signal Station': '신호소',
  'Signal Station Camp': '신호소 캠프',
  'Simple Depot': '간이 창고',
  'Skelsen Orchard': '스켈센 과수원',
  'Skids Camp': '스키즈 캠프',
  'Snowfield Checkpoint': '설원 검문소',
  'Springdam House': '스프링댐 하우스',
  'Stranded Marsh': '좌초된 습지',
  'Strangefire Wharf': '스트레인지파이어 부두',
  'Street Food Stall': '길거리 음식점',
  'Submerged Ruins': '수몰된 유적',
  'Sunbury Auto Repairs': '선버리 정비소',
  'Sunbury Camp': '선버리 캠프',
  'Sunbury Farm': '선버리 농장',
  'Sunken House': '침몰한 집',
  'Survey Camp': '탐사 캠프',
  'Survivor\'s Camp': '생존자의 캠프',
  'Sutherland Family Orchard': '서덜랜드 가문 과수원',
  'Sweet Factory Warehouse': '스위트 팩토리 창고',
  'TAB-6A Camp': 'TAB-6A 캠프',
  'Temporary Campsite': '임시 야영지',
  'Thawbreak Harbor': '쏘우브레이크 항구',
  'The Boss\'s Playground': '보스의 놀이터',
  'The Bunker Below the Cliff': '절벽 아래 벙커',
  'The Bunker Under the Falls': '폭포 아래 벙커',
  'Throughville Substation': '스루빌 변전소',
  'Tidal Farm': '타이달 농장',
  'Cape Manor': '케이프 매너',
  'Hearst': '허스트',
  'Hearst Mudflats': '허스트 머드플랫',
  'Vale Residence': '베일 레지던스',
  'Warm Hearth Camp': '따뜻한 화덕 캠프',
  'Water Tower Camp by Sutherland Family Orchard': '서덜랜드 과수원 급수탑 캠프',
  'Waterfall Plaza': '폭포 광장',
  'Whalebone': '웨일본',
  'Whalebone Ruins': '웨일본 유적',
  'Wild Camp': '야생 캠프',
  'Wild Dog Hideout': '들개 은신처',
  'Wildlane Camp': '와일드레인 캠프',
  'Wind Farm': '풍력발전소',
  'Winding Ridge Farmland': '와인딩 리지 농지',
  'Wish Land East Entrance': '위시 랜드 동쪽 입구',
  'Wish Land West Entrance': '위시 랜드 서쪽 입구',
  'Woodland Ranch': '우드랜드 랜치',
  'Zipline Camp': '짚라인 캠프',
};

// --- echo (별빛 메아리 수집품 이름) ---
const ECHO_KR = {
  'A New Start': '새로운 시작',
  'A Promising Start': '유망한 시작',
  'A Securement Mission': '확보 임무',
  'Caged Bird': '새장 속 새',
  'Choosing to Leave': '떠나기로 한 선택',
  'Covert Operation': '비밀 작전',
  'Denise Cooper\'s Journal': '데니스 쿠퍼의 일지',
  'Everything Going Wrong': '모든 것이 잘못되다',
  'Expedition Memo': '탐사 메모',
  'Gravestone': '묘비',
  'Is a Symbiosis Possible?': '공생이 가능한가?',
  'Over the Threshold': '임계점을 넘어',
  'Roadblock': '장애물',
  'Rogue Brother': '변절한 형제',
  'So Much Has Changed': '많은 것이 변했다',
  'Star-0427': 'Star-0427',
  'Steady Flow': '안정된 흐름',
  'Targetless': '목표 없는',
  'Temporary Notice': '임시 공지',
  'The Rise of Bloodbeak': '블러드비크의 부상',
  'Unfamiliar Homeland': '낯선 고향',
};

// --- viewpoint (전망대) ---
const VIEWPOINT_KR = {
  'Bear\'s Den': '곰의 소굴',
  'Crescent Lake': '크레센트 호수',
  'White Cliff Black Sector': '화이트 클리프 블랙 구역',
};

// --- 엔트로피 허브 패턴 ---
function resolveEntropyHub(engName) {
  const m = engName.match(/^T(\d+)-(\d+)\s+Public Thermal Tower$/);
  if (m) return `공용 열 타워 T${m[1]}-${m[2]}`;
  return engName;
}

// ─── 무의미한 일반 이름 ───
const GENERIC_NAMES = new Set(['Engagement Zone', 'Extraction Sites']);

// ─── 통합 번역 함수 ───
function translateToKorean(engName, category) {
  if (!engName) return null;
  if (GENERIC_NAMES.has(engName)) return null; // 카테고리명 사용

  if (category === 'transport') return TRANSPORT_KR[engName] || engName;
  if (category === 'village') return VILLAGE_KR[engName] || engName;
  if (category === 'echo') return ECHO_KR[engName] || engName;
  if (category === 'viewpoint') return VIEWPOINT_KR[engName] || engName;
  if (category === 'entropy_hub') return resolveEntropyHub(engName);

  return engName;
}

// ─── 맵 접미사 ───
const MAP_SUFFIXES = ['_e_jzhy', '_ne_frac', '_ne_wjcm', '_ne_dv', '_n_xgrs', '_n_xgrs2'];

function resolveEnglishName(spawnId) {
  if (!spawnId) return null;
  let val = DICT[spawnId];
  if (val) {
    if (typeof val === 'string' && val.startsWith('@')) val = DICT[val] || val;
    if (typeof val === 'string' && !val.includes('<b>') && !val.startsWith('@')) return val;
  }
  for (const suffix of MAP_SUFFIXES) {
    if (spawnId.endsWith(suffix)) return resolveEnglishName(spawnId.slice(0, -suffix.length));
  }
  return null;
}

function extractIdFromLabel(label) {
  const match = label.match(/\(([^)]+)\)$/);
  return match ? match[1] : null;
}

function needsFix(label) {
  if (!label) return false;
  if (/#\d+$/.test(label)) return false;
  if (/\([0-9A-F]{8}-/i.test(label)) return true;
  if (/\(T\d+_\d+/.test(label)) return true;
  if (/\([^)]*_[^)]+\)$/.test(label)) return true;
  return false;
}

function fixLabel(poi) {
  const { label, category } = poi;
  if (!needsFix(label)) return label;

  const catKr = CAT_KR[category] || category;
  const spawnId = extractIdFromLabel(label);
  if (!spawnId) return catKr;

  const engName = resolveEnglishName(spawnId);
  if (engName) {
    const kr = translateToKorean(engName, category);
    return kr || catKr;
  }
  return catKr;
}

// ─── 메인 ───
function main() {
  const files = ['seed-pois-tos-additions.json', 'seed-pois-wow-additions.json'];

  for (const filename of files) {
    const filepath = path.resolve(__dirname, filename);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    let fixedCount = 0;
    const changes = [];

    for (const poi of data) {
      const oldLabel = poi.label;
      const newLabel = fixLabel(poi);
      if (newLabel !== oldLabel) {
        poi.label = newLabel;
        fixedCount++;
        if (changes.length < 10) changes.push({ old: oldLabel, new: newLabel });
      }
    }

    // 동일 이름 중복 시 번호 추가 (3개 이상)
    const nameCounts = {};
    for (const poi of data) {
      const key = `${poi.category}|||${poi.label}`;
      if (!nameCounts[key]) nameCounts[key] = [];
      nameCounts[key].push(poi);
    }
    for (const [, pois] of Object.entries(nameCounts)) {
      if (pois.length >= 3) {
        pois.forEach((p, i) => { p.label = `${p.label} ${i + 1}`; });
      }
    }

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf8');

    console.log(`\n=== ${filename} ===`);
    console.log(`총: ${data.length}, 수정: ${fixedCount}`);
    console.log('\n--- 샘플 ---');
    for (const c of changes) console.log(`  "${c.old}" → "${c.new}"`);

    console.log('\n--- 카테고리별 ---');
    const cats = {};
    for (const poi of data) {
      if (!cats[poi.category]) cats[poi.category] = [];
      if (cats[poi.category].length < 3) cats[poi.category].push(poi.label);
    }
    for (const [cat, s] of Object.entries(cats)) console.log(`  ${cat}: ${s.join(' | ')}`);
  }
}

main();
