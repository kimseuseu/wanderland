import { NextResponse } from 'next/server';
import { MEMBERS } from '@/data';

async function getFromDB() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { db } = await import('@/db');
    const { members } = await import('@/db/schema');
    const rows = await db.select().from(members);
    return rows.map((r) => ({
      id: r.id, name: r.name, role: r.role,
      scenario: r.scenario, joinDate: r.joinDate, note: r.note,
    }));
  } catch { return null; }
}

export async function GET() {
  const dbData = await getFromDB();
  if (dbData) return NextResponse.json(dbData);
  return NextResponse.json(MEMBERS);
}

export async function POST(req) {
  const { requireMember } = await import('@/lib/auth');
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await import('@/db');
    const { members } = await import('@/db/schema');
    const body = await req.json();
    const result = await db.insert(members).values({
      name: body.name,
      role: body.role || '신입사원',
      scenario: body.scenario || '',
      joinDate: body.joinDate || new Date().toISOString().split('T')[0],
      note: body.note || '',
    }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/members error:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
