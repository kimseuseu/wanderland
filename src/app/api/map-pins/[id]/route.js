import { db } from '@/db';
import { mapPins } from '@/db/schema';
import { requireMember } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function DELETE(req, { params }) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.delete(mapPins).where(eq(mapPins.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/map-pins/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete pin' }, { status: 500 });
  }
}
