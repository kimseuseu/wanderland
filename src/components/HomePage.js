'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from './Icons';

function formatDate(unix) {
  const d = new Date(unix * 1000);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}일 전`;
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function HomePage({ onNavigate }) {
  const [counts, setCounts] = useState({ members: 0, builds: 0 });
  const [news, setNews] = useState([]);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch('/api/member-count').then((r) => r.ok ? r.json() : { count: 0 }),
      fetch('/api/builds').then((r) => r.ok ? r.json() : []),
    ]).then(([mc, b]) => {
      setCounts({ members: mc.count || 0, builds: b.length || 0 });
    }).catch((e) => console.warn('[home] stats load failed:', e));

    fetch('/api/news')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setNews(data.slice(0, 4)))
      .catch((e) => console.warn('[home] news load failed:', e));
  }, []);

  const go = (page, href) => href ? router.push(href) : onNavigate(page);

  return (
    <div className="hp">
      {/* Hero */}
      <header className="hp-hero">
        <img src="/images/logo.png" alt="Wanderland" className="hp-logo" />
        <p className="hp-desc">Once Human 커뮤니티</p>
        <div className="hp-stats">
          <span><strong>{counts.members}</strong> 멤버</span>
          <span className="hp-stats-dot" />
          <span><strong>{counts.builds}</strong> 빌드</span>
        </div>
      </header>

      {/* Quick nav */}
      <section className="hp-nav">
        <div className="hp-nav-row">
          <button className="hp-link" onClick={() => go('builds')}>
            <Icons.Build />빌드
          </button>
          <button className="hp-link" onClick={() => go('map', '/map')}>
            <Icons.Map />지도
          </button>
          <button className="hp-link" onClick={() => go('trades')}>
            <Icons.Trade />거래소
          </button>
          <button className="hp-link" onClick={() => go('guides')}>
            <Icons.Guide />가이드
          </button>
          <button className="hp-link" onClick={() => go('members')}>
            <Icons.Users />멤버
          </button>
          <button className="hp-link" onClick={() => go('blacklist')}>
            <Icons.Ban />블랙리스트
          </button>
        </div>
      </section>

      {/* News */}
      {news.length > 0 && (
        <section className="hp-news">
          <div className="hp-section-head">
            <h2>최신 소식</h2>
            <button onClick={() => onNavigate('news')}>전체보기</button>
          </div>
          <div className="hp-news-list">
            {news.map((item, i) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`hp-news-item ${i === 0 ? 'hp-news-featured' : ''}`}
              >
                {item.image && <img src={item.image} alt="" className="hp-news-img" loading="lazy" />}
                <div className="hp-news-body">
                  <time>{formatDate(item.date)}</time>
                  <h3>{item.titleKo || item.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <footer className="hp-footer">
        <span>제작: 춘영</span>
      </footer>
    </div>
  );
}
