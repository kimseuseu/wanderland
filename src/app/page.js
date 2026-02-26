'use client';

import { useState } from 'react';
import { Icons } from '@/components/Icons';
import HomePage from '@/components/HomePage';
import BuildsPage from '@/components/BuildsPage';
import MapPage from '@/components/MapPage';
import MembersPage from '@/components/MembersPage';
import BlacklistPage from '@/components/BlacklistPage';

const nav = [
  { key: 'home', icon: <Icons.Home />, label: '홈' },
  { key: 'builds', icon: <Icons.Build />, label: '빌드' },
  { key: 'map', icon: <Icons.Map />, label: '지도' },
  { key: 'members', icon: <Icons.Users />, label: '하이브원' },
  { key: 'blacklist', icon: <Icons.Ban />, label: '블랙리스트' },
];

export default function Page() {
  const [page, setPage] = useState('home');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navigation */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)', padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <div onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
            <img src="/images/logo.png" alt="Wanderland" style={{ height: 26, filter: 'brightness(1.1)' }} />
          </div>
          <div style={{ display: 'flex', gap: 1 }}>
            {nav.map((n) => (
              <button
                key={n.key}
                onClick={() => setPage(n.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 13px', borderRadius: 8, fontSize: 13,
                  fontWeight: 600, border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s', fontFamily: 'var(--font-body)',
                  background: page === n.key ? 'var(--accent-dim)' : 'transparent',
                  color: page === n.key ? '#fff' : 'var(--text-muted)',
                }}
                onMouseEnter={(e) => { if (page !== n.key) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                onMouseLeave={(e) => { if (page !== n.key) e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {n.icon}
                <span>{n.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '26px 24px 56px' }}>
        {page === 'home' && <HomePage onNavigate={setPage} />}
        {page === 'builds' && <BuildsPage />}
        {page === 'map' && <MapPage />}
        {page === 'members' && <MembersPage />}
        {page === 'blacklist' && <BlacklistPage />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          WANDERLAND · 낙원 하이브 · Once Human · 제작: 춘영 · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
