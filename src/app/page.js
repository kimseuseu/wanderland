'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/Icons';
import HomePage from '@/components/HomePage';
import BuildsPage from '@/components/BuildsPage';
import MembersPage from '@/components/MembersPage';
import BlacklistPage from '@/components/BlacklistPage';
import AboutPage from '@/components/AboutPage';
import AuthGate from '@/components/AuthGate';

const nav = [
  { key: 'home', icon: <Icons.Home />, label: '홈' },
  { key: 'about', icon: <Icons.Info />, label: '소개' },
  { key: 'builds', icon: <Icons.Build />, label: '빌드' },
  { key: 'map', icon: <Icons.Map />, label: '지도', href: '/map' },
  { key: 'members', icon: <Icons.Users />, label: '멤버' },
  { key: 'blacklist', icon: <Icons.Ban />, label: '블랙리스트', locked: true },
];

function getInitialPage() {
  if (typeof window === 'undefined') return 'home';
  const p = new URLSearchParams(window.location.search).get('page');
  return ['home', 'about', 'builds', 'members', 'blacklist'].includes(p) ? p : 'home';
}

export default function Page() {
  const [page, setPage] = useState(getInitialPage);
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navigation */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)', padding: '0 16px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48 }}>
          <div onClick={() => setPage('home')} style={{ cursor: 'pointer', flexShrink: 0 }}>
            <img src="/images/logo.png" alt="Wanderland" style={{ height: 22, filter: 'brightness(1.1)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {/* Nav buttons */}
            {nav.map((n) => (
              <button
                key={n.key}
                onClick={() => n.href ? router.push(n.href) : setPage(n.key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: '6px 10px', borderRadius: 8, fontSize: 12,
                  fontWeight: 600, border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s', fontFamily: 'var(--font-body)',
                  background: page === n.key ? 'var(--accent-dim)' : 'transparent',
                  color: page === n.key ? '#fff' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { if (page !== n.key) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                onMouseLeave={(e) => { if (page !== n.key) e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {n.icon}
                <span className="nav-label">{n.label}</span>
              </button>
            ))}

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px', flexShrink: 0 }} />

            {/* Auth button */}
            {status === 'loading' ? (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-tertiary)' }} />
            ) : session ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 8px', borderRadius: 8,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-dim)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)' }}
                    />
                  ) : (
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: '#5865F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff',
                    }}>
                      {session.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <>
                    <div
                      onClick={() => setShowUserMenu(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 200 }}
                    />
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: 6,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: 6, minWidth: 160,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 201,
                    }}>
                      <div style={{
                        padding: '8px 12px', borderBottom: '1px solid var(--border)',
                        marginBottom: 4,
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{session.user?.name}</div>
                        <div style={{
                          fontSize: 11, color: session.isMember ? '#44ff88' : 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)', marginTop: 2,
                        }}>
                          {session.isMember ? '서버 멤버' : '비멤버'}
                        </div>
                      </div>
                      <button
                        onClick={() => { setShowUserMenu(false); signOut(); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                          padding: '8px 12px', borderRadius: 6,
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: 'var(--text-muted)', fontSize: 13,
                          fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Icons.Logout />
                        로그아웃
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn('discord')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 8,
                  background: '#5865F2', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#4752C4'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#5865F2'; }}
              >
                <Icons.Discord />
                <span className="nav-label">로그인</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '26px 24px 56px' }}>
        {page === 'home' && <HomePage onNavigate={setPage} />}
        {page === 'builds' && <BuildsPage />}
        {page === 'members' && <MembersPage />}
        {page === 'blacklist' && <AuthGate><BlacklistPage /></AuthGate>}
        {page === 'about' && <AboutPage />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          WANDERLAND · 프로젝트 낙원 · Once Human · 제작: 간편 · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
