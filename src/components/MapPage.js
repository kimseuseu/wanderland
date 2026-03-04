'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Icons } from './Icons';
import { Modal, Input, TextArea, Button } from './UI';
import { useSession } from 'next-auth/react';
import { useApi } from '@/hooks/useApi';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', minHeight: 500, borderRadius: 14,
      background: 'var(--bg-card)', border: '1px solid var(--border)',
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

export default function MapPage() {
  const { data: session } = useSession();
  const { data: pins, loading, mutate } = useApi('/api/map-pins');
  const [showAdd, setShowAdd] = useState(false);
  const [sel, setSel] = useState(null);
  const [np, setNp] = useState(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });

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
    } catch (e) { console.warn('[map] pin create failed:', e); }
    setShowAdd(false); setNp(null); setForm({ ...DEFAULT_FORM });
  };

  const deletePin = async (id) => {
    try {
      await fetch(`/api/map-pins/${id}`, { method: 'DELETE' });
      mutate();
    } catch (e) { console.warn('[map] pin delete failed:', e); }
    setSel(null);
  };

  const pinList = pins || [];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', animation: 'pulse 1.5s ease-in-out infinite' }}>지도 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>게임 지도</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>지도를 클릭하여 핀 추가 · {pinList.length}개</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 14, alignItems: 'start' }}>
        {/* Map */}
        <div style={{ height: 560 }}>
          <LeafletMap pins={pins} selectedPin={sel} onMapClick={handleMapClick} onPinClick={setSel} />
        </div>

        {/* Pin List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 12, maxHeight: 560, overflow: 'auto' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 12 }}>핀 목록</h3>
          {pinList.map((p) => (
            <div key={p.id} onClick={() => setSel(p)}
              style={{ padding: '7px 9px', borderRadius: 8, marginBottom: 3, cursor: 'pointer', transition: 'all 0.2s', background: sel?.id === p.id ? 'var(--bg-tertiary)' : 'transparent' }}
              onMouseEnter={(e) => { if (sel?.id !== p.id) e.currentTarget.style.background = 'var(--accent-dim)'; }}
              onMouseLeave={(e) => { if (sel?.id !== p.id) e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>{p.label}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 13, marginTop: 1 }}>{p.author}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pin Detail */}
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

      {/* Add Pin */}
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
