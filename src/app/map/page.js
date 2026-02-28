'use client';

import { useState, useMemo } from 'react';
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
const SCENARIO_SHORT = { '무한의꿈': '무한', '혹독한겨울': '혹겨', '터치오브스카이': '터스', '비정상수용': '비수' };
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
  const [editPin, setEditPin] = useState(null);
  const [filter, setFilter] = useState('전체');
  const [search, setSearch] = useState('');

  const pinList = pins || [];

  const filteredPins = useMemo(() => {
    let result = pinList;
    if (filter !== '전체') {
      result = result.filter((p) => p.scenario === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) =>
        p.label?.toLowerCase().includes(q) ||
        p.author?.toLowerCase().includes(q) ||
        p.note?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [pinList, filter, search]);

  const checkOwner = (pin) => {
    if (!session || !pin) return false;
    if (session.isAdmin) return true;
    if (pin.discordId && session.discordId) return pin.discordId === session.discordId;
    if (!pin.discordId && session.user?.name) return pin.author === session.user.name;
    return false;
  };

  const handleMapClick = (pct) => {
    setNp(pct);
    setShowAdd(true);
  };

  const startEdit = (pin) => {
    setEditPin(pin);
    setForm({ label: pin.label, note: pin.note || '', color: pin.color || '#44ff88', scenario: pin.scenario || '무한의꿈', server: pin.server ? String(pin.server) : '' });
    setSel(null);
  };

  const addOrUpdatePin = async () => {
    if (!form.label) return;
    try {
      if (editPin) {
        await fetch(`/api/map-pins/${editPin.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, server: form.server ? parseInt(form.server) : null }),
        });
      } else {
        if (!np) return;
        await fetch('/api/map-pins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...np, ...form, server: form.server ? parseInt(form.server) : null, author: session?.user?.name || '익명' }),
        });
      }
      mutate();
    } catch (e) { console.error(e); }
    setShowAdd(false); setEditPin(null); setNp(null); setForm({ ...DEFAULT_FORM });
  };

  const deletePin = async (id) => {
    try {
      await fetch(`/api/map-pins/${id}`, { method: 'DELETE' });
      mutate();
    } catch (e) { console.error(e); }
    setSel(null);
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="map-loading-spinner" />
        <div className="map-loading-text">지도 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* Full-size Map */}
      <LeafletMap pins={pinList} selectedPin={sel} onMapClick={handleMapClick} onPinClick={setSel} />

      {/* ── Floating Sidebar ── */}
      <div className={`map-sidebar${sidebarOpen ? '' : ' collapsed'}`}>
        {/* Header */}
        <div className="map-sidebar-header" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? (
            <>
              <div className="map-sidebar-title">
                <div className="map-sidebar-icon">
                  <Icons.Map />
                </div>
                <span className="map-sidebar-label">핀 목록</span>
                <span className="map-sidebar-count">{filteredPins.length}</span>
              </div>
              <button className="map-sidebar-toggle" onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </>
          ) : (
            <div className="map-sidebar-icon" style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent' }}>
              <Icons.Map />
            </div>
          )}
        </div>

        {/* Search + Filter + List (only when open) */}
        {sidebarOpen && (
          <>
            {/* Search */}
            <div className="map-search-wrap">
              <div className="map-search-icon">
                <Icons.Search />
              </div>
              <input
                className="map-search"
                placeholder="핀 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="map-search-clear" onClick={() => setSearch('')}>
                  <Icons.X />
                </button>
              )}
            </div>

            {/* Scenario Filter Chips */}
            <div className="map-filter-row">
              {['전체', ...SCENARIOS].map((s) => (
                <button
                  key={s}
                  className={`map-chip${filter === s ? ' active' : ''}`}
                  onClick={() => setFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Pin List */}
            <div className="map-pin-list">
              {filteredPins.length === 0 ? (
                <div className="map-empty">
                  <div className="map-empty-icon">
                    <Icons.Map />
                  </div>
                  <div className="map-empty-text">핀이 없습니다</div>
                  <div className="map-empty-sub">지도를 클릭하여 핀을 추가하세요</div>
                </div>
              ) : (
                filteredPins.map((p) => (
                  <div
                    key={p.id}
                    className={`map-pin-item${sel?.id === p.id ? ' selected' : ''}`}
                    style={{ '--pin-color': p.color || '#44ff88' }}
                    onClick={() => setSel(p)}
                  >
                    <div
                      className="map-pin-dot"
                      style={{ background: p.color || '#44ff88', '--pin-color': p.color || '#44ff88' }}
                    />
                    <div className="map-pin-info">
                      <div className="map-pin-name">{p.label}</div>
                      <div className="map-pin-meta">
                        <span className="map-pin-author">{p.author}</span>
                        {p.scenario && (
                          <span className="map-pin-scenario-tag">
                            {SCENARIO_SHORT[p.scenario] || p.scenario}
                            {p.server ? ` ${p.server}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Pin Detail Modal ── */}
      <Modal open={!!sel} onClose={() => setSel(null)} title="">
        {sel && (
          <div>
            {/* Color Gradient Banner */}
            <div className="map-detail-banner" style={{ '--pin-color': sel.color || '#44ff88' }}>
              <div className="map-detail-title">{sel.label}</div>
              <div className="map-detail-coords">
                ({sel.x?.toFixed(1)}, {sel.y?.toFixed(1)})
              </div>
            </div>

            {/* Info Grid */}
            <div className="map-detail-grid">
              <div className="map-detail-cell">
                <div className="map-detail-cell-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </div>
                <div className="map-detail-cell-label">시나리오</div>
                <div className="map-detail-cell-value">{sel.scenario || '—'}</div>
              </div>
              <div className="map-detail-cell">
                <div className="map-detail-cell-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div className="map-detail-cell-label">서버</div>
                <div className="map-detail-cell-value">{sel.server ? `${sel.server}서버` : '—'}</div>
              </div>
              <div className="map-detail-cell">
                <div className="map-detail-cell-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="map-detail-cell-label">작성자</div>
                <div className="map-detail-cell-value">{sel.author || '익명'}</div>
              </div>
            </div>

            {/* Note */}
            {sel.note && (
              <div className="map-detail-note" style={{ '--pin-color': sel.color || '#44ff88' }}>
                {sel.note}
              </div>
            )}

            {/* Footer */}
            <div className="map-detail-footer">
              <div className="map-detail-author">
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: sel.color || '#44ff88',
                  boxShadow: `0 0 6px ${sel.color || '#44ff88'}`,
                }} />
                {sel.author || '익명'}
              </div>
              {checkOwner(sel) && (
                <div className="map-detail-actions">
                  <Button variant="secondary" onClick={() => startEdit(sel)} style={{ padding: '5px 14px', fontSize: 12 }}>
                    <Icons.Edit /> 수정
                  </Button>
                  <Button variant="danger" onClick={() => deletePin(sel.id)} style={{ padding: '5px 14px', fontSize: 12 }}>
                    <Icons.Trash /> 삭제
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add / Edit Pin Modal ── */}
      <Modal
        open={showAdd || !!editPin}
        onClose={() => { setShowAdd(false); setEditPin(null); setNp(null); setForm({ ...DEFAULT_FORM }); }}
        title={editPin ? '핀 수정' : '새 핀 추가'}
      >
        <Input label="장소 이름" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="예: 보스 스폰 지점" />
        <TextArea label="메모" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="위치에 대한 메모를 남겨주세요..." />

        {/* Color Picker */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            핀 색상
          </label>
          <div className="map-color-grid">
            {PIN_COLORS.map((c) => (
              <button
                key={c}
                className={`map-color-btn${form.color === c ? ' selected' : ''}`}
                style={{ background: c, '--btn-color': c }}
                onClick={() => setForm({ ...form, color: c })}
              />
            ))}
          </div>
        </div>

        {/* Scenario Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            시나리오
          </label>
          <div className="map-scenario-grid">
            {SCENARIOS.map((s) => (
              <button
                key={s}
                className={`map-scenario-btn${form.scenario === s ? ' active' : ''}`}
                onClick={() => setForm({ ...form, scenario: s })}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Input label="서버" type="number" value={form.server} onChange={(e) => setForm({ ...form, server: e.target.value })} placeholder="서버 번호 입력" />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button variant="secondary" onClick={() => { setShowAdd(false); setEditPin(null); setNp(null); setForm({ ...DEFAULT_FORM }); }}>취소</Button>
          <Button onClick={addOrUpdatePin}>{editPin ? '수정' : '추가'}</Button>
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
