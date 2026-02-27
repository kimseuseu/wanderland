'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Icons } from '@/components/Icons';
import { Modal, Input, TextArea, Button } from '@/components/UI';
import { useApi } from '@/hooks/useApi';
import AuthGate from '@/components/AuthGate';

const nav = [
  { key: 'home', icon: <Icons.Home />, label: '홈', href: '/' },
  { key: 'about', icon: <Icons.Info />, label: '소개', href: '/' },
  { key: 'builds', icon: <Icons.Build />, label: '빌드', href: '/' },
  { key: 'map', icon: <Icons.Map />, label: '지도', href: '/map' },
  { key: 'members', icon: <Icons.Users />, label: '하이브원', href: '/' },
  { key: 'blacklist', icon: <Icons.Ban />, label: '블랙리스트', href: '/' },
];

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--bg-card)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-muted)', fontSize: 13,
    }}>
      지도 로딩 중...
    </div>
  ),
});

const SCENARIOS = ['무한의꿈', '혹독한겨울', '터치오브스카이', '비정상수용'];
const PIN_COLORS = ['#44ff88', '#ff4444', '#ffaa44', '#4488ff', '#ffffff', '#ff44ff', '#a855f7', '#06b6d4'];
const DEFAULT_FORM = { label: '', note: '', color: '#44ff88', scenario: '무한의꿈', server: '' };

function MapContent() {
  const { data: session } = useSession();
  const { data: pins, loading, mutate } = useApi('/api/map-pins');
  const [showAdd, setShowAdd] = useState(false);
  const [sel, setSel] = useState(null);
  const [np, setNp] = useState(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleMapClick = (pct) => {
    setNp(pct);
    setShowAdd(true);
  };

  const addPin = async () => {
    if (!form.label || !np) return;
    try {
      await fetch('/api/map-pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...np, ...form, server: form.server ? parseInt(form.server) : null, author: session?.user?.name || '익명' }),
      });
      mutate();
    } catch (e) { console.error(e); }
    setShowAdd(false); setNp(null); setForm({ ...DEFAULT_FORM });
  };

  const deletePin = async (id) => {
    try {
      await fetch(`/api/map-pins/${id}`, { method: 'DELETE' });
      mutate();
    } catch (e) { console.error(e); }
    setSel(null);
  };

  const pinList = pins || [];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', animation: 'pulse 1.5s ease-in-out infinite' }}>지도 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* Full-size Map */}
      <LeafletMap pins={pinList} selectedPin={sel} onMapClick={handleMapClick} onPinClick={setSel} />

      {/* Floating Pin Sidebar */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 1000,
        background: 'rgba(20, 20, 20, 0.92)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)', borderRadius: 14,
        width: sidebarOpen ? 240 : 44, overflow: 'hidden',
        transition: 'width 0.25s ease',
        maxHeight: 'calc(100% - 24px)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Sidebar Header */}
        <div
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            padding: sidebarOpen ? '10px 12px' : '10px',
            borderBottom: sidebarOpen ? '1px solid var(--border)' : 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 8, flexShrink: 0,
            justifyContent: sidebarOpen ? 'space-between' : 'center',
          }}
        >
          {sidebarOpen ? (
            <>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                핀 목록 · {pinList.length}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </>
          ) : (
            <Icons.Map />
          )}
        </div>

        {/* Pin List */}
        {sidebarOpen && (
          <div style={{ overflow: 'auto', padding: '6px 8px' }}>
            {pinList.map((p) => (
              <div key={p.id} onClick={() => setSel(p)}
                style={{
                  padding: '7px 9px', borderRadius: 8, marginBottom: 2, cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: sel?.id === p.id ? 'var(--bg-tertiary)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (sel?.id !== p.id) e.currentTarget.style.background = 'var(--accent-dim)'; }}
                onMouseLeave={(e) => { if (sel?.id !== p.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{p.label}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 13, marginTop: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>{p.author}</span>
                  {p.scenario && <span style={{ opacity: 0.7 }}>{p.scenario}{p.server ? ` ${p.server}` : ''}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pin Detail Modal */}
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.label || ''}>
        {sel && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: sel.color }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>({sel.x.toFixed(1)}, {sel.y.toFixed(1)})</span>
              {sel.scenario && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--accent-dim)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {sel.scenario}{sel.server ? ` · ${sel.server}서버` : ''}
                </span>
              )}
            </div>
            {sel.note && (
              <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 14 }}>{sel.note}</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {sel.author}</span>
              <Button variant="danger" onClick={() => deletePin(sel.id)} style={{ padding: '5px 12px', fontSize: 12 }}><Icons.Trash /> 삭제</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Pin Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setNp(null); }} title="새 핀 추가">
        <Input label="장소 이름" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="예: 보스 스폰 지점" />
        <TextArea label="메모" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="정보..." />
        <div style={{ marginBottom: 13 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>핀 색상</label>
          <div style={{ display: 'flex', gap: 7 }}>
            {PIN_COLORS.map((c) => (
              <button key={c} onClick={() => setForm({ ...form, color: c })} style={{
                width: 26, height: 26, borderRadius: '50%', background: c,
                border: form.color === c ? '3px solid #fff' : '3px solid transparent',
                cursor: 'pointer', transition: 'transform 0.15s',
              }} />
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 13 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>시나리오</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SCENARIOS.map((s) => (
              <button key={s} onClick={() => setForm({ ...form, scenario: s })} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.15s',
                background: form.scenario === s ? '#fff' : 'var(--bg-tertiary)',
                color: form.scenario === s ? '#000' : 'var(--text-secondary)',
                border: form.scenario === s ? '1px solid #fff' : '1px solid var(--border)',
              }}>{s}</button>
            ))}
          </div>
        </div>
        <Input label="서버" type="number" value={form.server} onChange={(e) => setForm({ ...form, server: e.target.value })} placeholder="서버 번호 입력" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => { setShowAdd(false); setNp(null); }}>취소</Button>
          <Button onClick={addPin}>추가</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function MapPageRoute() {
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Nav Bar - same as main page */}
      <nav style={{
        background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)', padding: '0 16px',
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48 }}>
          <div onClick={() => router.push('/')} style={{ cursor: 'pointer', flexShrink: 0 }}>
            <img src="/images/logo.png" alt="Wanderland" style={{ height: 22, filter: 'brightness(1.1)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {nav.map((n) => (
              <button
                key={n.key}
                onClick={() => router.push(n.href)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: '6px 10px', borderRadius: 8, fontSize: 12,
                  fontWeight: 600, border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s', fontFamily: 'var(--font-body)',
                  background: n.key === 'map' ? 'var(--accent-dim)' : 'transparent',
                  color: n.key === 'map' ? '#fff' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { if (n.key !== 'map') e.currentTarget.style.color = 'var(--text-secondary)'; }}
                onMouseLeave={(e) => { if (n.key !== 'map') e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {n.icon}
                <span className="nav-label">{n.label}</span>
              </button>
            ))}

            <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px', flexShrink: 0 }} />

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
                    <img src={session.user.image} alt="" style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)' }} />
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
                {showUserMenu && (
                  <>
                    <div onClick={() => setShowUserMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: 6,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: 6, minWidth: 160,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 201,
                    }}>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{session.user?.name}</div>
                        <div style={{ fontSize: 11, color: session.isMember ? '#44ff88' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
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

      {/* Map Content - fills remaining space */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AuthGate>
          <MapContent />
        </AuthGate>
      </div>
    </div>
  );
}
