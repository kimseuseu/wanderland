'use client';

import { useState, useEffect, useCallback } from 'react';

const FEED_LABELS = {
  'community announcements': { label: '공지', color: '#ff6b6b' },
  'community_announcements': { label: '공지', color: '#ff6b6b' },
  'steam_community_blog': { label: '블로그', color: '#66bbff' },
  'steam_community': { label: '커뮤니티', color: '#88cc66' },
};

function getFeedLabel(feedLabel) {
  if (!feedLabel) return null;
  return FEED_LABELS[feedLabel] || FEED_LABELS[feedLabel.toLowerCase()] || null;
}

function formatDate(unix) {
  const d = new Date(unix * 1000);
  const now = new Date();
  const diff = now - d;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}일 전`;
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [translated, setTranslated] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNews = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => {
        setNews(data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch((e) => { console.warn('[news] load failed:', e); setLoading(false); });
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const filtered = filter === 'all'
    ? news
    : news.filter((n) => n.feedLabel === filter);

  const feedTypes = [...new Set(news.map((n) => n.feedLabel))];

  if (loading) {
    return (
      <div className="news-loading">
        <div className="news-loading-spinner" />
        <span>Steam 뉴스를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="news-header">
        <div className="news-title-row">
          <h2 className="news-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: 8 }}>
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
            공식 뉴스
          </h2>
          <div className="news-header-right">
            <button
              className={`news-translate-btn ${translated ? 'active' : ''}`}
              onClick={() => setTranslated(!translated)}
              title={translated ? '원문 보기' : '번역 보기'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2v3" />
                <path d="M22 22l-5-10-5 10" /><path d="M14 18h6" />
              </svg>
              {translated ? '한국어' : 'EN'}
            </button>
            <span className="news-source">Steam · Once Human</span>
          </div>
        </div>
        <div className="news-filters-row">
          <div className="news-filters">
            <button
              className={`news-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >전체</button>
            {feedTypes.map((ft) => (
              <button
                key={ft}
                className={`news-filter-btn ${filter === ft ? 'active' : ''}`}
                onClick={() => setFilter(ft)}
                style={filter === ft ? { borderColor: getFeedLabel(ft)?.color || '#888' } : {}}
              >
                {getFeedLabel(ft)?.label || ft}
              </button>
            ))}
          </div>
          {lastUpdated && (
            <span className="news-updated">
              자동 갱신 · {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="news-empty">뉴스가 없습니다.</div>
      ) : (
        <div className="news-grid">
          {filtered.map((item) => {
            const label = getFeedLabel(item.feedLabel);
            const title = translated && item.titleKo ? item.titleKo : item.title;
            const desc = translated && item.contentsKo ? item.contentsKo : item.contents;
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card"
              >
                {item.image && (
                  <div className="news-card-image">
                    <img src={item.image} alt="" loading="lazy" />
                  </div>
                )}
                <div className="news-card-body">
                  <div className="news-card-meta">
                    {label && (
                      <span className="news-card-tag" style={{ color: label.color, borderColor: label.color + '44' }}>
                        {label.label}
                      </span>
                    )}
                    <span className="news-card-date">{formatDate(item.date)}</span>
                  </div>
                  <h3 className="news-card-title">{title}</h3>
                  {desc && <p className="news-card-desc">{desc}</p>}
                  <div className="news-card-footer">
                    <span className="news-card-author">{item.author || 'Once Human'}</span>
                    <span className="news-card-link">
                      Steam에서 보기 →
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
