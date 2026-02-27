import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { requireMember } from '@/lib/auth';

export async function POST(req) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '이미지 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    // 10MB 제한
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 });
    }

    const blob = await put(`builds/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: '업로드에 실패했습니다.' }, { status: 500 });
  }
}
