'use client';

import { useState } from 'react';
import { Icons } from './Icons';
import { Tag } from './UI';
import { BUILDS as INITIAL_BUILDS } from '@/data';

const typeColor = (t) => t === '섬광' ? '#88ccff' : t === '클래식' ? '#ffcc44' : t === '신판' ? '#88ff88' : 'var(--text-secondary)';
const catColor = { '총기': '#ff6b6b', '원소': '#88ccff', '하이브리드': '#cc88ff' };
const categories = ['전체', '총기', '원소', '하이브리드'];
const weaponTypes = ['전체', '권총', '산탄총', '기관단총', '돌격소총', '저격소총', '경기관총', '석궁'];

/* ─── Panel: 게임 UI 스타일 패널 ─── */
function Panel({ title, icon, accent, children, style }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden', ...style,
    }}>
      {title && (
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.02)',
        }}>
          {icon && <span style={{ color: accent || 'var(--text-muted)', display: 'flex' }}>{icon}</span>}
          <span style={{
            fontSize: 11, fontWeight: 700, color: accent || 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>{title}</span>
        </div>
      )}
      <div style={{ padding: '14px 16px' }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Stat Row: 인게임 스탯 행 ─── */
function StatRow({ label, value, accent }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 6, marginBottom: 4,
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: accent || 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   빌드 상세 페이지
   ═══════════════════════════════════════════ */
function BuildDetail({ build, onBack }) {
  return (
    <div className="fade-in">
      {/* ── Back button ── */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', padding: '4px 0', fontSize: 13, fontFamily: 'var(--font-body)',
          display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <Icons.ChevronLeft /> 빌드 목록으로
      </button>

      {/* ── Hero Banner with weapon image ── */}
      <div style={{
        position: 'relative', borderRadius: 14, overflow: 'hidden',
        marginBottom: 20, border: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}>
        {build.image && (
          <div style={{
            height: 220, overflow: 'hidden',
            background: 'var(--bg-tertiary)',
          }}>
            <img
              src={build.image} alt={build.name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                opacity: 0.5, filter: 'blur(2px) saturate(0.8)',
              }}
            />
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.85) 70%, var(--bg-card) 100%)',
            }} />
            {/* Weapon image - sharp, centered */}
            <img
              src={build.image} alt=""
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -60%)',
                height: 140, objectFit: 'contain',
                filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.6))',
              }}
            />
          </div>
        )}
        {/* Build info overlay */}
        <div style={{
          padding: build.image ? '0 24px 20px' : '20px 24px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 10 }}>
                {build.name}
              </h2>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {build.grade && <Tag color="#ffd700">{build.grade}</Tag>}
                {build.category && <Tag color={catColor[build.category]}>{build.category}</Tag>}
                {build.weaponType && <Tag>{build.weaponType}</Tag>}
                {build.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right', paddingBottom: 2 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{build.author}</div>
              <div style={{ marginTop: 2 }}>{build.date}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-Column Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* ▸ Left Column: 무기 + 전투 세팅 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 무기 */}
          <Panel title="무기" icon={<Icons.Sword />} accent="#ff6b6b">
            <div style={{
              padding: '14px 16px', background: 'var(--bg-tertiary)',
              borderRadius: 8, marginBottom: 8,
              borderLeft: '3px solid #ff6b6b',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#ff6b6b', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>MAIN</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{build.mainWeapon}</div>
              </div>
              <div style={{
                width: 24, height: 24, borderRadius: 4,
                background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#ff6b6b',
              }}>1</div>
            </div>
            <div style={{
              padding: '14px 16px', background: 'var(--bg-tertiary)',
              borderRadius: 8,
              borderLeft: '3px solid #4488ff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#4488ff', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>SUB</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{build.subWeapon}</div>
              </div>
              <div style={{
                width: 24, height: 24, borderRadius: 4,
                background: 'rgba(68,136,255,0.12)', border: '1px solid rgba(68,136,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#4488ff',
              }}>2</div>
            </div>
          </Panel>

          {/* 튜닝 & 감염물 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {build.tuning && (
              <Panel title="튜닝" accent="#88ccff">
                {build.tuning.map((t, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', background: 'var(--bg-tertiary)',
                    borderRadius: 6, fontSize: 13, fontWeight: 600, marginBottom: 4,
                  }}>{t}</div>
                ))}
              </Panel>
            )}
            {build.infections && (
              <Panel title="감염물" accent="#cc88ff">
                {build.infections.map((x, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', background: 'var(--bg-tertiary)',
                    borderRadius: 6, fontSize: 13, fontWeight: 600, marginBottom: 4,
                  }}>{x}</div>
                ))}
              </Panel>
            )}
          </div>

          {/* 도핑 */}
          {build.doping && (
            <Panel title="도핑" accent="var(--success)">
              {build.doping.map((d, i) => (
                <div key={i} style={{
                  padding: '8px 12px', background: 'var(--bg-tertiary)',
                  borderRadius: 6, fontSize: 13, fontWeight: 600, marginBottom: 4,
                }}>{d}</div>
              ))}
            </Panel>
          )}
        </div>

        {/* ▸ Right Column: 방어구 + 접미사 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 방어구 */}
          {build.armorSet && (
            <Panel title="방어구" icon={<Icons.Shield />} accent="#ffd700">
              <div style={{
                padding: '14px 16px', background: 'var(--bg-tertiary)',
                borderRadius: 8, borderLeft: '3px solid #ffd700', marginBottom: 10,
              }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{build.armorSet}</div>
              </div>
              {build.armorOptions && build.armorOptions.map((o, i) => (
                <div key={i} style={{
                  padding: '8px 12px', background: 'var(--bg-tertiary)',
                  borderRadius: 6, fontSize: 13, color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ffd700', flexShrink: 0 }} />
                  {o}
                </div>
              ))}
            </Panel>
          )}

          {/* 가죽 장비 */}
          {build.leather && (
            <Panel title="가죽 장비" accent="#c8a87c">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: 6 }}>
                {build.leather.map((l, i) => (
                  <div key={i} style={{
                    padding: '10px 8px', background: 'var(--bg-tertiary)',
                    borderRadius: 8, textAlign: 'center',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 4 }}>{l.part}</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{l.name}</div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

        </div>
      </div>

      {/* ── Full-width: 모듈 구성 (메인 섹션) ── */}
      {build.suffixes && (
        <div style={{
          marginTop: 20,
          background: 'var(--bg-card)',
          border: '1.5px solid rgba(255,170,68,0.25)',
          borderRadius: 14,
          padding: '24px 28px',
          boxShadow: '0 2px 20px rgba(255,170,68,0.06)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
          }}>
            <div style={{
              width: 4, height: 22, borderRadius: 2, background: 'var(--warning)',
            }} />
            <h3 style={{
              fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)', margin: 0,
            }}>모듈 구성</h3>
          </div>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '72px 1fr 1fr 56px',
              padding: '10px 16px', background: 'rgba(255,170,68,0.06)',
              fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              <span>부위</span><span>접미사</span><span>키워드</span><span>타입</span>
            </div>
            {build.suffixes.map((s, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '72px 1fr 1fr 56px',
                padding: '11px 16px', borderTop: '1px solid var(--border)',
                fontSize: 13, alignItems: 'center',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)',
                transition: 'background 0.15s',
              }}>
                <span style={{ fontWeight: 800, fontSize: 12 }}>{s.part}</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{s.suffix}</span>
                <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{s.keyword}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: typeColor(s.type),
                  padding: '3px 8px', background: `${typeColor(s.type)}15`,
                  borderRadius: 4, textAlign: 'center',
                }}>{s.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Full-width: 모듈 접미 + 메모 ── */}
      {build.modules && (
        <Panel title="모듈 접미" accent="var(--warning)" style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {build.modules.map((m, i) => (
              <div key={i} style={{
                padding: '8px 14px', background: 'var(--bg-tertiary)',
                borderRadius: 6, fontSize: 13, fontWeight: 600,
                color: 'var(--warning)', border: '1px solid rgba(255,170,68,0.15)',
              }}>{m}</div>
            ))}
          </div>
        </Panel>
      )}

      {build.notes && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderLeft: '3px solid var(--text-muted)',
          borderRadius: 12, padding: '20px', marginTop: 14,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            letterSpacing: '0.08em', marginBottom: 10,
          }}>NOTES</div>
          <div style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {build.notes}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   빌드 목록 페이지
   ═══════════════════════════════════════════ */
export default function BuildsPage() {
  const [builds] = useState(INITIAL_BUILDS);
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('전체');
  const [weaponFilter, setWeaponFilter] = useState('전체');

  /* 상세 페이지 */
  if (sel) {
    return <BuildDetail build={sel} onBack={() => setSel(null)} />;
  }

  /* 목록 필터링 */
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
                style={{ padding: '4px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)', background: catFilter === c ? (catColor[c] || '#fff') : 'transparent', color: catFilter === c ? '#000' : (catColor[c] || 'var(--text-muted)'), borderColor: catFilter === c ? (catColor[c] || '#fff') : 'var(--border)' }}>
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
      <div className="builds-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.map((b, i) => (
          <div key={b.id} className="fade-in build-card"
            style={{ animationDelay: `${i * 0.04}s`, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s' }}
            onClick={() => setSel(b)}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {b.image && (
              <div className="build-card-img" style={{ height: 140, background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={b.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
              </div>
            )}
            <div className="build-card-body" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h3 className="build-card-title" style={{ fontSize: 16, fontWeight: 700 }}>{b.name}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{b.author} · {b.date}</p>
                </div>
                {b.grade && <Tag color="#ffd700">{b.grade}</Tag>}
              </div>
              <div className="build-card-weapons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10, fontSize: 12 }}>
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
    </div>
  );
}
