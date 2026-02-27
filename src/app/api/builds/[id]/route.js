import { db } from '@/db';
import { builds } from '@/db/schema';
import { requireMember } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const rows = await db.select().from(builds).where(eq(builds.id, parseInt(id)));
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const r = rows[0];
    return NextResponse.json({
      id: r.id, name: r.name, author: r.author, image: r.image,
      mainWeapon: r.mainWeapon, subWeapon: r.subWeapon, grade: r.grade,
      tuning: r.tuning || [], modules: r.modules || [],
      infections: r.infections || [], doping: r.doping || [],
      armorSet: r.armorSet, armorOptions: r.armorOptions || [],
      suffixes: r.suffixes || [], leather: r.leather || [],
      notes: r.notes, category: r.category, weaponType: r.weaponType,
      tags: r.tags || [], likes: r.likes || 0, date: r.date,
    });
  } catch (error) {
    console.error('GET /api/builds/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch build' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.delete(builds).where(eq(builds.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/builds/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete build' }, { status: 500 });
  }
}
