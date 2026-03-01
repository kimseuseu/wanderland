import { db } from '@/db';
import { guides } from '@/db/schema';
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
    const result = await db.select().from(guides).where(eq(guides.id, parsedId));
    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Increment views
    await db.update(guides)
      .set({ views: (result[0].views || 0) + 1 })
      .where(eq(guides.id, parsedId));

    return NextResponse.json({ ...result[0], views: (result[0].views || 0) + 1 });
  } catch (error) {
    console.error('GET /api/guides/[id] error:', error);
    return NextResponse.json({ error: 'Failed to get guide' }, { status: 500 });
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

    const existing = await db.select().from(guides).where(eq(guides.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!canModify(session, existing[0], 'author')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const result = await db.update(guides)
      .set({
        title: body.title ?? existing[0].title,
        category: body.category ?? existing[0].category,
        content: body.content !== undefined ? body.content : existing[0].content,
        summary: body.summary !== undefined ? body.summary : existing[0].summary,
        image: body.image !== undefined ? body.image : existing[0].image,
        tags: body.tags !== undefined ? body.tags : existing[0].tags,
        updatedAt: new Date(),
      })
      .where(eq(guides.id, parsedId))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT /api/guides/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 });
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

    const existing = await db.select().from(guides).where(eq(guides.id, parsedId));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!canModify(session, existing[0], 'author')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(guides).where(eq(guides.id, parsedId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/guides/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 });
  }
}
