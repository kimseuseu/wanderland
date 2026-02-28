import { db } from '@/db';
import { blacklist } from '@/db/schema';
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

    const existing = await db.select().from(blacklist).where(eq(blacklist.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!canModify(session, existing[0], 'reporter')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const result = await db.update(blacklist)
      .set({
        name: body.name,
        uuid: body.uuid || '',
        alts: body.alts || '',
        clan: body.clan || '',
        incident: body.incident || '',
        image: body.image !== undefined ? body.image : existing[0].image,
      })
      .where(eq(blacklist.id, parsedId))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT /api/blacklist/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
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

    const existing = await db.select().from(blacklist).where(eq(blacklist.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!canModify(session, existing[0], 'reporter')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(blacklist).where(eq(blacklist.id, parsedId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/blacklist/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
