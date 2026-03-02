'use client';

import { useState, useEffect } from 'react';
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

export default function Page() {
  const [page, setPage] = useState('home');
  const [buildId, setBuildId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('page');
    if (['home', 'news', 'about', 'builds', 'members', 'blacklist', 'trades', 'guides'].includes(p)) {
      setPage(p);
    }
    const bid = params.get('id');
    if (p === 'builds' && bid) {
      setBuildId(Number(bid));
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <NavBar activePage={page} onNavigate={setPage} />
      </div>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '26px 24px 56px' }}>
        {page === 'home' && <HomePage onNavigate={setPage} />}
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
