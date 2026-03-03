'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Icons } from '@/components/Icons';
import { Modal, Input, TextArea, Button } from '@/components/UI';
import { useApi } from '@/hooks/useApi';
import { useNicknames } from '@/hooks/useNicknames';
import NavBar from '@/components/NavBar';
import AuthGate from '@/components/AuthGate';
import { POI_GROUPS, ALL_POI_CATEGORIES, POI_CATEGORY_MAP, ALL_POI_KEYS } from '@/data/poiCategories';

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
const DEFAULT_FORM = { label: '', note: '', color: '#44ff88', category: 'etc', scenario: '무한의꿈', server: '', visibility: 'public' };
const ROUTE_COLORS = ['#ffaa44', '#ff4444', '#44ff88', '#4488ff', '#ff44ff', '#06b6d4'];

function MapContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { data: pins, loading, mutate } = useApi('/api/map-pins');
  const { data: routes, mutate: mutateRoutes } = useApi('/api/map-routes');
  const { data: favIds, mutate: mutateFavs } = useApi('/api/pin-favorites');
  const { data: poisData, mutate: mutatePois } = useApi('/api/pois');
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
  const [routeForm, setRouteForm] = useState({ label: '', note: '', scenario: '', visibility: 'public' });
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'mine' | 'favs'
  const [showRouteModal, setShowRouteModal] = useState(false);

  // Feature 1: Category layer toggles
  const [enabledCategories, setEnabledCategories] = useState(() =>
    new Set(PIN_CATEGORIES.map((c) => c.key))
  );
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  // POI layer state
  const [enabledPoiCategories, setEnabledPoiCategories] = useState(() => new Set(ALL_POI_KEYS));
  const [expandedPoiGroups, setExpandedPoiGroups] = useState(() => new Set());
  const [showPoiFilter, setShowPoiFilter] = useState(false);
  const [poiAddMode, setPoiAddMode] = useState(false);
  const [showPoiModal, setShowPoiModal] = useState(false);
  const [poiNp, setPoiNp] = useState(null);
  const [poiForm, setPoiForm] = useState({ category: 'monolith', group: 'locations', label: '', note: '', scenario: '' });
  const [selPoi, setSelPoi] = useState(null);
  const [poiPopupPos, setPoiPopupPos] = useState(null);
  const [poiScenarioFilter, setPoiScenarioFilter] = useState('전체'); // '전체' | 'manibus' | 'way_of_winter'

  // Feature 4: Distance measurement
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);

  const pinList = pins || [];
  const favorites = new Set(favIds || []);

  // Feature 2: Pin share link — navigate to pin on mount
  const initialPinHandled = useRef(false);
  useEffect(() => {
    if (initialPinHandled.current || !pinList.length) return;
    const pinId = searchParams.get('pin');
    const px = searchParams.get('x');
    const py = searchParams.get('y');
    if (pinId) {
      const target = pinList.find((p) => p.id === Number(pinId));
      if (target) { setSel(target); initialPinHandled.current = true; }
    } else if (px && py) {
      // Fly to coordinates
      initialPinHandled.current = true;
      setTimeout(() => {
        if (mapRef.current?.getMap) {
          const map = mapRef.current.getMap();
          const L = window.L;
          if (map && L) map.setView(L.latLng(Number(py), Number(px)), 4, { animate: true });
        }
      }, 500);
    }
  }, [pinList, searchParams]);

  const filteredPins = useMemo(() => {
    let result = pinList;
    // Category filter
    result = result.filter((p) => enabledCategories.has(p.category || 'etc'));
    if (viewMode === 'mine') {
      result = result.filter((p) =>
        (p.discordId && session?.discordId && p.discordId === session.discordId) ||
        (!p.discordId && p.author === session?.user?.name)
      );
    } else if (viewMode === 'favs') {
      result = result.filter((p) => favorites.has(p.id));
    }
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
  }, [pinList, filter, search, viewMode, session, enabledCategories, favorites]);

  // 시나리오 → DB scenario 매핑
  const POI_SCENARIO_MAP = {
    '전체': null,            // 모든 POI 표시
    '터치오브스카이': ['touch_of_sky'],
    '혹독한겨울': ['way_of_winter'],
    '무한의꿈': ['touch_of_sky', 'way_of_winter', 'endless_dream'],   // 양쪽 맵 통합 + 드림존 보스
    '비정상수용': ['touch_of_sky'],                    // 터치오브스카이 맵 사용
  };

  const filteredPois = useMemo(() => {
    const list = poisData || [];
    let result = list.filter((p) => enabledPoiCategories.has(p.category));
    // 시나리오 필터
    const allowed = POI_SCENARIO_MAP[poiScenarioFilter];
    if (allowed) {
      result = result.filter((p) => allowed.includes(p.scenario));
    }
    return result;
  }, [poisData, enabledPoiCategories, poiScenarioFilter]);

  // POI 카테고리별 개수 (시나리오 필터 반영)
  const poiCounts = useMemo(() => {
    const counts = {};
    const allowed = POI_SCENARIO_MAP[poiScenarioFilter];
    for (const p of (poisData || [])) {
      if (allowed && !allowed.includes(p.scenario)) continue;
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [poisData, poiScenarioFilter]);

  const checkOwner = (pin) => {
    if (!session || !pin) return false;
    if (session.isAdmin) return true;
    if (pin.discordId && session.discordId) return pin.discordId === session.discordId;
    if (!pin.discordId && session.user?.name) return pin.author === session.user.name;
    return false;
  };

  const toggleCategory = (key) => {
    setEnabledCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAllCategories = () => {
    if (enabledCategories.size === PIN_CATEGORIES.length) {
      setEnabledCategories(new Set());
    } else {
      setEnabledCategories(new Set(PIN_CATEGORIES.map((c) => c.key)));
    }
  };

  // POI toggles
  const togglePoiCategory = (key) => {
    setEnabledPoiCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const togglePoiGroup = (groupKey) => {
    const cats = POI_GROUPS.find((g) => g.key === groupKey)?.categories || [];
    const allEnabled = cats.every((c) => enabledPoiCategories.has(c.key));
    setEnabledPoiCategories((prev) => {
      const next = new Set(prev);
      for (const c of cats) {
        if (allEnabled) next.delete(c.key); else next.add(c.key);
      }
      return next;
    });
  };

  const toggleAllPoi = () => {
    if (enabledPoiCategories.size === ALL_POI_KEYS.size) {
      setEnabledPoiCategories(new Set());
    } else {
      setEnabledPoiCategories(new Set(ALL_POI_KEYS));
    }
  };

  const toggleExpandGroup = (groupKey) => {
    setExpandedPoiGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey); else next.add(groupKey);
      return next;
    });
  };

  // POI CRUD (admin only)
  const addPoi = async () => {
    if (!poiForm.label || !poiNp) return;
    try {
      await fetch('/api/pois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...poiForm, x: poiNp.x, y: poiNp.y }),
      });
      mutatePois();
    } catch (e) { console.error(e); }
    setShowPoiModal(false);
    setPoiNp(null);
    setPoiForm({ category: 'monolith', group: 'locations', label: '', note: '', scenario: '' });
  };

  const deletePoi = async (id) => {
    try {
      await fetch(`/api/pois/${id}`, { method: 'DELETE' });
      mutatePois();
    } catch (e) { console.error(e); }
    setSelPoi(null);
  };

  // Feature 3: Toggle favorite
  const toggleFavorite = async (pinId) => {
    try {
      await fetch('/api/pin-favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinId }),
      });
      mutateFavs();
    } catch (e) { console.error(e); }
  };

  // Feature 2: Copy share link
  const copyShareLink = (pin) => {
    const url = `${window.location.origin}/map?pin=${pin.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  // Feature 4: Distance measurement
  const handleMapClick = (coords) => {
    if (drawingMode) return;
    if (measureMode) {
      setMeasurePoints((prev) => {
        if (prev.length >= 2) return [coords]; // reset after 2
        return [...prev, coords];
      });
      return;
    }
    if (poiAddMode) {
      setPoiNp(coords);
      setShowPoiModal(true);
      return;
    }
    setNp(coords);
    setShowAdd(true);
  };

  const measuredDistance = useMemo(() => {
    if (measurePoints.length < 2) return null;
    const [a, b] = measurePoints;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  }, [measurePoints]);

  const handleRoutePoint = (coords) => {
    setRoutePoints((prev) => [...prev, coords]);
  };

  const startDrawing = () => {
    setDrawingMode(true);
    setMeasureMode(false);
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
          visibility: routeForm.visibility || 'public',
        }),
      });
      mutateRoutes();
    } catch (e) { console.error(e); }
    setDrawingMode(false);
    setRoutePoints([]);
    setRouteForm({ label: '', note: '', scenario: '', visibility: 'public' });
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
    setForm({ label: pin.label, note: pin.note || '', color: pin.color || '#44ff88', category: pin.category || 'etc', scenario: pin.scenario || '무한의꿈', server: pin.server ? String(pin.server) : '', visibility: pin.visibility || 'public' });
    setSel(null);
  };

  const addOrUpdatePin = async () => {
    if (!form.label) return;
    try {
      if (editPin) {
        await fetch(`/api/map-pins/${editPin.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, server: form.server ? parseInt(form.server) : null, visibility: form.visibility }),
        });
      } else {
        if (!np) return;
        await fetch('/api/map-pins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...np, ...form, server: form.server ? parseInt(form.server) : null, visibility: form.visibility, author: session?.user?.name || '익명' }),
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
      {/* Full-size Map — pass filtered pins for clustering */}
      <LeafletMap
        ref={mapRef}
        pins={filteredPins}
        selectedPin={sel}
        onMapClick={handleMapClick}
        onPinClick={setSel}
        routes={routes || []}
        drawingMode={drawingMode}
        drawingColor={drawingColor}
        onRoutePoint={handleRoutePoint}
        measureMode={measureMode}
        measurePoints={measurePoints}
        cluster
        pois={filteredPois}
        onPoiClick={(poi, screenPos) => { setSelPoi(poi); setPoiPopupPos(screenPos || null); }}
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

      {/* Feature 4: Measure Mode Toolbar */}
      {measureMode && (
        <div className="map-draw-toolbar">
          <div className="map-draw-info">
            <Icons.Map /> 거리 측정 · 두 지점을 클릭하세요
            {measuredDistance !== null && (
              <span style={{ marginLeft: 8, color: '#44ff88', fontWeight: 700 }}>
                {measuredDistance.toLocaleString()}m
              </span>
            )}
          </div>
          <div className="map-draw-actions">
            {measurePoints.length > 0 && (
              <Button onClick={() => setMeasurePoints([])} style={{ background: 'var(--bg-tertiary)' }}>초기화</Button>
            )}
            <Button onClick={() => { setMeasureMode(false); setMeasurePoints([]); }} style={{ background: 'var(--bg-tertiary)' }}>닫기</Button>
          </div>
        </div>
      )}

      {/* POI Add Mode Toolbar (Admin) */}
      {poiAddMode && (
        <div className="map-draw-toolbar">
          <div className="map-draw-info">
            <span style={{ fontSize: 14 }}>📌</span> POI 배치 모드 · 지도를 클릭하여 위치 지정
          </div>
          <div className="map-draw-actions">
            <Button onClick={() => { setPoiAddMode(false); }} style={{ background: 'var(--bg-tertiary)' }}>종료</Button>
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

            {/* View Mode Toggle */}
            <div className="map-view-toggle">
              <button className={`map-view-btn${viewMode === 'all' ? ' active' : ''}`} onClick={() => setViewMode('all')}>전체</button>
              <button className={`map-view-btn${viewMode === 'mine' ? ' active' : ''}`} onClick={() => setViewMode('mine')}>내 핀</button>
              <button className={`map-view-btn${viewMode === 'favs' ? ' active' : ''}`} onClick={() => setViewMode('favs')}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ marginRight: 3 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                즐겨찾기
              </button>
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

            {/* Feature 1: Category Layer Toggle */}
            <div className="map-category-filter">
              <button className="map-category-toggle-btn" onClick={() => setShowCategoryFilter(!showCategoryFilter)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                카테고리
                <span style={{ opacity: 0.5, fontSize: 10 }}>
                  {enabledCategories.size}/{PIN_CATEGORIES.length}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: 'auto', transform: showCategoryFilter ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showCategoryFilter && (
                <div className="map-category-list">
                  <button className="map-category-item" onClick={toggleAllCategories}>
                    <span className="map-cat-check">{enabledCategories.size === PIN_CATEGORIES.length ? '☑' : '☐'}</span>
                    전체
                  </button>
                  {PIN_CATEGORIES.map((cat) => (
                    <button key={cat.key} className="map-category-item" onClick={() => toggleCategory(cat.key)}>
                      <span className="map-cat-check">{enabledCategories.has(cat.key) ? '☑' : '☐'}</span>
                      <span>{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tools: Measure */}
            <div className="map-tools-row">
              <button
                className={`map-tool-btn${measureMode ? ' active' : ''}`}
                onClick={() => { setMeasureMode(!measureMode); setMeasurePoints([]); setDrawingMode(false); }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12h5l2-7 6 14 2-7h5" />
                </svg>
                거리 측정
              </button>
            </div>

            {/* ── POI Layer Filter ── */}
            <div className="map-poi-filter">
              <button className="map-poi-filter-header" onClick={() => setShowPoiFilter(!showPoiFilter)}>
                <span style={{ fontSize: 13 }}>🌍</span>
                게임 POI
                <span style={{ opacity: 0.5, fontSize: 10 }}>
                  {enabledPoiCategories.size}/{ALL_POI_KEYS.size}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: 'auto', transform: showPoiFilter ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showPoiFilter && (
                <div className="map-poi-filter-body">
                  {/* 시나리오 필터 */}
                  <div className="map-poi-scenario-row">
                    {['전체', '터치오브스카이', '혹독한겨울', '무한의꿈', '비정상수용'].map((s) => (
                      <button
                        key={s}
                        className={`map-poi-scenario-btn${poiScenarioFilter === s ? ' active' : ''}`}
                        onClick={() => setPoiScenarioFilter(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {/* 전체 토글 + 관리자 POI 추가 */}
                  <div className="map-poi-toggle-all-row">
                    <button className="map-poi-toggle-all" onClick={toggleAllPoi}>
                      {enabledPoiCategories.size === ALL_POI_KEYS.size ? '전체 끄기' : '전체 켜기'}
                    </button>
                    {session?.isAdmin && (
                      <button
                        className={`map-poi-admin-btn${poiAddMode ? ' active' : ''}`}
                        onClick={() => { setPoiAddMode(!poiAddMode); setDrawingMode(false); setMeasureMode(false); }}
                      >
                        + POI 추가
                      </button>
                    )}
                  </div>
                  {/* 그룹별 아코디언 */}
                  {POI_GROUPS.map((group) => {
                    const isExpanded = expandedPoiGroups.has(group.key);
                    const allOn = group.categories.every((c) => enabledPoiCategories.has(c.key));
                    const someOn = group.categories.some((c) => enabledPoiCategories.has(c.key));
                    return (
                      <div key={group.key} className="map-poi-group">
                        <button className="map-poi-group-header" onClick={() => toggleExpandGroup(group.key)}>
                          <span
                            className="map-poi-group-check"
                            onClick={(e) => { e.stopPropagation(); togglePoiGroup(group.key); }}
                          >
                            {allOn ? '☑' : someOn ? '◧' : '☐'}
                          </span>
                          <span className="map-poi-group-label">{group.label}</span>
                          <span className="map-poi-group-count">{group.categories.reduce((s, c) => s + (poiCounts[c.key] || 0), 0)}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: 'auto', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        {isExpanded && (
                          <div className="map-poi-group-items">
                            {group.categories.map((cat) => (
                              <button
                                key={cat.key}
                                className={`map-poi-item${enabledPoiCategories.has(cat.key) ? ' on' : ''}`}
                                onClick={() => togglePoiCategory(cat.key)}
                              >
                                <span className="map-poi-item-emoji">{cat.emoji}</span>
                                <span className="map-poi-item-label">{cat.label}</span>
                                <span className="map-poi-item-count">{poiCounts[cat.key] || 0}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
                    className={`map-pin-item${sel?.id === p.id ? ' selected' : ''}${p.visibility === 'private' ? ' map-pin-private' : ''}`}
                    style={{ '--pin-color': p.color || '#44ff88' }}
                    onClick={() => setSel(p)}
                  >
                    <div
                      className="map-pin-dot"
                      style={{ background: p.color || '#44ff88', '--pin-color': p.color || '#44ff88' }}
                    />
                    <div className="map-pin-info">
                      <div className="map-pin-name">
                        {p.visibility === 'private' && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, opacity: 0.5, flexShrink: 0 }}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                        )}
                        {p.label}
                      </div>
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
                    {/* Favorite star in list */}
                    {favorites.has(p.id) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffaa44" stroke="none" style={{ flexShrink: 0, opacity: 0.7 }}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
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
              {(routes || []).filter((r) => viewMode === 'all' || viewMode === 'favs' || (r.discordId && session?.discordId && r.discordId === session.discordId)).map((r) => (
                <div key={r.id} className={`map-route-item${r.visibility === 'private' ? ' map-pin-private' : ''}`}>
                  <div className="map-route-dot" style={{ background: r.color || '#ffaa44' }} />
                  <div className="map-route-info">
                    <div className="map-route-name">
                      {r.visibility === 'private' && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, opacity: 0.5, flexShrink: 0 }}>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                      )}
                      {r.label}
                    </div>
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
        {/* Visibility Toggle */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>공개 설정</label>
          <div className="map-visibility-toggle">
            <button className={`map-vis-btn${routeForm.visibility === 'public' ? ' active public' : ''}`} onClick={() => setRouteForm({ ...routeForm, visibility: 'public' })}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
              공용
            </button>
            <button className={`map-vis-btn${routeForm.visibility === 'private' ? ' active private' : ''}`} onClick={() => setRouteForm({ ...routeForm, visibility: 'private' })}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
              개인
            </button>
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
              <div className="map-detail-title">
                {sel.visibility === 'private' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, opacity: 0.6 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                )}
                {sel.label}
              </div>
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
              <div className="map-detail-actions">
                {/* Feature 3: Favorite button */}
                <Button
                  variant="secondary"
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(sel.id); }}
                  style={{ padding: '5px 14px', fontSize: 12, color: favorites.has(sel.id) ? '#ffaa44' : 'var(--text-secondary)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={favorites.has(sel.id) ? '#ffaa44' : 'none'} stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {favorites.has(sel.id) ? '즐겨찾기 해제' : '즐겨찾기'}
                </Button>
                {/* Feature 2: Share link */}
                <Button variant="secondary" onClick={() => copyShareLink(sel)} style={{ padding: '5px 14px', fontSize: 12 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  링크 복사
                </Button>
                {checkOwner(sel) && (
                  <>
                    <Button variant="secondary" onClick={() => startEdit(sel)} style={{ padding: '5px 14px', fontSize: 12 }}>
                      <Icons.Edit /> 수정
                    </Button>
                    <Button variant="danger" onClick={() => deletePin(sel.id)} style={{ padding: '5px 14px', fontSize: 12 }}>
                      <Icons.Trash /> 삭제
                    </Button>
                  </>
                )}
              </div>
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
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>카테고리</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PIN_CATEGORIES.map((cat) => (
              <button key={cat.key} onClick={() => setForm({ ...form, category: cat.key })} style={{
                padding: '5px 10px', borderRadius: 6, fontSize: 12,
                border: form.category === cat.key ? '1px solid var(--text-secondary)' : '1px solid var(--border)',
                background: form.category === cat.key ? 'var(--accent-dim)' : 'transparent',
                color: form.category === cat.key ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 14 }}>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>핀 색상</label>
          <div className="map-color-grid">
            {PIN_COLORS.map((c) => (
              <button key={c} className={`map-color-btn${form.color === c ? ' selected' : ''}`} style={{ background: c, '--btn-color': c }} onClick={() => setForm({ ...form, color: c })} />
            ))}
          </div>
        </div>

        {/* Scenario Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>시나리오</label>
          <div className="map-scenario-grid">
            {SCENARIOS.map((s) => (
              <button key={s} className={`map-scenario-btn${form.scenario === s ? ' active' : ''}`} onClick={() => setForm({ ...form, scenario: s })}>{s}</button>
            ))}
          </div>
        </div>

        {/* Visibility Toggle */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>공개 설정</label>
          <div className="map-visibility-toggle">
            <button className={`map-vis-btn${form.visibility === 'public' ? ' active public' : ''}`} onClick={() => setForm({ ...form, visibility: 'public' })}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
              공용
            </button>
            <button className={`map-vis-btn${form.visibility === 'private' ? ' active private' : ''}`} onClick={() => setForm({ ...form, visibility: 'private' })}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
              개인
            </button>
          </div>
        </div>

        <Input label="서버" type="number" value={form.server} onChange={(e) => setForm({ ...form, server: e.target.value })} placeholder="서버 번호 입력" />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button variant="secondary" onClick={() => { setShowAdd(false); setEditPin(null); setNp(null); setForm({ ...DEFAULT_FORM }); }}>취소</Button>
          <Button onClick={addOrUpdatePin}>{editPin ? '수정' : '추가'}</Button>
        </div>
      </Modal>
      {/* ── POI Detail Popup (마커 근처 작은 카드) ── */}
      {selPoi && (() => {
        const catInfo = POI_CATEGORY_MAP[selPoi.category];
        const groupColor = { locations: '#4488ff', loot: '#ffaa44', creatures: '#ff4444', resources: '#44ff88', knowledge: '#a855f7' }[selPoi.group] || '#4488ff';
        // 팝업 위치 계산: 마커 위쪽, 화면 밖이면 조정
        const px = poiPopupPos?.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 400);
        const py = poiPopupPos?.y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 300);
        const popupW = 280;
        const popupH = 200;
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
        let left = px - popupW / 2;
        let top = py - popupH - 24;
        if (left < 8) left = 8;
        if (left + popupW > vw - 8) left = vw - popupW - 8;
        if (top < 8) top = py + 30; // 위에 공간 없으면 아래에 표시
        return (
          <>
            {/* 반투명 배경 (클릭으로 닫기) */}
            <div
              onClick={() => { setSelPoi(null); setPoiPopupPos(null); }}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'transparent' }}
            />
            {/* 팝업 카드 */}
            <div
              className="fade-in"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                left, top,
                width: popupW,
                zIndex: 9999,
                background: 'var(--bg-secondary)',
                border: `1px solid ${groupColor}40`,
                borderRadius: 12,
                boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${groupColor}20`,
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease-out forwards',
              }}
            >
              {/* 헤더 */}
              <div style={{
                padding: '10px 14px 8px',
                background: `linear-gradient(135deg, ${groupColor}18, transparent)`,
                borderBottom: `1px solid ${groupColor}20`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', gap: 5,
                    lineHeight: 1.3,
                  }}>
                    <span>{catInfo?.emoji || '📍'}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selPoi.label}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    ({Math.round(selPoi.x)}, {Math.round(selPoi.y)})
                  </div>
                </div>
                <button
                  onClick={() => { setSelPoi(null); setPoiPopupPos(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, marginLeft: 4, flexShrink: 0, lineHeight: 1 }}
                >
                  <Icons.X />
                </button>
              </div>
              {/* 태그 줄 */}
              <div style={{ padding: '6px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                  background: `${groupColor}15`, color: groupColor, border: `1px solid ${groupColor}25`,
                }}>
                  {catInfo?.label || selPoi.category}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                  background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)',
                }}>
                  {selPoi.scenario || '전체'}
                </span>
              </div>
              {/* 노트 */}
              {selPoi.note && (
                <div style={{
                  padding: '4px 14px 8px',
                  fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5,
                }}>
                  {selPoi.note}
                </div>
              )}
              {/* 어드민 삭제 */}
              {session?.isAdmin && (
                <div style={{ padding: '4px 14px 10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="danger" onClick={() => { deletePoi(selPoi.id); setSelPoi(null); setPoiPopupPos(null); }} style={{ padding: '3px 10px', fontSize: 10 }}>
                    <Icons.Trash /> 삭제
                  </Button>
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* ── POI Add Modal (Admin) ── */}
      <Modal
        open={showPoiModal}
        onClose={() => { setShowPoiModal(false); setPoiNp(null); }}
        title="POI 추가"
      >
        {poiNp && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>
            좌표: ({poiNp.x}, {poiNp.y})
          </div>
        )}
        <Input label="이름" value={poiForm.label} onChange={(e) => setPoiForm({ ...poiForm, label: e.target.value })} placeholder="예: 무한의꿈 모노리스 #1" />
        <TextArea label="메모 (선택)" value={poiForm.note} onChange={(e) => setPoiForm({ ...poiForm, note: e.target.value })} placeholder="이 POI에 대한 설명" rows={2} />

        {/* POI 카테고리 선택 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>카테고리</label>
          {POI_GROUPS.map((group) => (
            <div key={group.key} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{group.label}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {group.categories.map((cat) => (
                  <button key={cat.key} onClick={() => setPoiForm({ ...poiForm, category: cat.key, group: group.key })} style={{
                    padding: '4px 8px', borderRadius: 6, fontSize: 11,
                    border: poiForm.category === cat.key ? '1px solid var(--text-secondary)' : '1px solid var(--border)',
                    background: poiForm.category === cat.key ? 'var(--accent-dim)' : 'transparent',
                    color: poiForm.category === cat.key ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 3, transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 12 }}>{cat.emoji}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 시나리오 선택 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>시나리오 (선택)</label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button
              className={`map-scenario-btn${!poiForm.scenario ? ' active' : ''}`}
              onClick={() => setPoiForm({ ...poiForm, scenario: '' })}
            >전체</button>
            {SCENARIOS.map((s) => (
              <button key={s}
                className={`map-scenario-btn${poiForm.scenario === s ? ' active' : ''}`}
                onClick={() => setPoiForm({ ...poiForm, scenario: s })}
              >{s}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button variant="secondary" onClick={() => { setShowPoiModal(false); setPoiNp(null); }}>취소</Button>
          <Button onClick={addPoi}>추가</Button>
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
