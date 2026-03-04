import { db } from '@/db';
import { builds } from '@/db/schema';
import { requireMember, canModify } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

function mapBuild(r) {
  return {
    id: r.id, name: r.name, author: r.author, discordId: r.discordId, image: r.image,
    mainWeapon: r.mainWeapon, subWeapon: r.subWeapon, grade: r.grade,
    tuning: r.tuning || [], modules: r.modules || [],
    infections: r.infections || [], doping: r.doping || [],
    armorSet: r.armorSet, armorOptions: r.armorOptions || [],
    suffixes: r.suffixes || [], leather: r.leather || [],
    notes: r.notes, category: r.category, weaponType: r.weaponType,
    tags: r.tags || [], likes: r.likes || 0, date: r.date,
  };
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    const rows = await db.select().from(builds).where(eq(builds.id, parsedId));
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(mapBuild(rows[0]));
  } catch (error) {
    console.error('GET /api/builds/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch build' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const existing = await db.select().from(builds).where(eq(builds.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!canModify(session, existing[0], 'author')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const result = await db.update(builds)
      .set({
        name: body.name,
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
      })
      .where(eq(builds.id, parsedId))
      .returning();

    return NextResponse.json(mapBuild(result[0]));
  } catch (error) {
    console.error('PUT /api/builds/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update build' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const existing = await db.select().from(builds).where(eq(builds.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!canModify(session, existing[0], 'author')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(builds).where(eq(builds.id, parsedId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/builds/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete build' }, { status: 500 });
  }
}
