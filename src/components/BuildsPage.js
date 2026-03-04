'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Icons } from './Icons';
import { Tag, Button } from './UI';
import { useApi } from '@/hooks/useApi';
import { useNicknames } from '@/hooks/useNicknames';
import BuildCreateForm from './BuildCreateForm';

const typeColor = (t) => t === '섬광' ? '#88ccff' : t === '클래식' ? '#ffcc44' : t === '신판' ? '#88ff88' : 'var(--text-secondary)';
const catColor = { '총기': '#ff6b6b', '원소': '#88ccff', '하이브리드': '#cc88ff' };
const categories = ['전체', '총기', '원소', '하이브리드'];
const weaponTypes = ['전체', '권총', '산탄총', '기관단총', '돌격소총', '저격소총', '경기관총', '석궁'];
const gradeColor = (g) => g === '전설' ? '#ffd700' : g === '영웅' ? '#cc88ff' : g === '희귀' ? '#4488ff' : 'var(--text-secondary)';

/* ── Sub-components ── */
function FloatingParticles() {
  return (
    <div className="bd-particles" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bd-particle" style={{
          left: `${15 + i * 14}%`,
          top: `${20 + (i % 3) * 25}%`,
          animationDelay: `${i * 1.2}s`,
          animationDuration: `${6 + i * 1.5}s`,
        }} />
      ))}
    </div>
  );
}

function StatCard({ icon, value, label, accent }) {
  return (
    <div className="bd-stat-card" style={{ '--stat-accent': accent }}>
      <div className="bd-stat-icon">{icon}</div>
      <div className="bd-stat-value">{value}</div>
      <div className="bd-stat-label">{label}</div>
    </div>
  );
}

function BuildCard({ build, index, onClick, liked, onLike, resolveNick }) {
  const gc = gradeColor(build.grade);
  return (
    <div className="bd-card fade-in" style={{ animationDelay: `${index * 0.04}s` }} onClick={onClick}>
      <div className="bd-card-glow" />
      {build.image ? (
        <div className="bd-card-image">
          <img src={build.image} alt="" />
          <div className="bd-card-image-overlay" />
        </div>
      ) : (
        <div className="bd-card-no-image">⚔</div>
      )}
      {build.grade && (
        <div className="bd-card-grade" style={{ '--grade-color': gc }}>{build.grade}</div>
      )}
      <div className="bd-card-body">
        <div className="bd-card-name">{build.name}</div>
        <div className="bd-card-meta">{resolveNick(build.discordId, build.author)} · {build.date}</div>
        <div className="bd-card-weapons">
          <div className="bd-card-weapon">
            <span className="bd-card-weapon-label">메인</span>
            <div className="bd-card-weapon-value">{build.mainWeapon}</div>
          </div>
          {build.subWeapon && (
            <div className="bd-card-weapon">
              <span className="bd-card-weapon-label">서브</span>
              <div className="bd-card-weapon-value">{build.subWeapon}</div>
            </div>
          )}
        </div>
        <div className="bd-card-tags">
          {build.category && <Tag color={catColor[build.category]}>{build.category}</Tag>}
          {build.weaponType && <Tag>{build.weaponType}</Tag>}
          {build.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
        <div className="bd-card-footer">
          <button
            className={`bd-like-btn${liked ? ' bd-like-btn--active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onLike?.(build.id); }}
            title={liked ? '좋아요 취소' : '좋아요'}
          >
            {liked ? '♥' : '♡'} {build.likes || 0}
          </button>
          <span className="bd-card-arrow">상세보기 →</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   빌드 상세 페이지 (Sticky Parallax)
   ═══════════════════════════════════════════ */
function BuildDetail({ build, onBack, canEdit, onEdit, onDelete, resolveNick }) {
  const containerRef = useRef(null);
  const [shareCopied, setShareCopied] = useState(false);

  const copyShareLink = () => {
    const url = `${window.location.origin}?page=builds&id=${build.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

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
              backdropFilter: 'blur(2px)',
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
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{resolveNick(build.discordId, build.author)}</div>
              <div style={{ marginTop: 2 }}>{build.date}</div>
            </div>
            <button
              onClick={copyShareLink}
              className="bd-share-btn"
              title="공유 링크 복사"
            >
              {shareCopied ? '✓' : <Icons.Share />}
              {shareCopied ? '복사됨!' : '공유'}
            </button>
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
            {build.subWeapon && (
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
            )}
          </div>

          {/* 튜닝 & 감염물 */}
          <div className="build-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s', marginTop: 36 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {build.tuning?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: '#88ccff', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 10 }}>튜닝설계도</div>
                  {build.tuning.map((t, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{t}</div>
                  ))}
                </div>
              )}
              {build.infections?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: '#cc88ff', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 10 }}>감염물</div>
                  {build.infections.map((x, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{x}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 도핑 */}
          {build.doping?.length > 0 && (
            <div className="build-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s', marginTop: 36 }}>
              <div style={{ fontSize: 10, color: '#44ff88', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 10 }}>도핑</div>
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

          {build.leather?.length > 0 && (
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
      {build.suffixes?.length > 0 && (
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
            {build.modules?.length > 0 && (
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

      {/* ═══ Edit / Delete ═══ */}
      {canEdit && (
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center',
          padding: '32px 0 16px', borderTop: '1px solid var(--border)', marginTop: 24,
        }}>
          <Button variant="secondary" onClick={onEdit}>
            <Icons.Edit /> 수정
          </Button>
          <Button variant="danger" onClick={onDelete}>
            <Icons.Trash /> 삭제
          </Button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   빌드 목록 페이지
   ═══════════════════════════════════════════ */
export default function BuildsPage({ initialBuildId }) {
  const { data: session } = useSession();
  const { data: builds, loading, mutate } = useApi('/api/builds');
  const resolveNick = useNicknames();
  const [sel, setSel] = useState(null);
  const [mode, setMode] = useState('list');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('전체');
  const [weaponFilter, setWeaponFilter] = useState('전체');
  const [editBuild, setEditBuild] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());

  // URL의 빌드 ID로 상세 페이지 자동 이동
  useEffect(() => {
    if (initialBuildId && builds?.length) {
      const target = builds.find((b) => b.id === initialBuildId);
      if (target) {
        setSel(target);
        setMode('detail');
      }
    }
  }, [initialBuildId, builds]);

  // 좋아요 목록 로드
  useEffect(() => {
    if (session?.discordId) {
      fetch('/api/build-likes').then((r) => r.json()).then((d) => {
        setLikedIds(new Set(d.ids || []));
      }).catch((e) => console.warn('[likes] load failed:', e));
    }
  }, [session?.discordId]);

  const handleLike = async (buildId) => {
    if (!session?.isMember) return;
    try {
      const res = await fetch(`/api/builds/${buildId}/like`, { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(buildId);
        else next.delete(buildId);
        return next;
      });
      mutate();
    } catch (e) { console.warn('[builds] like failed:', e); }
  };

  const checkOwner = (build) => {
    if (!session || !build) return false;
    if (session.isAdmin) return true;
    if (build.discordId && session.discordId) return build.discordId === session.discordId;
    if (!build.discordId && session.user?.name) return build.author === session.user.name;
    return false;
  };

  const stats = useMemo(() => {
    if (!builds) return { total: 0, authors: 0, recent: 0 };
    const authors = new Set(builds.map((b) => b.author));
    const now = new Date();
    const recent = builds.filter((b) => {
      if (!b.date) return false;
      const d = new Date(b.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return { total: builds.length, authors: authors.size, recent: recent.length };
  }, [builds]);

  /* 상세 페이지 */
  if (mode === 'detail' && sel) {
    return (
      <BuildDetail
        build={sel}
        onBack={() => { setSel(null); setMode('list'); }}
        canEdit={checkOwner(sel)}
        onEdit={() => { setEditBuild(sel); setMode('edit'); }}
        resolveNick={resolveNick}
        onDelete={async () => {
          try {
            await fetch(`/api/builds/${sel.id}`, { method: 'DELETE' });
            mutate();
          } catch (e) { console.warn('[builds] delete failed:', e); }
          setSel(null);
          setMode('list');
        }}
      />
    );
  }

  /* 수정 폼 */
  if (mode === 'edit' && editBuild) {
    return (
      <BuildCreateForm
        onBack={() => { setEditBuild(null); setMode('list'); }}
        onCreated={() => { mutate(); setEditBuild(null); setMode('list'); }}
        initialData={editBuild}
        editId={editBuild.id}
      />
    );
  }

  /* 작성 폼 */
  if (mode === 'create') {
    return <BuildCreateForm onBack={() => setMode('list')} onCreated={() => { mutate(); setMode('list'); }} />;
  }

  /* 로딩 */
  if (loading || !builds) {
    return (
      <div className="bd-loading">
        <div className="bd-loading-icon"><Icons.Build /></div>
        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', animation: 'pulse 1.5s ease-in-out infinite' }}>빌드 불러오는 중...</div>
      </div>
    );
  }

  /* 목록 필터링 */
  const filtered = builds.filter((b) => {
    const s = search.toLowerCase();
    const ms = !s || b.name?.toLowerCase().includes(s) || b.author?.toLowerCase().includes(s) || b.mainWeapon?.toLowerCase().includes(s) || (b.tags && b.tags.some((t) => t.toLowerCase().includes(s)));
    const mc = catFilter === '전체' || b.category === catFilter;
    const mw = weaponFilter === '전체' || b.weaponType === weaponFilter;
    return ms && mc && mw;
  });

  return (
    <div className="bd-page fade-in">
      {/* ═══ Hero ═══ */}
      <div className="bd-hero">
        <FloatingParticles />
        <div className="bd-hero-content">
          <div className="bd-hero-icon"><Icons.Build /></div>
          <div className="bd-hero-title">BUILDS</div>
          <div className="bd-hero-sub">장비 빌드 공유 · 최적의 세팅을 찾아보세요</div>
        </div>
        <div className="bd-hero-actions">
          {session?.isMember && (
            <Button onClick={() => setMode('create')}><Icons.Plus /> 빌드 작성</Button>
          )}
        </div>
      </div>

      {/* ═══ Stats ═══ */}
      <div className="bd-stats">
        <StatCard icon="⚔" value={stats.total} label="총 빌드" accent="#00d4ff" />
        <StatCard icon="👤" value={stats.authors} label="작성자" accent="#cc88ff" />
        <StatCard icon="📅" value={stats.recent} label="이번 달" accent="#ffaa44" />
      </div>

      {/* ═══ Search ═══ */}
      <div className="bd-search-wrap">
        <div className="bd-search-icon"><Icons.Search /></div>
        <input
          className="bd-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="무기, 작성자, 태그 검색..."
        />
      </div>

      {/* ═══ Filters ═══ */}
      <div className="bd-filters">
        <div className="bd-filter-group">
          <div className="bd-filter-label">대분류</div>
          <div className="bd-filter-pills">
            {categories.map((c) => (
              <button
                key={c}
                className={`bd-filter-pill${catFilter === c ? ' active' : ''}`}
                onClick={() => setCatFilter(c)}
                style={catFilter === c && catColor[c] ? { background: catColor[c], borderColor: catColor[c] } : catColor[c] ? { color: catColor[c] } : {}}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="bd-filter-group">
          <div className="bd-filter-label">무기 종류</div>
          <div className="bd-filter-pills">
            {weaponTypes.map((w) => (
              <button
                key={w}
                className={`bd-filter-pill${weaponFilter === w ? ' active' : ''}`}
                onClick={() => setWeaponFilter(w)}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Results ═══ */}
      <div className="bd-results">{filtered.length}개의 빌드</div>

      {/* ═══ Cards or Empty ═══ */}
      {filtered.length > 0 ? (
        <div className="bd-grid">
          {filtered.map((b, i) => (
            <BuildCard key={b.id} build={b} index={i} liked={likedIds.has(b.id)} onLike={handleLike} resolveNick={resolveNick} onClick={() => { setSel(b); setMode('detail'); }} />
          ))}
        </div>
      ) : (
        <div className="bd-empty">
          <div className="bd-empty-icon">⚔</div>
          <p>검색 결과가 없습니다</p>
          <span>다른 검색어나 필터를 시도해보세요</span>
        </div>
      )}
    </div>
  );
}
