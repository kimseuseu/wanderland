'use client';

import { Icons } from './Icons';
import { MEMBERS, BUILDS, BLACKLIST } from '@/data';

const cardAccents = {
  builds: '#ffaa44',
  map: '#44ff88',
  members: '#6488ff',
  blacklist: '#ff5566',
};

export default function HomePage({ onNavigate }) {
  const navItems = [
    { icon: <Icons.Build />, label: '장비 빌드', page: 'builds', desc: '빌드 공유 & 탐색' },
    { icon: <Icons.Map />, label: '게임 지도', page: 'map', desc: '지역 정보 기록' },
    { icon: <Icons.Users />, label: '하이브원', page: 'members', desc: '멤버 현황' },
    { icon: <Icons.Ban />, label: '블랙리스트', page: 'blacklist', desc: '주의 유저 관리' },
  ];

  const stats = [
    { value: `${MEMBERS.length}명`, label: '하이브원', color: '#6488ff' },
    { value: `${BUILDS.length}개`, label: '빌드', color: '#ffaa44' },
    { value: `${BLACKLIST.length}명`, label: '블랙리스트', color: '#ff5566' },
  ];

  return (
    <div className="fade-in" style={{
      minHeight: '78vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 20px',
    }}>
      {/* Hero area with glow */}
      <div style={{ position: 'relative', marginBottom: 52 }}>
        <div className="hero-glow" />
        <div className="hero-glow-ring" />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <img
            src="/images/logo.png"
            alt="Wanderland"
            style={{
              height: 80, marginBottom: 22, filter: 'brightness(1.15)',
              animation: 'floatLogo 5s ease-in-out infinite',
            }}
          />

          <div className="shimmer-line" style={{ width: 60, margin: '0 auto 16px' }} />

          <p style={{
            fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.22em',
            textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-display)',
          }}>
            낙원 하이브 — Once Human
          </p>
          <p style={{
            fontSize: 11, color: 'var(--text-muted)', marginTop: 6,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
          }}>
            하이브장: 간편 · 제작: 춘영
          </p>
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 15, color: 'var(--text-secondary)', maxWidth: 420,
        lineHeight: 1.9, marginBottom: 48, fontWeight: 400,
      }}>
        장비 빌드를 공유하고, 지도에 정보를 기록하고,<br />하이브원들과 함께 더 강해지세요.
      </p>

      {/* Navigation cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        {navItems.map((t, i) => (
          <div
            key={i}
            onClick={() => onNavigate(t.page)}
            className="nav-card fade-in"
            style={{
              '--card-accent': cardAccents[t.page],
              animationDelay: `${i * 0.08}s`,
              width: 164, padding: '28px 16px 24px',
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            <div className="nav-card-icon" style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{t.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-item" style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)',
              color: s.color,
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
              marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
