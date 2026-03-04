'use client';

import { useState, useEffect, useCallback } from 'react';
import NavBar from '@/components/NavBar';
import HomePage from '@/components/HomePage';
import BuildsPage from '@/components/BuildsPage';
import MembersPage from '@/components/MembersPage';
import BlacklistPage from '@/components/BlacklistPage';
import TradePage from '@/components/TradePage';
import GuidePage from '@/components/GuidePage';
import NewsPage from '@/components/NewsPage';
import AboutPage from '@/components/AboutPage';
import AuthGate from '@/components/AuthGate';

const VALID_PAGES = ['home', 'news', 'about', 'builds', 'members', 'blacklist', 'trades', 'guides'];

function getPageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const p = params.get('page');
  return VALID_PAGES.includes(p) ? p : 'home';
}

export default function Page() {
  const [page, setPage] = useState('home');
  const [buildId, setBuildId] = useState(null);

  // URL → state 초기화
  useEffect(() => {
    const p = getPageFromUrl();
    setPage(p);
    const params = new URLSearchParams(window.location.search);
    const bid = params.get('id');
    if (p === 'builds' && bid) {
      setBuildId(Number(bid));
    }
  }, []);

  // pushState로 URL 업데이트하며 페이지 전환
  const navigate = useCallback((newPage) => {
    setPage(newPage);
    const url = newPage === 'home' ? '/' : `/?page=${newPage}`;
    window.history.pushState({ page: newPage }, '', url);
    window.scrollTo(0, 0);
  }, []);

  // 뒤로가기/앞으로가기 지원
  useEffect(() => {
    const handlePopState = (e) => {
      const p = e.state?.page || getPageFromUrl();
      setPage(p);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 'var(--z-navbar)' }}>
        <NavBar activePage={page} onNavigate={navigate} />
      </div>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '26px 24px 56px' }}>
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'news' && <NewsPage />}
        {page === 'builds' && <BuildsPage initialBuildId={buildId} />}
        {page === 'members' && <MembersPage />}
        {page === 'trades' && <AuthGate><TradePage /></AuthGate>}
        {page === 'guides' && <AuthGate><GuidePage /></AuthGate>}
        {page === 'blacklist' && <AuthGate><BlacklistPage /></AuthGate>}
        {page === 'about' && <AboutPage />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          WANDERLAND · 프로젝트 낙원 · Once Human · 제작: 춘영 · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
