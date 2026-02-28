'use client';

import { useState, useEffect } from 'react';
import { Icons } from './Icons';

export default function MembersPage() {
  const [guilds, setGuilds] = useState([]);
  const [activeGuild, setActiveGuild] = useState(null);
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState(null);

  // 서버 목록 로드
  useEffect(() => {
    fetch('/api/discord-members?action=guilds')
      .then((r) => {
        if (r.status === 401) throw new Error('unauthorized');
        if (!r.ok) throw new Error('fetch_error');
        return r.json();
      })
      .then((data) => {
        setGuilds(data);
        if (data.length > 0) {
          setActiveGuild(data[0].id);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message === 'unauthorized' ? 'unauthorized' : 'error');
        setLoading(false);
      });
  }, []);

  // 선택된 서버 멤버 로드
  useEffect(() => {
    if (!activeGuild) return;
    setMembersLoading(true);
    fetch(`/api/discord-members?action=members&guildId=${activeGuild}`)
      .then((r) => {
        if (!r.ok) throw new Error('fetch_error');
        return r.json();
      })
      .then((data) => {
        setMembers(data.members || []);
        setRoles(data.roles || []);
        setMembersLoading(false);
      })
      .catch(() => {
        setMembers([]);
        setRoles([]);
        setMembersLoading(false);
      });
  }, [activeGuild]);

  const activeGuildInfo = guilds.find((g) => g.id === activeGuild);

  const filtered = members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.displayName.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q)
    );
  });

  // 초기 로딩
  if (loading) {
    return (
      <div className="mb-loading fade-in">
        <div className="mb-loading-spinner" />
        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          서버 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  // 인증 에러
  if (error === 'unauthorized') {
    return (
      <div className="mb-empty fade-in">
        <div className="mb-empty-icon"><Icons.Users /></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          로그인이 필요합니다.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
          Discord 계정으로 로그인하면 멤버 목록을 볼 수 있습니다.
        </p>
      </div>
    );
  }

  // 기타 에러
  if (error) {
    return (
      <div className="mb-empty fade-in">
        <div className="mb-empty-icon"><Icons.Users /></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          멤버 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  // 서버 없음
  if (guilds.length === 0) {
    return (
      <div className="mb-empty fade-in">
        <div className="mb-empty-icon"><Icons.Users /></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          봇이 참여한 서버가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="mb-hero">
        <div className="mb-hero-content">
          <div className="mb-hero-icon">
            <Icons.Users />
          </div>
          <div>
            <h2 className="mb-hero-title">멤버</h2>
            <p className="mb-hero-sub">
              {activeGuildInfo?.name || '서버'} 기준
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div className="mb-hero-count">
              {membersLoading ? '—' : filtered.length}
            </div>
            <p className="mb-hero-sub">명</p>
          </div>
        </div>
      </div>

      {/* Server Tabs */}
      {guilds.length > 1 && (
        <div className="mb-tabs-wrap">
          <div className="mb-tabs">
            {guilds.map((g) => (
              <button
                key={g.id}
                className={`mb-tab${activeGuild === g.id ? ' mb-tab--active' : ''}`}
                onClick={() => {
                  if (activeGuild !== g.id) {
                    setActiveGuild(g.id);
                    setSearch('');
                  }
                }}
              >
                {g.icon ? (
                  <img src={g.icon} alt="" className="mb-tab-icon" />
                ) : (
                  <div className="mb-tab-icon mb-tab-icon--default">
                    {g.name[0]}
                  </div>
                )}
                <span className="mb-tab-name">{g.name}</span>
                <span className="mb-tab-count">{g.memberCount}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-search-wrap">
        <div className="mb-search-icon"><Icons.Search /></div>
        <input
          className="mb-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="멤버 검색..."
        />
        {search && (
          <button className="mb-search-clear" onClick={() => setSearch('')}>
            ✕
          </button>
        )}
      </div>

      {/* Members Grid */}
      {membersLoading ? (
        <div className="mb-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="mb-card mb-skeleton" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="mb-card-header">
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-tertiary)' }} />
                <div className="mb-card-info">
                  <div style={{ width: '60%', height: 14, background: 'var(--bg-tertiary)', borderRadius: 4 }} />
                  <div style={{ width: '40%', height: 10, background: 'var(--bg-tertiary)', borderRadius: 4, marginTop: 6 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mb-empty">
          <div className="mb-empty-icon"><Icons.Search /></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {search ? `"${search}" 검색 결과가 없습니다.` : '멤버가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="mb-grid">
          {filtered.map((m, i) => (
            <div
              key={m.id}
              className="mb-card fade-in"
              style={{ animationDelay: `${i * 0.02}s` }}
            >
              <div className="mb-card-header">
                {m.avatar ? (
                  <img src={m.avatar} alt="" className="mb-card-avatar" />
                ) : (
                  <div
                    className="mb-card-avatar--default"
                    style={{
                      background: m.roles[0]?.color
                        ? `${m.roles[0].color}18`
                        : 'var(--bg-tertiary)',
                      color: m.roles[0]?.color || 'var(--text-muted)',
                    }}
                  >
                    {m.displayName[0]?.toUpperCase()}
                  </div>
                )}
                <div className="mb-card-info">
                  <div className="mb-card-name">{m.displayName}</div>
                  {m.roles.length > 0 && (
                    <span
                      className="mb-card-role"
                      style={{
                        '--role-color': m.roles[0].color || 'var(--text-muted)',
                      }}
                    >
                      {m.roles[0].name}
                    </span>
                  )}
                </div>
              </div>
              {m.joinedAt && (
                <div className="mb-card-date">
                  가입: {new Date(m.joinedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
