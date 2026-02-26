'use client';

import { useState } from 'react';
import { Icons } from './Icons';
import { Modal, Input, TextArea, Button, Tag, Section, Chip } from './UI';
import { BUILDS as INITIAL_BUILDS } from '@/data';

const typeColor = (t) => t === '섬광' ? '#88ccff' : t === '클래식' ? '#ffcc44' : t === '신판' ? '#88ff88' : 'var(--text-secondary)';

export default function BuildsPage() {
  const [builds, setBuilds] = useState(INITIAL_BUILDS);
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = builds.filter((b) => {
    const ms = b.name.includes(search) || b.author.includes(search) || b.mainWeapon.includes(search) || b.tags.some((t) => t.includes(search));
    const mf = filter === 'all' || b.tags.includes(filter);
    return ms && mf;
  });

  const tags = ['all', 'PvE', 'PvP', '저격', '레이드', '딜러', '탱커', '서포터'];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>장비 빌드</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>{filtered.length}개의 빌드</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Icons.Search /></div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="무기, 작성자, 태그 검색..."
            style={{ width: '100%', padding: '9px 13px 9px 38px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {tags.map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ padding: '4px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)', background: filter === t ? '#fff' : 'transparent', color: filter === t ? '#000' : 'var(--text-muted)', borderColor: filter === t ? '#fff' : 'var(--border)' }}>
              {t === 'all' ? '전체' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.map((b, i) => (
          <div key={b.id} className="fade-in"
            style={{ animationDelay: `${i * 0.04}s`, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s' }}
            onClick={() => setSel(b)}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {b.image && (
              <div style={{ height: 140, background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={b.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
              </div>
            )}
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{b.name}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{b.author} · {b.date}</p>
                </div>
                {b.grade && <Tag color="#ffd700">{b.grade}</Tag>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10, fontSize: 12 }}>
                <div style={{ padding: '5px 9px', background: 'var(--bg-tertiary)', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>메인</span>
                  <div style={{ fontWeight: 700, marginTop: 1 }}>{b.mainWeapon}</div>
                </div>
                <div style={{ padding: '5px 9px', background: 'var(--bg-tertiary)', borderRadius: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>서브</span>
                  <div style={{ fontWeight: 700, marginTop: 1 }}>{b.subWeapon}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>{b.tags?.map((t) => <Tag key={t}>{t}</Tag>)}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>♥ {b.likes}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>상세보기 →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.name || ''}>
        {sel && (
          <div>
            {sel.image && (
              <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 18, background: 'var(--bg-tertiary)' }}>
                <img src={sel.image} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', opacity: 0.9 }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              {sel.grade && <Tag color="#ffd700">{sel.grade}</Tag>}
              {sel.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{sel.author} · {sel.date}</span>
            </div>

            <Section icon="🔫" title="무기">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>메인 무기</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{sel.mainWeapon}</div>
                </div>
                <div style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>서브 무기</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{sel.subWeapon}</div>
                </div>
              </div>
            </Section>

            {sel.tuning && (
              <Section icon="🎯" title="튜닝">
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{sel.tuning.map((t, i) => <Chip key={i} accent="#88ccff">{t}</Chip>)}</div>
              </Section>
            )}

            {sel.modules && (
              <Section icon="🧩" title="모듈 접미">
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{sel.modules.map((m, i) => <Chip key={i} accent="var(--warning)">{m}</Chip>)}</div>
              </Section>
            )}

            {sel.infections && (
              <Section icon="🦠" title="감염물">
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{sel.infections.map((x, i) => <Chip key={i} accent="#cc88ff">{x}</Chip>)}</div>
              </Section>
            )}

            {sel.doping && (
              <Section icon="🍖" title="도핑">
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{sel.doping.map((d, i) => <Chip key={i} accent="var(--success)">{d}</Chip>)}</div>
              </Section>
            )}

            {sel.armorSet && (
              <Section icon="🦺" title="방어구 세트">
                <div style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{sel.armorSet}</div>
                  {sel.armorOptions?.map((o, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '3px 0' }}>· {o}</div>)}
                </div>
              </Section>
            )}

            {sel.suffixes && (
              <Section icon="🔧" title="장비 접미사 구성">
                <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 60px', gap: 8, padding: '8px 12px', background: 'var(--bg-tertiary)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                    <span>부위</span><span>접미사</span><span>키워드</span><span>타입</span>
                  </div>
                  {sel.suffixes.map((s, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 60px', gap: 8, padding: '7px 12px', borderTop: '1px solid var(--border)', fontSize: 13, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 12 }}>{s.part}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{s.suffix}</span>
                      <span style={{ color: 'var(--warning)', fontSize: 12, fontWeight: 600 }}>{s.keyword}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: typeColor(s.type) }}>{s.type}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {sel.leather && (
              <Section icon="🧵" title="가죽 장비">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
                  {sel.leather.map((l, i) => (
                    <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-tertiary)', borderRadius: 6 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.part}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 1 }}>{l.name}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {sel.notes && (
              <Section icon="📝" title="추가 정보">
                <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: 13, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {sel.notes}
                </div>
              </Section>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Button variant="secondary" style={{ padding: '7px 14px', fontSize: 12 }}><Icons.Share /> 공유</Button>
              <Button variant="secondary" style={{ padding: '7px 14px', fontSize: 12 }}><Icons.Copy /> 복사</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
