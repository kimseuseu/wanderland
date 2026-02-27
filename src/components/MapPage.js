'use client';

import { useState, useRef, useCallback } from 'react';
import { Icons } from './Icons';
import { Modal, Input, TextArea, Button } from './UI';
import { useSession } from 'next-auth/react';
import { useApi } from '@/hooks/useApi';

export default function MapPage() {
  const { data: session } = useSession();
  const { data: pins, loading, mutate } = useApi('/api/map-pins');
  const [showAdd, setShowAdd] = useState(false);
  const [sel, setSel] = useState(null);
  const [np, setNp] = useState(null);
  const [form, setForm] = useState({ label: '', note: '', color: '#44ff88' });
  const mr = useRef(null);

  const mc = useCallback((e) => {
    if (!mr.current) return;
    const r = mr.current.getBoundingClientRect();
    setNp({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    setShowAdd(true);
  }, []);

  const addPin = async () => {
    if (!form.label || !np) return;
    try {
      await fetch('/api/map-pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...np, ...form, author: session?.user?.name || '익명' }),
      });
      mutate();
    } catch (e) { console.error(e); }
    setShowAdd(false); setNp(null); setForm({ label: '', note: '', color: '#44ff88' });
  };

  const deletePin = async (id) => {
    try {
      await fetch(`/api/map-pins/${id}`, { method: 'DELETE' });
      mutate();
    } catch (e) { console.error(e); }
    setSel(null);
  };

  const colors = ['#44ff88', '#ff4444', '#ffaa44', '#4488ff', '#ffffff', '#ff44ff'];
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
        <div ref={mr} onClick={mc} style={{ position: 'relative', width: '100%', paddingBottom: '70%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'crosshair', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <g key={i}>
                <line x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="#444" strokeWidth="0.5" />
                <line x1="0" y1={`${(i + 1) * 10}%`} x2="100%" y2={`${(i + 1) * 10}%`} stroke="#444" strokeWidth="0.5" />
              </g>
            ))}
          </svg>
          {['A', 'B', 'C', 'D'].map((s, i) => (
            <div key={s} style={{ position: 'absolute', top: i < 2 ? '10%' : '55%', left: i % 2 === 0 ? '10%' : '55%', fontSize: 11, color: 'rgba(255,255,255,0.08)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>SECTOR {s}</div>
          ))}
          {pinList.map((p) => (
            <div key={p.id} onClick={(e) => { e.stopPropagation(); setSel(p); }}
              style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-100%)', cursor: 'pointer', zIndex: 10, transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-50%,-100%) scale(1.3)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(-50%,-100%) scale(1)'}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, boxShadow: `0 0 10px ${p.color}50`, border: '2px solid var(--bg-primary)' }} />
                <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 10, color: p.color, fontWeight: 700, textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>{p.label}</div>
              </div>
            </div>
          ))}
          {np && <div style={{ position: 'absolute', left: `${np.x}%`, top: `${np.y}%`, transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: '50%', border: '2px solid #fff', animation: 'pulse 1s infinite' }} />}
        </div>

        {/* Pin List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 12, maxHeight: 440, overflow: 'auto' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: sel.color }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>({sel.x.toFixed(1)}, {sel.y.toFixed(1)})</span>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 14 }}>{sel.note}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>핀 색상</label>
          <div style={{ display: 'flex', gap: 7 }}>
            {colors.map((c) => <button key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer' }} />)}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => { setShowAdd(false); setNp(null); }}>취소</Button>
          <Button onClick={addPin}>추가</Button>
        </div>
      </Modal>
    </div>
  );
}
