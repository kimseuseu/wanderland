import { db } from '@/db';
import { mapRoutes } from '@/db/schema';
import { requireMember, canModify } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function DELETE(req, { params }) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const parsedId = parseInt(id);
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
