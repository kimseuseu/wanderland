'use client';

import { useState } from 'react';
import { Icons } from './Icons';
import { Modal, Input, TextArea, Button, Tag } from './UI';
import { MEMBERS as INITIAL } from '@/data';

const ro = { '낙원가이드': 0, '베테랑사원': 1, '신입사원': 2, '휴직': 3 };
const rc = { '낙원가이드': '#ffd700', '베테랑사원': 'var(--success)', '신입사원': 'var(--text-secondary)', '휴직': 'var(--text-muted)' };

export default function MembersPage() {
  const [members, setMembers] = useState(INITIAL);
  const [showAdd, setShowAdd] = useState(false);
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', role: '신입사원', level: '1', deviance: '0', note: '' });

  const filtered = members
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.role.includes(search))
    .sort((a, b) => (ro[a.role] ?? 9) - (ro[b.role] ?? 9));

  const add = () => {
    if (!form.name) return;
    setMembers([...members, { ...form, id: Date.now(), level: +form.level || 1, deviance: +form.deviance || 0, joinDate: new Date().toISOString().split('T')[0] }]);
    setShowAdd(false);
    setForm({ name: '', role: '신입사원', level: '1', deviance: '0', note: '' });
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>하이브원</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>총 {members.length}명</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Icons.Plus /> 멤버 추가</Button>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Icons.Search /></div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름, 직급 검색..."
          style={{ width: '100%', padding: '9px 13px 9px 38px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {filtered.map((m, i) => (
          <div key={m.id} className="fade-in"
            style={{ animationDelay: `${i * 0.04}s`, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'all 0.25s' }}
            onClick={() => setSel(m)}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${rc[m.role]}14`, border: `1.5px solid ${rc[m.role]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-display)', color: rc[m.role], flexShrink: 0 }}>{m.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{m.name}</span>
                  {m.name === '간편' && <span style={{ color: '#ffd700' }}><Icons.Crown /></span>}
                </div>
                <Tag color={rc[m.role]}>{m.role}</Tag>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
              <div style={{ padding: '5px 8px', background: 'var(--bg-tertiary)', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>레벨</div><div style={{ fontWeight: 700, marginTop: 1 }}>{m.level}</div>
              </div>
              <div style={{ padding: '5px 8px', background: 'var(--bg-tertiary)', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>디비전스</div><div style={{ fontWeight: 700, marginTop: 1 }}>{m.deviance}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail */}
      <Modal open={!!sel} onClose={() => setSel(null)} title="멤버 상세">
        {sel && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${rc[sel.role]}14`, border: `2px solid ${rc[sel.role]}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: rc[sel.role] }}>{sel.name[0]}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <h3 style={{ fontSize: 19, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{sel.name}</h3>
                  {sel.name === '간편' && <span style={{ color: '#ffd700' }}><Icons.Crown /></span>}
                </div>
                <Tag color={rc[sel.role]}>{sel.role}</Tag>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {[['레벨', sel.level], ['디비전스', sel.deviance]].map(([l, v]) => (
                <div key={l} style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{v}</div>
                </div>
              ))}
            </div>
            {sel.note && <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>{sel.note}</div>}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>가입일: {sel.joinDate}</div>
          </div>
        )}
      </Modal>

      {/* Add */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="멤버 추가">
        <Input label="닉네임" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="게임 내 닉네임" />
        <div style={{ marginBottom: 13 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>직급</label>
          <div style={{ display: 'flex', gap: 5 }}>
            {['낙원가이드', '베테랑사원', '신입사원', '휴직'].map((r) => (
              <button key={r} onClick={() => setForm({ ...form, role: r })}
                style={{ flex: 1, padding: '7px 3px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', background: form.role === r ? `${rc[r]}15` : 'var(--bg-tertiary)', color: form.role === r ? rc[r] : 'var(--text-muted)', border: `1px solid ${form.role === r ? `${rc[r]}30` : 'var(--border)'}` }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input label="레벨" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
          <Input label="디비전스" value={form.deviance} onChange={(e) => setForm({ ...form, deviance: e.target.value })} />
        </div>
        <TextArea label="메모" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="선택" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>취소</Button>
          <Button onClick={add}>추가</Button>
        </div>
      </Modal>
    </div>
  );
}
