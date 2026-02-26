'use client';

import { useState } from 'react';
import { Icons } from './Icons';
import { Modal, Input, TextArea, Button, Tag, Section, Chip } from './UI';
import { BUILDS as INITIAL_BUILDS } from '@/data';

const typeColor = (t) => t === '섬광' ? '#88ccff' : t === '클래식' ? '#ffcc44' : t === '신판' ? '#88ff88' : 'var(--text-secondary)';
const catColor = { '총기': '#ff6b6b', '원소': '#88ccff', '하이브리드': '#cc88ff' };
const categories = ['전체', '총기', '원소', '하이브리드'];
const weaponTypes = ['전체', '권총', '산탄총', '기관단총', '돌격소총', '저격소총', '경기관총', '석궁'];

export default function BuildsPage() {
  const [builds, setBuilds] = useState(INITIAL_BUILDS);
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('전체');
  const [weaponFilter, setWeaponFilter] = useState('전체');

  const filtered = builds.filter((b) => {
    const ms = b.name.includes(search) || b.author.includes(search) || b.mainWeapon.includes(search) || (b.tags && b.tags.some((t) => t.includes(search)));
    const mc = catFilter === '전체' || b.category === catFilter;
    const mw = weaponFilter === '전체' || b.weaponType === weaponFilter;
    return ms && mc && mw;
  });

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
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>대분류</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button key={c} onClick={() => setCatFilter(c)}
                style={{ padding: '4px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)', background: catFilter === c ? (catColor[c] || '#fff') : 'transparent', color: catFilter === c ? (c === '전체' ? '#000' : '#000') : (catColor[c] || 'var(--text-muted)'), borderColor: catFilter === c ? (catColor[c] || '#fff') : 'var(--border)' }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>무기 종류</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {weaponTypes.map((w) => (
              <button key={w} onClick={() => setWeaponFilter(w)}
                style={{ padding: '4px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)', background: weaponFilter === w ? '#fff' : 'transparent', color: weaponFilter === w ? '#000' : 'var(--text-muted)', borderColor: weaponFilter === w ? '#fff' : 'var(--border)' }}>
                {w}
              </button>
            ))}
          </div>
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
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {b.category && <Tag color={catColor[b.category]}>{b.category}</Tag>}
                {b.weaponType && <Tag>{b.weaponType}</Tag>}
                {b.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
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
            {/* Header info */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
              {sel.grade && <Tag color="#ffd700">{sel.grade}</Tag>}
              {sel.category && <Tag color={catColor[sel.category]}>{sel.category}</Tag>}
              {sel.weaponType && <Tag>{sel.weaponType}</Tag>}
              {sel.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{sel.author} · {sel.date}</span>
            </div>

            {/* Weapons - side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div style={{ padding: '14px 16px', background: 'var(--bg-tertiary)', borderRadius: 10, borderLeft: '3px solid #ff6b6b' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>메인 무기</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{sel.mainWeapon}</div>
              </div>
              <div style={{ padding: '14px 16px', background: 'var(--bg-tertiary)', borderRadius: 10, borderLeft: '3px solid #4488ff' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>서브 무기</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{sel.subWeapon}</div>
              </div>
            </div>

            {/* Tuning & Modules & Infections & Doping - compact grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {sel.tuning && (
                <div style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: '#88ccff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>튜닝</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{sel.tuning.map((t, i) => <Chip key={i} accent="#88ccff">{t}</Chip>)}</div>
                </div>
              )}
              {sel.infections && (
                <div style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: '#cc88ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>감염물</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{sel.infections.map((x, i) => <Chip key={i} accent="#cc88ff">{x}</Chip>)}</div>
                </div>
              )}
            </div>

            {sel.modules && (
              <div style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 10, marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: 'var(--warning)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>모듈 접미</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{sel.modules.map((m, i) => <Chip key={i} accent="var(--warning)">{m}</Chip>)}</div>
              </div>
            )}

            {sel.doping && (
              <div style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 10, marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>도핑</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{sel.doping.map((d, i) => <Chip key={i} accent="var(--success)">{d}</Chip>)}</div>
              </div>
            )}

            {/* Armor Set */}
            {sel.armorSet && (
              <div style={{ padding: '14px 16px', background: 'var(--bg-tertiary)', borderRadius: 10, marginBottom: 20, borderLeft: '3px solid #ffd700' }}>
                <div style={{ fontSize: 10, color: '#ffd700', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>방어구 세트</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{sel.armorSet}</div>
                {sel.armorOptions?.map((o, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }} />
                    {o}
                  </div>
                ))}
              </div>
            )}

            {/* Suffix Table */}
            {sel.suffixes && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 2 }}>장비 접미사 구성</div>
                <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1fr 52px', gap: 0, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <span>부위</span><span>접미사</span><span>키워드</span><span>타입</span>
                  </div>
                  {sel.suffixes.map((s, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1fr 52px', gap: 0, padding: '9px 14px', borderTop: '1px solid var(--border)', fontSize: 13, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>{s.part}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.suffix}</span>
                      <span style={{ color: 'var(--warning)', fontSize: 12, fontWeight: 600 }}>{s.keyword}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: typeColor(s.type), padding: '2px 6px', background: `${typeColor(s.type)}12`, borderRadius: 4, textAlign: 'center' }}>{s.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leather */}
            {sel.leather && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 2 }}>가죽 장비</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 6 }}>
                  {sel.leather.map((l, i) => (
                    <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l.part}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3 }}>{l.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {sel.notes && (
              <div style={{ padding: '14px 16px', background: 'var(--bg-tertiary)', borderRadius: 10, marginBottom: 16, borderLeft: '3px solid var(--text-muted)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>메모</div>
                <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {sel.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
