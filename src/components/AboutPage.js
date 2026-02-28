'use client';

import { useEffect, useRef } from 'react';

export default function AboutPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('about-reveal--visible');
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
    <div ref={containerRef} className="about-page">

      {/* ═══ HERO ═══ */}
      <div className="about-block about-block--hero">
        <div className="about-bg about-bg--hero">
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 4, padding: '0 20px' }}>
            <div className="about-label about-flicker">
              FIELD REPORT // WANDERLAND.GG
            </div>
            <h1 className="about-hero-title">
              WANDER<span>LAND</span>
            </h1>
            <div className="about-hero-sub">
              Once Human 커뮤니티 플랫폼
            </div>
            <div className="about-stamp">
              OPERATIONAL // EST. 2025.01
            </div>
          </div>
          <div className="about-scroll-indicator">
            <span>SCROLL</span>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 01: CALLSIGN ═══ */}
      <div className="about-block">
        <div className="about-bg">
          <div className="about-watermark">WANDER / LAND</div>
          <div className="about-bg-glow about-bg-glow--amber" />
        </div>
        <div className="about-content" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <div className="about-reveal">
            <div className="about-label">// SECTION 01 — CALLSIGN</div>
            <h2 className="about-heading">
              원더랜드가 아니다.
            </h2>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="about-terminal">
              <div className="about-terminal-line">CALLSIGN: WANDERLAND</div>
              <div className="about-terminal-line">ORIGIN: WANDER (방랑하다) + LAND (땅)</div>
              <div className="about-terminal-line">NOTE: NOT &quot;Wonderland&quot;</div>
            </div>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.2s', marginTop: 40 }}>
            <p className="about-body">
              떠돌던 사람들이 모여서 자리 잡은 곳.<br />
              그냥 그렇게 시작됐다.
            </p>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="about-data-row">
              <div className="about-data-item">
                <div className="about-data-key">STATUS</div>
                <div className="about-data-val" style={{ color: '#5aaa6e' }}>ACTIVE</div>
              </div>
              <div className="about-data-item">
                <div className="about-data-key">FREQ</div>
                <div className="about-data-val">WANDERLAND.GG</div>
              </div>
              <div className="about-data-item">
                <div className="about-data-key">TYPE</div>
                <div className="about-data-val">COMMUNITY HUB</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 02: SITREP ═══ */}
      <div className="about-block">
        <div className="about-bg">
          <div className="about-bg-glow about-bg-glow--amber" />
        </div>
        <div className="about-content" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <div className="about-reveal">
            <div className="about-label">// SECTION 02 — SITUATION REPORT</div>
            <h2 className="about-heading about-heading--amber">
              현황 보고
            </h2>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.1s', marginTop: 24 }}>
            <p className="about-body">
              Once Human 한국 커뮤니티 여러 개를<br />
              한 곳에서 관리하는 플랫폼.
            </p>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="about-data-row">
              <div className="about-data-item">
                <div className="about-data-key">ESTABLISHED</div>
                <div className="about-data-val">2025.01</div>
              </div>
              <div className="about-data-item">
                <div className="about-data-key">ORIGIN</div>
                <div className="about-data-val">낙원 하이브</div>
              </div>
              <div className="about-data-item">
                <div className="about-data-key">CURRENT</div>
                <div className="about-data-val">프로젝트 낙원</div>
              </div>
              <div className="about-data-item">
                <div className="about-data-key">PARTNER</div>
                <div className="about-data-val">나비클랜</div>
              </div>
            </div>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="about-terminal">
              <div className="about-terminal-line">빌드 DB — 장비 세팅 공유 및 검색</div>
              <div className="about-terminal-line">인터랙티브 맵 — 주요 좌표 기록</div>
              <div className="about-terminal-line">멤버 관리 — 다중 서버 통합</div>
              <div className="about-terminal-line">블랙리스트 — 주의 유저 공유</div>
              <div className="about-terminal-line">디스코드 봇 — 서버 내 데이터 검색</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 03: PARTNER ═══ */}
      <div className="about-block">
        <div className="about-bg">
          <div className="about-bg-glow about-bg-glow--blue" />
        </div>
        <div className="about-content" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <div className="about-reveal">
            <div className="about-label">// SECTION 03 — PARTNER</div>
            <h2 className="about-heading about-heading--blue">
              나비클랜
            </h2>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.1s', marginTop: 24 }}>
            <p className="about-body">
              프로젝트 낙원과 함께 운영 중인 파트너 클랜.<br />
              블랙리스트·빌드 데이터를 공유하고 있다.
            </p>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="about-data-row">
              <div className="about-data-item">
                <div className="about-data-key">CLAN</div>
                <div className="about-data-val">나비클랜</div>
              </div>
              <div className="about-data-item">
                <div className="about-data-key">STATUS</div>
                <div className="about-data-val" style={{ color: '#5aaa6e' }}>ACTIVE</div>
              </div>
              <div className="about-data-item">
                <div className="about-data-key">RELATION</div>
                <div className="about-data-val">PARTNER</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 04: PROTOCOL ═══ */}
      <div className="about-block">
        <div className="about-bg">
          <div className="about-bg-glow about-bg-glow--green" />
        </div>
        <div className="about-content" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <div className="about-reveal">
            <div className="about-label">// SECTION 04 — OPERATING PROTOCOL</div>
            <h2 className="about-heading about-heading--green">
              운영 규약
            </h2>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.15s', marginTop: 32 }}>
            <div className="about-protocol">
              <div className="about-protocol-header">
                <span className="about-protocol-num">PROTOCOL-01</span>
                <span className="about-protocol-title">자유 행동</span>
              </div>
              <p className="about-protocol-desc">
                플레이 방식은 자유. 솔로든 파티든 상관없다.
              </p>
            </div>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="about-protocol">
              <div className="about-protocol-header">
                <span className="about-protocol-num">PROTOCOL-02</span>
                <span className="about-protocol-title">정보 공유</span>
              </div>
              <p className="about-protocol-desc">
                아는 정보는 공유한다. 빌드, 공략, 좌표 등.
              </p>
            </div>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.45s' }}>
            <div className="about-protocol">
              <div className="about-protocol-header">
                <span className="about-protocol-num">PROTOCOL-03</span>
                <span className="about-protocol-title">기본 매너</span>
              </div>
              <p className="about-protocol-desc">
                서로 불쾌하지 않게. 그게 전부다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SIGN-OFF ═══ */}
      <div className="about-block about-block--signoff">
        <div className="about-content" style={{ textAlign: 'center' }}>
          <div className="about-reveal">
            <div className="about-divider" style={{ marginBottom: 40 }} />
            <div className="about-label">// END OF REPORT</div>
            <p style={{
              fontSize: 16,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 2,
              marginTop: 16,
            }}>
              wanderland.gg
            </p>
            <span className="about-blink" />
          </div>
        </div>
      </div>
    </div>
  );
}
