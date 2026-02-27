'use client';

import { useSession, signIn } from 'next-auth/react';
import { Icons } from './Icons';

export default function AuthGate({ children }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '40vh', color: 'var(--text-muted)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', animation: 'pulse 1.5s ease-in-out infinite' }}>
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '50vh', padding: '40px 20px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(88, 101, 242, 0.1)', border: '1px solid rgba(88, 101, 242, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: '#5865F2',
          }}>
            <Icons.Lock />
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 20, marginBottom: 8,
          }}>
            로그인이 필요합니다
          </h3>
          <p style={{
            color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7,
            marginBottom: 28,
          }}>
            이 페이지는 낙원 하이브 디스코드 서버<br />멤버만 접근할 수 있습니다.
          </p>
          <button
            onClick={() => signIn('discord')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 10,
              background: '#5865F2', color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#4752C4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#5865F2'; }}
          >
            <Icons.Discord />
            Discord로 로그인
          </button>
        </div>
      </div>
    );
  }

  if (!session.isMember) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '50vh', padding: '40px 20px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--warning-dim)', border: '1px solid rgba(255, 170, 68, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'var(--warning)',
          }}>
            <Icons.Ban />
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 20, marginBottom: 8,
          }}>
            서버 멤버 전용
          </h3>
          <p style={{
            color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7,
            marginBottom: 12,
          }}>
            낙원 하이브 디스코드 서버에 가입된<br />멤버만 이용할 수 있습니다.
          </p>
          <p style={{
            color: 'var(--text-muted)', fontSize: 12,
            fontFamily: 'var(--font-mono)',
          }}>
            로그인 계정: {session.user?.name}
          </p>
        </div>
      </div>
    );
  }

  return children;
}
