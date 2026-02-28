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
              생존자 네트워크 — 프로젝트 낙원
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
        <div className="about-content" style={{ paddingTop: 80, paddingBottom: 120 }}>
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
              Stardust가 뒤덮은 세계에 동화는 없다.<br />
              정처 없이 떠돌던 생존자들이 거점을 잡은 곳이다.
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
                <div className="about-data-val">SURVIVOR NETWORK</div>
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
        <div className="about-content" style={{ paddingTop: 80, paddingBottom: 120 }}>
          <div className="about-reveal">
            <div className="about-label">// SECTION 02 — SITUATION REPORT</div>
            <h2 className="about-heading about-heading--amber">
              현황 보고
            </h2>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.1s', marginTop: 24 }}>
            <p className="about-body">
              Once Human 내 다수의 커뮤니티가<br />
              하나의 네트워크로 연결된 플랫폼.
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
                <div className="about-data-key">FUNCTION</div>
                <div className="about-data-val">MULTI-GUILD HUB</div>
              </div>
            </div>
          </div>

          <div className="about-reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="about-terminal">
              <div className="about-terminal-line">빌드 데이터베이스 — 장비 세팅 공유 및 검색</div>
              <div className="about-terminal-line">인터랙티브 맵 — 게임 내 주요 좌표 기록</div>
              <div className="about-terminal-line">멤버 네트워크 — 다중 서버 통합 관리</div>
              <div className="about-terminal-line">블랙리스트 — 추방 기록 공개 데이터</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 03: PROTOCOL ═══ */}
      <div className="about-block">
        <div className="about-bg">
          <div className="about-bg-glow about-bg-glow--green" />
        </div>
        <div className="about-content" style={{ paddingTop: 80, paddingBottom: 120 }}>
          <div className="about-reveal">
            <div className="about-label">// SECTION 03 — OPERATING PROTOCOL</div>
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
                각자 알아서 플레이한다. 정해진 방식 없다.<br />
                솔로든 파티든, 본인이 편한 대로.
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
                알게 된 건 공유한다. 혼자 쌓아두지 않는다.<br />
                빌드, 공략, 좌표 — 다 올려라.
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
                서로 기분 나쁘지 않게. 그것만 지키면 된다.<br />
                나머지는 알아서 굴러간다.
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
              주파수 유지. 생존 계속.
            </p>
            <span className="about-blink" />
          </div>
        </div>
      </div>
    </div>
  );
}
