import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pois } from '@/db/schema';
import { requireMember } from '@/lib/auth';

export async function GET() {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await db.select().from(pois);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/pois error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 관리자만 POI 추가 가능
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.label || !body.category || !body.group || body.x == null || body.y == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.insert(pois).values({
      category: body.category,
      group: body.group,
      label: body.label,
      x: body.x,
      y: body.y,
      note: body.note || null,
      scenario: body.scenario || null,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/pois error:', error);
    return NextResponse.json({ error: 'Failed to create POI' }, { status: 500 });
  }
}
