'use client';

import { useState, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Icons } from '@/components/Icons';
import { Modal, Input, TextArea, Button } from '@/components/UI';
import { useApi } from '@/hooks/useApi';
import { useNicknames } from '@/hooks/useNicknames';
import NavBar from '@/components/NavBar';
import AuthGate from '@/components/AuthGate';

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
const PIN_CATEGORIES = [
  { key: 'boss', label: '보스', emoji: '💀' },
  { key: 'resource', label: '자원', emoji: '⛏️' },
  { key: 'dungeon', label: '던전', emoji: '🏛️' },
  { key: 'teleport', label: '텔레포트', emoji: '🔷' },
  { key: 'npc', label: 'NPC', emoji: '👤' },
  { key: 'chest', label: '상자', emoji: '📦' },
  { key: 'landmark', label: '랜드마크', emoji: '🏔️' },
  { key: 'etc', label: '기타', emoji: '📍' },
];
const DEFAULT_FORM = { label: '', note: '', color: '#44ff88', category: 'etc', scenario: '무한의꿈', server: '' };

const ROUTE_COLORS = ['#ffaa44', '#ff4444', '#44ff88', '#4488ff', '#ff44ff', '#06b6d4'];

function MapContent() {
  const { data: session } = useSession();
  const { data: pins, loading, mutate } = useApi('/api/map-pins');
  const { data: routes, mutate: mutateRoutes } = useApi('/api/map-routes');
  const resolveNick = useNicknames();
  const mapRef = useRef(null);
  const [showAdd, setShowAdd] = useState(false);
  const [sel, setSel] = useState(null);
  const [np, setNp] = useState(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editPin, setEditPin] = useState(null);
  const [filter, setFilter] = useState('전체');
  const [search, setSearch] = useState('');

  // Route drawing state
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#ffaa44');
  const [routePoints, setRoutePoints] = useState([]);
  const [routeForm, setRouteForm] = useState({ label: '', note: '', scenario: '' });
  const [showRouteModal, setShowRouteModal] = useState(false);

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

  const handleMapClick = (coords) => {
    if (drawingMode) return; // handled by LeafletMap
    setNp(coords);
    setShowAdd(true);
  };

  const handleRoutePoint = (coords) => {
    setRoutePoints((prev) => [...prev, coords]);
  };

  const startDrawing = () => {
    setDrawingMode(true);
    setRoutePoints([]);
    if (mapRef.current) mapRef.current.clearDrawing();
  };

  const finishDrawing = () => {
    if (routePoints.length < 2) {
      setDrawingMode(false);
      setRoutePoints([]);
      if (mapRef.current) mapRef.current.clearDrawing();
      return;
    }
    setShowRouteModal(true);
  };

  const cancelDrawing = () => {
    setDrawingMode(false);
    setRoutePoints([]);
    if (mapRef.current) mapRef.current.clearDrawing();
  };

  const saveRoute = async () => {
    const points = mapRef.current?.getDrawingPoints() || routePoints;
    if (points.length < 2) return;
    try {
      await fetch('/api/map-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: routeForm.label || '경로',
          points,
          color: drawingColor,
          note: routeForm.note,
          scenario: routeForm.scenario,
        }),
      });
      mutateRoutes();
    } catch (e) { console.error(e); }
    setDrawingMode(false);
    setRoutePoints([]);
    setRouteForm({ label: '', note: '', scenario: '' });
    setShowRouteModal(false);
    if (mapRef.current) mapRef.current.clearDrawing();
  };

  const deleteRoute = async (id) => {
    try {
      await fetch(`/api/map-routes/${id}`, { method: 'DELETE' });
      mutateRoutes();
    } catch (e) { console.error(e); }
  };

  const startEdit = (pin) => {
    setEditPin(pin);
    setForm({ label: pin.label, note: pin.note || '', color: pin.color || '#44ff88', category: pin.category || 'etc', scenario: pin.scenario || '무한의꿈', server: pin.server ? String(pin.server) : '' });
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
      <LeafletMap
        ref={mapRef}
        pins={pinList}
        selectedPin={sel}
        onMapClick={handleMapClick}
        onPinClick={setSel}
        routes={routes || []}
        drawingMode={drawingMode}
        drawingColor={drawingColor}
        onRoutePoint={handleRoutePoint}
      />

      {/* Drawing Mode Toolbar */}
      {drawingMode && (
        <div className="map-draw-toolbar">
          <div className="map-draw-info">
            <Icons.Route /> 경로 그리기 모드 · 지도를 클릭하여 포인트 추가 ({routePoints.length}점)
          </div>
          <div className="map-draw-colors">
            {ROUTE_COLORS.map((c) => (
              <button key={c}
                style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: drawingColor === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }}
                onClick={() => setDrawingColor(c)}
              />
            ))}
          </div>
          <div className="map-draw-actions">
            <Button onClick={finishDrawing} disabled={routePoints.length < 2}>완료</Button>
            <Button onClick={cancelDrawing} style={{ background: 'var(--bg-tertiary)' }}>취소</Button>
          </div>
        </div>
      )}

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
                        <span className="map-pin-author">{resolveNick(p.discordId, p.author)}</span>
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

            {/* Route Section */}
            <div className="map-route-section">
              <div className="map-route-header">
                <span><Icons.Route /> 경로</span>
                {!drawingMode && (
                  <button className="map-route-draw-btn" onClick={startDrawing}>
                    <Icons.Plus /> 그리기
                  </button>
                )}
              </div>
              {(routes || []).map((r) => (
                <div key={r.id} className="map-route-item">
                  <div className="map-route-dot" style={{ background: r.color || '#ffaa44' }} />
                  <div className="map-route-info">
                    <div className="map-route-name">{r.label}</div>
                    <div className="map-route-meta">{resolveNick(r.discordId, r.author)} · {r.points?.length || 0}점</div>
                  </div>
                  {checkOwner(r) && (
                    <button className="map-route-delete" onClick={() => deleteRoute(r.id)}>
                      <Icons.Trash />
                    </button>
                  )}
                </div>
              ))}
              {(!routes || routes.length === 0) && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '8px 0', textAlign: 'center' }}>
                  경로가 없습니다
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Route Save Modal ── */}
      <Modal open={showRouteModal} onClose={() => { setShowRouteModal(false); cancelDrawing(); }} title="경로 저장">
        <Input label="경로 이름" value={routeForm.label} onChange={(e) => setRouteForm({ ...routeForm, label: e.target.value })} placeholder="예: 자원 파밍 루트" />
        <TextArea label="메모" value={routeForm.note} onChange={(e) => setRouteForm({ ...routeForm, note: e.target.value })} placeholder="경로에 대한 메모" rows={3} />
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>시나리오</label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {SCENARIOS.map((s) => (
              <button key={s}
                className={`map-scenario-btn${routeForm.scenario === s ? ' active' : ''}`}
                onClick={() => setRouteForm({ ...routeForm, scenario: s })}
              >{s}</button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          {routePoints.length}개 포인트 · 색상: <span style={{ color: drawingColor }}>{drawingColor}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => { setShowRouteModal(false); cancelDrawing(); }}>취소</Button>
          <Button onClick={saveRoute}>저장</Button>
        </div>
      </Modal>

      {/* ── Pin Detail Modal ── */}
      <Modal open={!!sel} onClose={() => setSel(null)} title="">
        {sel && (
          <div>
            {/* Color Gradient Banner */}
            <div className="map-detail-banner" style={{ '--pin-color': sel.color || '#44ff88' }}>
              <div className="map-detail-title">{sel.label}</div>
              <div className="map-detail-coords">
                ({Math.round(sel.x)}, {Math.round(sel.y)})
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
                <div className="map-detail-cell-value">{resolveNick(sel.discordId, sel.author)}</div>
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
                {resolveNick(sel.discordId, sel.author)}
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

        {/* Category Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            카테고리
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PIN_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setForm({ ...form, category: cat.key })}
                style={{
                  padding: '5px 10px', borderRadius: 6, fontSize: 12,
                  border: form.category === cat.key ? '1px solid var(--text-secondary)' : '1px solid var(--border)',
                  background: form.category === cat.key ? 'var(--accent-dim)' : 'transparent',
                  color: form.category === cat.key ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 14 }}>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>

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
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <NavBar activePage="map" />

      {/* Map Content - fills remaining space */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AuthGate>
          <MapContent />
        </AuthGate>
      </div>
    </div>
  );
}
