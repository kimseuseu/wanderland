export const BUILDS = [
  {
    id: 1,
    name: "SKS 탐색자 빌드",
    author: "춘영",
    image: "/images/sks-build.png",
    mainWeapon: "SKS - 탐색자",
    subWeapon: "리커브석궁",
    grade: "전설",
    tuning: ["안크크", "심크크"],
    modules: [
      "섬광 프로스트 볼텍스",
      "달의 징조",
      "공명 어빌리티",
      "추락하는 별 어빌리티",
    ],
    infections: ["저주인형", "해파리"],
    doping: ["에드, 아드", "춘권, 커틀릿 or 쿨민트 통조림"],
    armorSet: "화이트크래시 상의",
    armorOptions: ["세이버3 + 어둠2", "폴른4 + 어둠1"],
    suffixes: [
      { part: "무기", suffix: "아이스 코어 각성", keyword: "프로스트 볼텍스", type: "섬광" },
      { part: "보조무기", suffix: "인장 증폭", keyword: "헌터 마크", type: "섬광" },
      { part: "헬멧", suffix: "무기 교향곡", keyword: "달의 징조", type: "클래식" },
      { part: "마스크", suffix: "얼음 창조물", keyword: "프로스트 볼텍스", type: "클래식" },
      { part: "상의", suffix: "우위 유지", keyword: "달의 징조", type: "클래식" },
      { part: "하의①", suffix: "재보급", keyword: "공명 어빌리티", type: "신판" },
      { part: "하의②", suffix: "원소 공명", keyword: "공명 어빌리티", type: "신판" },
      { part: "장갑", suffix: "크리티컬 강화", keyword: "공명 어빌리티", type: "신판" },
      { part: "신발①", suffix: "전장 수확", keyword: "추락하는 별 어빌리티", type: "신판" },
      { part: "신발②", suffix: "피크 타임", keyword: "추락하는 별 어빌리티", type: "신판" },
    ],
    leather: [
      { part: "머리", name: "달의 징조" },
      { part: "마스크", name: "럭키 토끼" },
      { part: "상하의", name: "황늑" },
      { part: "장갑", name: "황늑" },
      { part: "신발", name: "황늑" },
    ],
    notes:
      "스크스의 경우 단발 대미지가 중요한 만큼 텅스텐 저격 철갑탄이 분열형 저격소총 철갑탄 보다 좋음.\n\n달의징조<크&총> + 헌터마크 + 쿠크리 + 리커브석궁<원크약크> + 커틀릿 춘권 / 상위자 구간 가장 우세",
    tags: ["PvE", "저격", "SKS"],
    likes: 42,
    date: "2026-02-25",
  },
];

export const BLACKLIST = [
  {
    id: 1,
    name: "xDarkKill3r",
    uuid: "OH-29481-KR",
    alts: "킬러봇, DK_서브",
    clan: "무소속",
    incident:
      "레이드 중 아이템 먹튀 후 탈퇴. 하이브 창고에서 희귀 자원 다수 도난.",
    severity: "high",
    date: "2026-02-22",
    reporter: "간편",
  },
  {
    id: 2,
    name: "트롤마스터",
    uuid: "OH-10283-KR",
    alts: "트롤킹, 어그로꾼",
    clan: "다크나이츠",
    incident:
      "지속적인 아군 공격 및 건축물 파괴. 여러 하이브에서 동일 신고 접수.",
    severity: "high",
    date: "2026-02-19",
    reporter: "딸기코",
  },
  {
    id: 3,
    name: "거래사기꾼",
    uuid: "OH-55102-KR",
    alts: "정직한상인",
    clan: "무소속",
    incident: "거래소에서 사기 거래 반복. 레어 아이템 거래 후 잠수.",
    severity: "medium",
    date: "2026-02-14",
    reporter: "씨뽀",
  },
];

export const MEMBERS = [
  { id: 1, name: "간편", role: "낙원가이드", level: 60, deviance: 95, joinDate: "2025-01-15", note: "하이브장" },
  { id: 2, name: "춘영", role: "낙원가이드", level: 58, deviance: 88, joinDate: "2025-01-15", note: "웹사이트 제작자" },
  { id: 3, name: "씨뽀", role: "낙원가이드", level: 55, deviance: 85, joinDate: "2025-02-01", note: "" },
  { id: 4, name: "딸기코", role: "베테랑사원", level: 52, deviance: 72, joinDate: "2025-02-10", note: "" },
  { id: 5, name: "찌콩", role: "베테랑사원", level: 50, deviance: 60, joinDate: "2025-02-15", note: "" },
  { id: 6, name: "빙박", role: "베테랑사원", level: 48, deviance: 90, joinDate: "2025-03-01", note: "" },
  { id: 7, name: "Ahyr", role: "베테랑사원", level: 45, deviance: 55, joinDate: "2025-03-10", note: "" },
];

export const MAP_PINS = [
  { id: 1, x: 25, y: 30, label: "희귀 광물 채집지", author: "간편", note: "밤 시간에만 스폰. 디비전스 몬스터 주의", color: "#44ff88" },
  { id: 2, x: 55, y: 45, label: "보스 스폰 지점", author: "씨뽀", note: "매 30분마다 리젠. 4인 파티 권장", color: "#ff4444" },
  { id: 3, x: 70, y: 25, label: "안전 거래소", author: "딸기코", note: "PvP 비활성 구역. 거래 시 이곳 추천", color: "#ffaa44" },
  { id: 4, x: 40, y: 65, label: "크레이들 업그레이드", author: "빙박", note: "Lv.5 크레이들 부품 드랍 확인됨", color: "#4488ff" },
  { id: 5, x: 15, y: 70, label: "낙원 하이브 기지", author: "간편", note: "우리 메인 기지. 방어 시설 완비", color: "#ffffff" },
];
