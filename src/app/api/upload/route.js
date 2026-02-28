import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { requireMember } from '@/lib/auth';

/**
 * 클라이언트 직접 업로드 방식
 * - 브라우저 → Vercel Blob Storage 직접 업로드 (서버리스 함수 body 4.5MB 제한 우회)
 * - 이 라우트는 업로드 토큰 생성 + 완료 콜백만 처리
 */
export async function POST(request) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Upload error: BLOB_READ_WRITE_TOKEN 환경변수가 설정되지 않았습니다.');
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN 환경변수가 설정되지 않았습니다. Vercel Blob 스토어를 연결해주세요.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // 인증된 멤버만 업로드 허용 (위에서 이미 체크됨)
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json(
      { error: e.message || '업로드에 실패했습니다.' },
      { status: 400 }
    );
  }
}
