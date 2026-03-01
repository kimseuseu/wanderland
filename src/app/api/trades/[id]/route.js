import { db } from '@/db';
import { trades } from '@/db/schema';
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

    const existing = await db.select().from(trades).where(eq(trades.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!canModify(session, existing[0], 'author')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const result = await db.update(trades)
      .set({
        type: body.type ?? existing[0].type,
        title: body.title ?? existing[0].title,
        item: body.item ?? existing[0].item,
        quantity: body.quantity ?? existing[0].quantity,
        price: body.price !== undefined ? body.price : existing[0].price,
        description: body.description !== undefined ? body.description : existing[0].description,
        image: body.image !== undefined ? body.image : existing[0].image,
        status: body.status ?? existing[0].status,
        scenario: body.scenario !== undefined ? body.scenario : existing[0].scenario,
        server: body.server !== undefined ? body.server : existing[0].server,
      })
      .where(eq(trades.id, parsedId))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT /api/trades/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
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

    const existing = await db.select().from(trades).where(eq(trades.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!canModify(session, existing[0], 'author')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(trades).where(eq(trades.id, parsedId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/trades/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 });
  }
}
