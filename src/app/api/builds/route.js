import { NextResponse } from 'next/server';
import { BUILDS } from '@/data';

async function getFromDB() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { db } = await import('@/db');
    const { builds } = await import('@/db/schema');
    const { desc } = await import('drizzle-orm');
    const rows = await db.select().from(builds).orderBy(desc(builds.id));
    return rows.map((r) => ({
      id: r.id, name: r.name, author: r.author, discordId: r.discordId, image: r.image,
      mainWeapon: r.mainWeapon, subWeapon: r.subWeapon, grade: r.grade,
      tuning: r.tuning || [], modules: r.modules || [],
      infections: r.infections || [], doping: r.doping || [],
      armorSet: r.armorSet, armorOptions: r.armorOptions || [],
      suffixes: r.suffixes || [], leather: r.leather || [],
      notes: r.notes, category: r.category, weaponType: r.weaponType,
      tags: r.tags || [], likes: r.likes || 0, date: r.date,
    }));
  } catch { return null; }
}

export async function GET() {
  const dbData = await getFromDB();
  if (dbData) return NextResponse.json(dbData);
  // Fallback: 하드코딩 데이터 사용
  return NextResponse.json(BUILDS);
}

export async function POST(req) {
  const { requireMember } = await import('@/lib/auth');
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await import('@/db');
    const { builds } = await import('@/db/schema');
    const body = await req.json();
    const result = await db.insert(builds).values({
      name: body.name,
      author: body.author || session.user?.name || '익명',
      image: body.image,
      mainWeapon: body.mainWeapon,
      subWeapon: body.subWeapon,
      grade: body.grade,
      tuning: body.tuning || [],
      modules: body.modules || [],
      infections: body.infections || [],
      doping: body.doping || [],
      armorSet: body.armorSet,
      armorOptions: body.armorOptions || [],
      suffixes: body.suffixes || [],
      leather: body.leather || [],
      notes: body.notes,
      category: body.category,
      weaponType: body.weaponType,
      tags: body.tags || [],
      likes: 0,
      date: new Date().toISOString().split('T')[0],
      discordId: session.discordId || null,
    }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/builds error:', error);
    return NextResponse.json({ error: 'Failed to create build' }, { status: 500 });
  }
}
