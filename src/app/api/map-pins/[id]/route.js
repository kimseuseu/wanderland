import { db } from '@/db';
import { mapPins } from '@/db/schema';
import { requireMember, canModify } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function PUT(req, { params }) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    const existing = await db.select().from(mapPins).where(eq(mapPins.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!canModify(session, existing[0], 'author')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const result = await db.update(mapPins)
      .set({
        label: body.label,
        note: body.note || '',
        color: body.color || '#44ff88',
        category: body.category || existing[0].category || 'etc',
        scenario: body.scenario || null,
        server: body.server ? parseInt(body.server) : null,
        visibility: body.visibility || existing[0].visibility || 'public',
      })
      .where(eq(mapPins.id, parsedId))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT /api/map-pins/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update pin' }, { status: 500 });
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

    const existing = await db.select().from(mapPins).where(eq(mapPins.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!canModify(session, existing[0], 'author')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(mapPins).where(eq(mapPins.id, parsedId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/map-pins/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete pin' }, { status: 500 });
  }
}
