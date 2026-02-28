import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { requireMember } from '@/lib/auth';

export async function POST(req) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  // BLOB_READ_WRITE_TOKEN 확인
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Upload error: BLOB_READ_WRITE_TOKEN 환경변수가 설정되지 않았습니다.');
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN 환경변수가 설정되지 않았습니다. Vercel Blob 스토어를 연결해주세요.' },
      { status: 500 }
    );
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

    const prefix = formData.get('prefix') || 'builds';
    const blob = await put(`${prefix}/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('Upload error:', e);
    const msg = e.message || '업로드에 실패했습니다.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
