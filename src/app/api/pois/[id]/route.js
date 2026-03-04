import { db } from '@/db';
import { pois } from '@/db/schema';
import { requireMember } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function PUT(req, { params }) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const existing = await db.select().from(pois).where(eq(pois.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    const result = await db.update(pois)
      .set({
        category: body.category || existing[0].category,
        group: body.group || existing[0].group,
        label: body.label || existing[0].label,
        x: body.x != null && !isNaN(Number(body.x)) ? Number(body.x) : existing[0].x,
        y: body.y != null && !isNaN(Number(body.y)) ? Number(body.y) : existing[0].y,
        note: body.note ?? existing[0].note,
        scenario: body.scenario ?? existing[0].scenario,
      })
      .where(eq(pois.id, parsedId))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT /api/pois/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update POI' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const existing = await db.select().from(pois).where(eq(pois.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.delete(pois).where(eq(pois.id, parsedId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/pois/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete POI' }, { status: 500 });
  }
}
