'use client';

import Image from 'next/image';
import { Icons } from './Icons';
import { MEMBERS, BUILDS, BLACKLIST } from '@/data';

export default function HomePage({ onNavigate }) {
  const navItems = [
    { icon: <Icons.Build />, label: '장비 빌드', page: 'builds', desc: '빌드 공유 & 탐색' },
    { icon: <Icons.Map />, label: '게임 지도', page: 'map', desc: '지역 정보 기록' },
    { icon: <Icons.Users />, label: '하이브원', page: 'members', desc: '멤버 현황' },
    { icon: <Icons.Ban />, label: '블랙리스트', page: 'blacklist', desc: '주의 유저 관리' },
  ];

  const stats = [
    [`${MEMBERS.length}명`, '하이브원'],
    [`${BUILDS.length}개`, '빌드'],
    [`${BLACKLIST.length}명`, '블랙리스트'],
  ];

  return (
    <div className="fade-in" style={{
      minHeight: '75vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px',
    }}>
      <div style={{ marginBottom: 44 }}>
        <img src="/images/logo.png" alt="Wanderland" style={{ height: 72, marginBottom: 18, filter: 'brightness(1.1)' }} />
        <div style={{ width: 36, height: 1, background: 'var(--text-muted)', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
          낙원 하이브 — Once Human
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
          하이브장: 간편 · 제작: 춘영
        </p>
      </div>

      <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.8, marginBottom: 44 }}>
        장비 빌드를 공유하고, 지도에 정보를 기록하고,<br />하이브원들과 함께 더 강해지세요.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {navItems.map((t, i) => (
          <div
            key={i}
            onClick={() => onNavigate(t.page)}
            className="fade-in"
            style={{
              animationDelay: `${i * 0.07}s`, width: 160, padding: '24px 16px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 14, cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ color: 'var(--text-muted)', marginBottom: 10 }}>{t.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 3 }}>{t.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 56, display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {stats.map(([v, l], i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
