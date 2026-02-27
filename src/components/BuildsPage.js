'use client';

import { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { Tag } from './UI';
import { BUILDS as INITIAL_BUILDS } from '@/data';

const typeColor = (t) => t === '섬광' ? '#88ccff' : t === '클래식' ? '#ffcc44' : t === '신판' ? '#88ff88' : 'var(--text-secondary)';
const catColor = { '총기': '#ff6b6b', '원소': '#88ccff', '하이브리드': '#cc88ff' };
const categories = ['전체', '총기', '원소', '하이브리드'];
const weaponTypes = ['전체', '권총', '산탄총', '기관단총', '돌격소총', '저격소총', '경기관총', '석궁'];

/* ═══════════════════════════════════════════
   빌드 상세 페이지 (Sticky Parallax)
   ═══════════════════════════════════════════ */
function BuildDetail({ build, onBack }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );
    const els = containerRef.current?.querySelectorAll('.build-reveal');
    els?.forEach((el) => observer.observe(el));
    return () => els?.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div ref={containerRef}>
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

      {/* ═══ HERO ═══ */}
      <div className="fade-in" style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        marginBottom: 8, border: '1px solid var(--border)', background: 'var(--bg-card)',
        minHeight: 280,
      }}>
        {build.image && (
          <>
            <img src={build.image} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', opacity: 0.35, filter: 'blur(4px) saturate(0.7)',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.7) 50%, var(--bg-card) 100%)',
            }} />
            <img src={build.image} alt="" style={{
              position: 'absolute', top: '38%', left: '50%',
              transform: 'translate(-50%, -50%)',
              height: 160, objectFit: 'contain',
              filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.6))',
            }} />
          </>
        )}
        <div style={{ position: 'relative', zIndex: 1, padding: '180px 28px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: 10 }}>
              {build.name}
            </h1>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              {build.grade && <Tag color="#ffd700">{build.grade}</Tag>}
              {build.category && <Tag color={catColor[build.category]}>{build.category}</Tag>}
              {build.weaponType && <Tag>{build.weaponType}</Tag>}
              {build.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{build.author}</div>
            <div style={{ marginTop: 2 }}>{build.date}</div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 1: 무기 & 전투 세팅 ═══ */}
      <div className="about-section" style={{ minHeight: '100vh', display: 'flex', position: 'relative', paddingTop: 20 }}>
        <div className="about-sticky-left" style={{
          position: 'sticky', top: 48, height: 'fit-content',
          width: '35%', paddingTop: '12vh', paddingLeft: 8, flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, color: '#ff6b6b', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>01</div>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 34px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
            무기 &
          </h2>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 34px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2, color: '#ff6b6b' }}>
            전투 세팅
          </h2>
        </div>

        <div style={{ flex: 1, paddingTop: '14vh', paddingBottom: '12vh', paddingLeft: 32, paddingRight: 8 }}>
          {/* 무기 */}
          <div className="build-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 12 }}>WEAPONS</div>
            <div style={{
              padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderLeft: '3px solid #ff6b6b', borderRadius: 10, marginBottom: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#ff6b6b', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>MAIN</div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{build.mainWeapon}</div>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#ff6b6b' }}>1</div>
            </div>
            <div style={{
              padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderLeft: '3px solid #4488ff', borderRadius: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#4488ff', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>SUB</div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{build.subWeapon}</div>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(68,136,255,0.1)', border: '1px solid rgba(68,136,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#4488ff' }}>2</div>
            </div>
          </div>

          {/* 튜닝 & 감염물 */}
          <div className="build-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s', marginTop: 36 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {build.tuning && (
                <div>
                  <div style={{ fontSize: 10, color: '#88ccff', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 10 }}>TUNING</div>
                  {build.tuning.map((t, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{t}</div>
                  ))}
                </div>
              )}
              {build.infections && (
                <div>
                  <div style={{ fontSize: 10, color: '#cc88ff', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 10 }}>INFECTION</div>
                  {build.infections.map((x, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{x}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 도핑 */}
          {build.doping && (
            <div className="build-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s', marginTop: 36 }}>
              <div style={{ fontSize: 10, color: '#44ff88', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 10 }}>DOPING</div>
              {build.doping.map((d, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{d}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Divider ═══ */}
      <div className="shimmer-line" style={{ maxWidth: 120, margin: '0 auto' }} />

      {/* ═══ SECTION 2: 방어구 ═══ */}
      <div className="about-section" style={{ minHeight: '80vh', display: 'flex', position: 'relative' }}>
        <div className="about-sticky-left" style={{
          position: 'sticky', top: 48, height: 'fit-content',
          width: '35%', paddingTop: '12vh', paddingLeft: 8, flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, color: '#ffd700', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>02</div>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 34px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
            방어구 &
          </h2>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 34px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2, color: '#ffd700' }}>
            가죽 장비
          </h2>
        </div>

        <div style={{ flex: 1, paddingTop: '14vh', paddingBottom: '12vh', paddingLeft: 32, paddingRight: 8 }}>
          {/* 방어구 세트 */}
          {build.armorSet && (
            <div className="build-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{ fontSize: 10, color: '#ffd700', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 12 }}>ARMOR SET</div>
              <div style={{
                padding: '18px 22px', background: 'var(--bg-card)', borderLeft: '3px solid #ffd700',
                border: '1px solid var(--border)', borderRadius: 10, marginBottom: 12,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{build.armorSet}</div>
              </div>
              {build.armorOptions?.map((o, i) => (
                <div key={i} style={{
                  padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 14, color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ffd700', flexShrink: 0 }} />
                  {o}
                </div>
              ))}
            </div>
          )}

          {/* 가죽 장비 */}
          {build.leather && (
            <div className="build-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s', marginTop: 36 }}>
              <div style={{ fontSize: 10, color: '#c8a87c', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 12 }}>LEATHER</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                {build.leather.map((l, i) => (
                  <div key={i} style={{
                    padding: '14px 10px', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 6 }}>{l.part}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{l.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Divider ═══ */}
      <div className="shimmer-line" style={{ maxWidth: 120, margin: '0 auto' }} />

      {/* ═══ SECTION 3: 모듈 구성 ═══ */}
      {build.suffixes && (
        <div className="about-section" style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
          <div className="about-sticky-left" style={{
            position: 'sticky', top: 48, height: 'fit-content',
            width: '35%', paddingTop: '12vh', paddingLeft: 8, flexShrink: 0,
          }}>
            <div style={{ fontSize: 11, color: '#ffaa44', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>03</div>
            <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 34px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
              모듈
            </h2>
            <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 34px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2, color: '#ffaa44' }}>
              구성
            </h2>
            {/* 모듈 접미 tags */}
            {build.modules && (
              <div style={{ marginTop: 24, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {build.modules.map((m, i) => (
                  <div key={i} style={{
                    padding: '6px 10px', fontSize: 11, fontWeight: 600,
                    color: '#ffaa44', background: 'rgba(255,170,68,0.06)',
                    border: '1px solid rgba(255,170,68,0.15)', borderRadius: 6,
                  }}>{m}</div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, paddingTop: '14vh', paddingBottom: '12vh', paddingLeft: 32, paddingRight: 8 }}>
            <div className="build-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{ fontSize: 10, color: '#ffaa44', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 16 }}>SUFFIX TABLE</div>
              {/* Suffix rows as individual cards */}
              {build.suffixes.map((s, i) => (
                <div key={i} className="build-reveal" style={{
                  opacity: 0, transform: 'translateY(20px)',
                  transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.06}s`,
                  padding: '14px 18px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8,
                  borderLeft: `3px solid ${typeColor(s.type)}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{s.part}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: typeColor(s.type),
                      padding: '2px 8px', background: `${typeColor(s.type)}12`,
                      borderRadius: 4,
                    }}>{s.type}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.suffix}</div>
                  <div style={{ fontSize: 12, color: '#ffaa44', fontWeight: 600 }}>{s.keyword}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Notes ═══ */}
      {build.notes && (
        <div style={{ padding: '40px 0 20px' }}>
          <div className="shimmer-line" style={{ maxWidth: 120, margin: '0 auto 40px' }} />
          <div className="build-reveal" style={{
            opacity: 0, transform: 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: 24,
            maxWidth: 700, margin: '0 auto',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 12 }}>NOTES</div>
            <div style={{ fontSize: 14, lineHeight: 2, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {build.notes}
            </div>
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
