'use client';

import { useEffect, useRef } from 'react';
import { MEMBERS } from '@/data';

const sections = [
  {
    id: 'origin',
    label: '01',
    title: 'Wonderland가\n아닌,',
    highlight: 'Wanderland',
    accent: '#ffaa44',
  },
  {
    id: 'meaning',
    label: '02',
    title: '이름의',
    highlight: '의미',
    accent: '#ffaa44',
  },
  {
    id: 'hive',
    label: '03',
    title: '낙원',
    highlight: '하이브',
    accent: '#6488ff',
  },
  {
    id: 'creed',
    label: '04',
    title: '우리의',
    highlight: '신조',
    accent: '#44ff88',
  },
];

export default function AboutPage() {
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
      { threshold: 0.15 }
    );

    const els = containerRef.current?.querySelectorAll('.about-reveal');
    els?.forEach((el) => observer.observe(el));
    return () => els?.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div ref={containerRef} style={{ marginTop: -26 }}>

      {/* ═══ HERO ═══ */}
      <div style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        position: 'relative', padding: '60px 20px',
      }}>
        <div className="hero-glow" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 24,
          }}>
            ABOUT
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 900,
            fontFamily: 'var(--font-display)', lineHeight: 1.1, marginBottom: 20,
          }}>
            <span style={{ color: 'var(--text-primary)' }}>WANDER</span>
            <span style={{ color: '#ffaa44' }}>LAND</span>
          </h1>
          <p style={{
            fontSize: 15, color: 'var(--text-muted)', letterSpacing: '0.15em',
            fontFamily: 'var(--font-display)',
          }}>
            방랑자들의 낙원
          </p>
        </div>

        {/* scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em' }}>
            SCROLL
          </div>
          <div style={{ width: 1, height: 28, background: 'var(--border)', animation: 'pulse 2s ease-in-out infinite' }} />
        </div>
      </div>

      {/* ═══ SECTION 1: Origin ═══ */}
      <div className="about-section" style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
        {/* Sticky left */}
        <div className="about-sticky-left" style={{
          position: 'sticky', top: 48, height: 'fit-content',
          width: '40%', paddingTop: '20vh', paddingLeft: 20, flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, color: '#ffaa44', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>01</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
            Wonderland가<br />아닌,
          </h2>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2, color: '#ffaa44' }}>
            Wanderland
          </h2>
        </div>

        {/* Scrolling right */}
        <div style={{ flex: 1, paddingTop: '22vh', paddingBottom: '20vh', paddingRight: 20, paddingLeft: 40 }}>
          <div className="about-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 2, fontWeight: 400 }}>
              문명이 무너진 세계에<br />
              동화 속 <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>원더랜드</span>는 없다.
            </p>
          </div>

          <div className="about-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s', marginTop: 48 }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{
                padding: '20px 24px', background: 'rgba(255,170,68,0.04)',
                border: '1px solid rgba(255,170,68,0.12)', borderRadius: 12,
                flex: '1 1 140px',
              }}>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#ffaa44' }}>Wander</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>방랑하다</div>
              </div>
              <div style={{
                padding: '20px 24px', background: 'rgba(255,170,68,0.04)',
                border: '1px solid rgba(255,170,68,0.12)', borderRadius: 12,
                flex: '1 1 140px',
              }}>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#ffaa44' }}>Land</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>땅, 영역</div>
              </div>
            </div>
          </div>

          <div className="about-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s', marginTop: 48 }}>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 2.2 }}>
              정처 없이 떠도는 방랑자들이<br />
              마침내 뿌리를 내린 곳.
            </p>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 2.2, marginTop: 16 }}>
              종말 이후의 황무지에서 서로를 발견하고,<br />
              함께 일어서기로 한 자들의 거점.
            </p>
          </div>

          <div className="about-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.45s', marginTop: 56 }}>
            <div style={{
              borderLeft: '2px solid rgba(255,170,68,0.3)', paddingLeft: 20,
            }}>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.8 }}>
                "완벽한 낙원은 아니지만,<br />
                우리가 만들어가는 낙원."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Divider ═══ */}
      <div className="shimmer-line" style={{ maxWidth: 120, margin: '0 auto' }} />

      {/* ═══ SECTION 2: Meaning ═══ */}
      <div className="about-section" style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
        <div className="about-sticky-left" style={{
          position: 'sticky', top: 48, height: 'fit-content',
          width: '40%', paddingTop: '20vh', paddingLeft: 20, flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, color: '#ffaa44', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>02</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
            낙원
          </h2>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2, color: '#6488ff' }}>
            하이브
          </h2>
        </div>

        <div style={{ flex: 1, paddingTop: '22vh', paddingBottom: '20vh', paddingRight: 20, paddingLeft: 40 }}>
          <div className="about-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 2.2 }}>
              Once Human의{' '}
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>혹독한 겨울</span>{' '}
              시나리오에서<br />활동하는 하이브.
            </p>
          </div>

          <div className="about-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s', marginTop: 40 }}>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 2.2 }}>
              2025년 1월, 간편과 춘영이 세운<br />
              작은 거점에서 시작해<br />
              지금은 <span style={{ color: '#6488ff', fontWeight: 700, fontSize: 20 }}>{MEMBERS.length}명</span>의 하이브원이 함께하고 있다.
            </p>
          </div>

          <div className="about-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s', marginTop: 40 }}>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 2.2 }}>
              엔드게임 공략부터 빌드 연구, 자원 확보까지 —<br />
              각자의 강점을 살려 하이브를 운영하고 있다.
            </p>
          </div>

          <div className="about-reveal" style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.45s', marginTop: 48 }}>
            <div style={{
              padding: '20px 24px', background: 'rgba(100,136,255,0.04)',
              border: '1px solid rgba(100,136,255,0.12)', borderRadius: 12,
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                WANDERLAND.GG
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                이 웹사이트는 하이브원들의 빌드 정보를 한눈에 모아보고,
                게임 내 유용한 위치 정보를 공유하며,
                함께 성장하기 위해 만들어졌다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Divider ═══ */}
      <div className="shimmer-line" style={{ maxWidth: 120, margin: '0 auto' }} />

      {/* ═══ SECTION 3: Creed ═══ */}
      <div className="about-section" style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
        <div className="about-sticky-left" style={{
          position: 'sticky', top: 48, height: 'fit-content',
          width: '40%', paddingTop: '20vh', paddingLeft: 20, flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, color: '#44ff88', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>03</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
            우리의
          </h2>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2, color: '#44ff88' }}>
            신조
          </h2>
        </div>

        <div style={{ flex: 1, paddingTop: '22vh', paddingBottom: '20vh', paddingRight: 20, paddingLeft: 40 }}>
          {[
            { num: 'I', title: '자유로운 방랑', desc: '정해진 길은 없다.\n각자의 플레이스타일을 존중하고,\n함께 더 먼 곳을 탐험한다.', color: '#ffaa44' },
            { num: 'II', title: '정보의 공유', desc: '혼자 알면 지식, 함께 나누면 전력.\n빌드와 공략을 아낌없이 공유한다.', color: '#6488ff' },
            { num: 'III', title: '신뢰와 결속', desc: '하이브원은 곧 전우.\n서로의 등을 지키며\n종말의 세계를 함께 걸어간다.', color: '#44ff88' },
          ].map((creed, i) => (
            <div
              key={i}
              className="about-reveal"
              style={{
                opacity: 0, transform: 'translateY(40px)',
                transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.2}s`,
                marginBottom: i < 2 ? 48 : 0,
                paddingBottom: i < 2 ? 48 : 0,
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 12 }}>
                <span style={{
                  fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-display)',
                  color: creed.color, opacity: 0.4, lineHeight: 1,
                }}>
                  {creed.num}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  {creed.title}
                </h3>
              </div>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 2, whiteSpace: 'pre-line', paddingLeft: 40 }}>
                {creed.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Footer Quote ═══ */}
      <div style={{
        minHeight: '40vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '60px 20px',
      }}>
        <div className="shimmer-line" style={{ width: 40, marginBottom: 32 }} />
        <p className="about-reveal" style={{
          opacity: 0, transform: 'translateY(20px)',
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
          fontSize: 18, color: 'var(--text-muted)', lineHeight: 2,
          fontStyle: 'italic', fontFamily: 'var(--font-display)',
          fontWeight: 300,
        }}>
          "종말은 끝이 아니다.<br />방랑의 시작이다."
        </p>
        <p style={{
          fontSize: 11, color: 'var(--text-muted)', marginTop: 16,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', opacity: 0.4,
        }}>
          — WANDERLAND
        </p>
      </div>
    </div>
  );
}
