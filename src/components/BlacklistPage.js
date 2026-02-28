'use client';

import { useState } from 'react';
import { Icons } from './Icons';
import { Modal, Input, TextArea, Button } from './UI';
import { useSession } from 'next-auth/react';
import { useApi } from '@/hooks/useApi';

export default function BlacklistPage() {
  const { data: session } = useSession();
  const { data: list, loading, mutate } = useApi('/api/blacklist');
  const [showAdd, setShowAdd] = useState(false);
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', uuid: '', alts: '', clan: '', incident: '' });

  const items = list || [];
  const filtered = items.filter((b) =>
    (b.name || '').includes(search) || (b.uuid || '').includes(search) || (b.alts || '').includes(search) || (b.clan || '').includes(search)
  );

  const add = async () => {
    if (!form.name) return;
    try {
      await fetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, reporter: session?.user?.name || '익명' }),
      });
      mutate();
    } catch (e) { console.error(e); }
    setShowAdd(false);
    setForm({ name: '', uuid: '', alts: '', clan: '', incident: '' });
  };

  const remove = async (id) => {
    try {
      await fetch(`/api/blacklist/${id}`, { method: 'DELETE' });
      mutate();
    } catch (e) { console.error(e); }
    setSel(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', animation: 'pulse 1.5s ease-in-out infinite' }}>불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>블랙리스트</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>주의 유저 {filtered.length}명</p>
        </div>
        <Button variant="danger" onClick={() => setShowAdd(true)}><Icons.Plus /> 유저 등록</Button>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Icons.Search /></div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름, UUID, 부캐, 소속 검색..."
          style={{ width: '100%', padding: '9px 13px 9px 38px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }} />
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr', gap: 14, padding: '11px 18px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <span>닉네임</span><span>UUID</span><span>소속</span><span>등록일</span>
        </div>
        {filtered.map((item, i) => (
          <div key={item.id} className="fade-in"
            style={{ animationDelay: `${i * 0.04}s`, display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr', gap: 14, padding: '12px 18px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s', alignItems: 'center' }}
            onClick={() => setSel(item)}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-dim)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</span>
              {item.alts && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>부캐: {item.alts}</div>}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.uuid}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.clan}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.date}</span>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>검색 결과가 없습니다.</div>}
      </div>

      {/* Detail */}
      <Modal open={!!sel} onClose={() => setSel(null)} title="블랙리스트 상세">
        {sel && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--danger-dim)', border: '1px solid rgba(255,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--danger)' }}>{sel.name[0]}</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{sel.name}</h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sel.uuid}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
              <div style={{ padding: '9px 12px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase' }}>부캐</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{sel.alts || '없음'}</div>
              </div>
              <div style={{ padding: '9px 12px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase' }}>소속</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{sel.clan}</div>
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>사건 개요</div>
              <div style={{ padding: 12, background: 'var(--danger-dim)', border: '1px solid rgba(255,68,68,0.1)', borderRadius: 8, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{sel.incident}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>신고: {sel.reporter} · {sel.date}</span>
              <Button variant="danger" onClick={() => remove(sel.id)} style={{ padding: '5px 12px', fontSize: 12 }}><Icons.Trash /> 삭제</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="블랙리스트 등록">
        <Input label="닉네임" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="게임 내 닉네임" />
        <Input label="UUID" value={form.uuid} onChange={(e) => setForm({ ...form, uuid: e.target.value })} placeholder="OH-XXXXX-KR" />
        <Input label="부캐" value={form.alts} onChange={(e) => setForm({ ...form, alts: e.target.value })} placeholder="쉼표 구분 (선택)" />
        <Input label="소속 하이브" value={form.clan} onChange={(e) => setForm({ ...form, clan: e.target.value })} placeholder="하이브명 또는 무소속" />
        <TextArea label="사건 개요" value={form.incident} onChange={(e) => setForm({ ...form, incident: e.target.value })} placeholder="상세 기록..." />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>취소</Button>
          <Button variant="danger" onClick={add}>등록</Button>
        </div>
      </Modal>
    </div>
  );
}
