import { db } from '@/db';
import { mapRoutes } from '@/db/schema';
import { requireMember, canModify } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function GET(req, { params }) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const result = await db.select().from(mapRoutes).where(eq(mapRoutes.id, parsedId));
    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('GET /api/map-routes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 });
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

    const existing = await db.select().from(mapRoutes).where(eq(mapRoutes.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (!canModify(session, existing[0], 'author')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const result = await db.update(mapRoutes)
      .set({
        label: body.label ?? existing[0].label,
        points: body.points ?? existing[0].points,
        color: body.color ?? existing[0].color,
        note: body.note !== undefined ? body.note : existing[0].note,
        scenario: body.scenario !== undefined ? body.scenario : existing[0].scenario,
        visibility: body.visibility ?? existing[0].visibility,
      })
      .where(eq(mapRoutes.id, parsedId))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT /api/map-routes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 });
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

    const existing = await db.select().from(mapRoutes).where(eq(mapRoutes.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (!canModify(session, existing[0], 'author')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await db.delete(mapRoutes).where(eq(mapRoutes.id, parsedId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/map-routes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  }
}
