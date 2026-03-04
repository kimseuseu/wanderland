import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pois } from '@/db/schema';
import { requireMember } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(req) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const scenario = searchParams.get('scenario');
    const group = searchParams.get('group');
    const limit = parseInt(searchParams.get('limit')) || 0;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = db.select().from(pois);

    // 선택적 필터링
    if (scenario) {
      query = query.where(eq(pois.scenario, scenario));
    }
    if (group) {
      query = query.where(eq(pois.group, group));
    }

    // 선택적 페이지네이션 (limit=0이면 전체 반환)
    if (limit > 0) {
      query = query.limit(limit).offset(offset);
    }

    const result = await query;
    const res = NextResponse.json(result);
    // POI 데이터는 자주 변경되지 않으므로 5분 캐시
    res.headers.set('Cache-Control', 'private, max-age=300');
    return res;
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
