// POI 카테고리 정의 (원스휴먼 게임 POI)
export const POI_GROUPS = [
  {
    key: 'locations',
    label: '위치',
    categories: [
      { key: 'monolith', label: '모노리스', emoji: '🏛️' },
      { key: 'silo', label: '보안 사일로', emoji: '🔒' },
      { key: 'worldstone', label: '워프 타워', emoji: '💠' },
      { key: 'village', label: '마을', emoji: '🏘️' },
      { key: 'camp', label: '캠프', emoji: '⛺' },
      { key: 'transport', label: '이동장치', emoji: '🚁' },
    ],
  },
  {
    key: 'loot',
    label: '전리품',
    categories: [
      { key: 'crate_mystical', label: '신비로운 상자', emoji: '✨' },
      { key: 'crate_weapon', label: '무기 상자', emoji: '🗡️' },
      { key: 'crate_gear', label: '장비 상자', emoji: '⚙️' },
      { key: 'crate_morphic', label: '모르픽 상자', emoji: '🧬' },
      { key: 'hoard', label: '비축물', emoji: '📦' },
    ],
  },
  {
    key: 'creatures',
    label: '생물',
    categories: [
      { key: 'boss', label: '보스', emoji: '💀' },
      { key: 'elite', label: '엘리트', emoji: '⚔️' },
      { key: 'deviant', label: '변이체', emoji: '🧪' },
    ],
  },
  {
    key: 'resources',
    label: '자원',
    categories: [
      { key: 'ore', label: '광석', emoji: '⛏️' },
      { key: 'plant', label: '식물', emoji: '🌿' },
      { key: 'fish_spot', label: '낚시터', emoji: '🎣' },
    ],
  },
  {
    key: 'knowledge',
    label: '지식',
    categories: [
      { key: 'viewpoint', label: '전망대', emoji: '🔭' },
      { key: 'riddle', label: '수수께끼', emoji: '🧩' },
      { key: 'echo', label: '별빛 메아리', emoji: '🌟' },
      { key: 'record', label: '지역 기록', emoji: '📜' },
      { key: 'note', label: '노트', emoji: '📝' },
    ],
  },
];

// 전체 카테고리 flat 배열
export const ALL_POI_CATEGORIES = POI_GROUPS.flatMap((g) =>
  g.categories.map((c) => ({ ...c, group: g.key, groupLabel: g.label }))
);

// 카테고리 key → 정보 매핑
export const POI_CATEGORY_MAP = Object.fromEntries(
  ALL_POI_CATEGORIES.map((c) => [c.key, c])
);

// 전체 카테고리 키 Set
export const ALL_POI_KEYS = new Set(ALL_POI_CATEGORIES.map((c) => c.key));
