/**
 * 데이터 시딩 스크립트
 * 사용법: DATABASE_URL=postgresql://... node src/db/seed.js
 *
 * src/data/index.js 의 하드코딩 데이터를 Neon Postgres DB에 삽입합니다.
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { builds, members, blacklist, mapPins } from './schema.js';

// 하드코딩 데이터 import
import { BUILDS, MEMBERS, BLACKLIST, MAP_PINS } from '../data/index.js';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seed() {
  console.log('🌱 시딩 시작...');

  // 1. Builds
  if (BUILDS.length > 0) {
    console.log(`📦 빌드 ${BUILDS.length}개 삽입 중...`);
    for (const b of BUILDS) {
      await db.insert(builds).values({
        name: b.name,
        author: b.author,
        image: b.image,
        mainWeapon: b.mainWeapon,
        subWeapon: b.subWeapon,
        grade: b.grade,
        tuning: b.tuning || [],
        modules: b.modules || [],
        infections: b.infections || [],
        doping: b.doping || [],
        armorSet: b.armorSet,
        armorOptions: b.armorOptions || [],
        suffixes: b.suffixes || [],
        leather: b.leather || [],
        notes: b.notes,
        category: b.category,
        weaponType: b.weaponType,
        tags: b.tags || [],
        likes: b.likes || 0,
        date: b.date,
      });
    }
    console.log('  ✅ 빌드 완료');
  }

  // 2. Members
  if (MEMBERS.length > 0) {
    console.log(`👥 멤버 ${MEMBERS.length}명 삽입 중...`);
    for (const m of MEMBERS) {
      await db.insert(members).values({
        name: m.name,
        role: m.role,
        scenario: m.scenario || '',
        joinDate: m.joinDate,
        note: m.note || '',
      });
    }
    console.log('  ✅ 멤버 완료');
  }

  // 3. Blacklist
  if (BLACKLIST.length > 0) {
    console.log(`🚫 블랙리스트 ${BLACKLIST.length}명 삽입 중...`);
    for (const bl of BLACKLIST) {
      await db.insert(blacklist).values({
        name: bl.name,
        uuid: bl.uuid || '',
        alts: bl.alts || '',
        clan: bl.clan || '',
        incident: bl.incident || '',
        severity: bl.severity || 'medium',
        date: bl.date,
        reporter: bl.reporter || '',
      });
    }
    console.log('  ✅ 블랙리스트 완료');
  }

  // 4. Map Pins
  if (MAP_PINS.length > 0) {
    console.log(`📍 지도 핀 ${MAP_PINS.length}개 삽입 중...`);
    for (const p of MAP_PINS) {
      await db.insert(mapPins).values({
        x: p.x,
        y: p.y,
        label: p.label,
        author: p.author || '',
        note: p.note || '',
        color: p.color || '#44ff88',
      });
    }
    console.log('  ✅ 지도 핀 완료');
  }

  console.log('🎉 시딩 완료!');
}

seed().catch((e) => {
  console.error('❌ 시딩 실패:', e);
  process.exit(1);
});
