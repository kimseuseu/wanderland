'use client';

import { useState, useMemo } from 'react';
import { Icons } from './Icons';
import { Modal, Input, TextArea, Button } from './UI';
import { useSession } from 'next-auth/react';
import { useApi } from '@/hooks/useApi';

/* ────────── Inline SVG Icons ────────── */
const SkullIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
    <path d="M8 20v-4a8 8 0 1 1 8 0v4" /><path d="M12 20v-2" /><path d="M8 20h8" />
  </svg>
);
const AlertIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const CalendarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const UserIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const ImageIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);
const ClipboardIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" />
  </svg>
);
const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
);

/* ────────── Floating Particles Background ────────── */
function FloatingParticles() {
  return (
    <div className="bl-particles" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bl-particle" style={{
          left: `${15 + i * 14}%`,
          animationDelay: `${i * 1.2}s`,
          animationDuration: `${6 + i * 1.5}s`,
        }} />
      ))}
    </div>
  );
}

/* ────────── Stat Card ────────── */
function StatCard({ icon, value, label, accent }) {
  return (
    <div className="bl-stat-card" style={{ '--stat-accent': accent }}>
      <div className="bl-stat-icon">{icon}</div>
      <div className="bl-stat-value">{value}</div>
      <div className="bl-stat-label">{label}</div>
    </div>
  );
}

/* ────────── Blacklist Entry Card ────────── */
function EntryCard({ item, index, onClick }) {
  const initial = (item.name || '?')[0].toUpperCase();
  return (
    <div className="bl-card fade-in" style={{ animationDelay: `${index * 0.06}s` }} onClick={onClick}>
      <div className="bl-card-glow" />
      <div className="bl-card-header">
        <div className="bl-card-avatar">
          <span>{initial}</span>
          <div className="bl-card-avatar-ring" />
        </div>
        <div className="bl-card-identity">
          <div className="bl-card-name">{item.name}</div>
          {item.uuid && <div className="bl-card-uuid">{item.uuid}</div>}
        </div>
        <ChevronIcon />
      </div>

      <div className="bl-card-body">
        {item.clan && (
          <div className="bl-card-tag">
            <Icons.Shield /> {item.clan}
          </div>
        )}
        {item.alts && (
          <div className="bl-card-tag bl-card-tag--alt">
            <Icons.Users /> {item.alts}
          </div>
        )}
      </div>

      {item.incident && (
        <div className="bl-card-incident">
          {item.incident.length > 60 ? item.incident.slice(0, 60) + '...' : item.incident}
        </div>
      )}

      <div className="bl-card-footer">
        <span className="bl-card-date"><CalendarIcon /> {item.date}</span>
        {item.image && <span className="bl-card-has-image"><ImageIcon /> 증거</span>}
      </div>
    </div>
  );
}

/* ────────── Main Component ────────── */
export default function BlacklistPage() {
  const { data: session } = useSession();
  const { data: list, loading, mutate } = useApi('/api/blacklist');
  const [showAdd, setShowAdd] = useState(false);
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', uuid: '', alts: '', clan: '', incident: '' });

  const items = list || [];
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((b) =>
      (b.name || '').toLowerCase().includes(q) ||
      (b.uuid || '').toLowerCase().includes(q) ||
      (b.alts || '').toLowerCase().includes(q) ||
      (b.clan || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const clans = new Set(items.filter(i => i.clan).map(i => i.clan));
    const thisMonth = items.filter(i => {
      if (!i.date) return false;
      const d = new Date(i.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return { total: items.length, clans: clans.size, recent: thisMonth.length };
  }, [items]);

  const add = async () => {
    if (!form.name) return;
    try {
      await fetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, reporter: session?.user?.name || '익명' }),
      });
      mutate();
    } catch (e) { console.error(e); }
    setShowAdd(false);
    setForm({ name: '', uuid: '', alts: '', clan: '', incident: '' });
  };

  const remove = async (id) => {
    try {
      await fetch(`/api/blacklist/${id}`, { method: 'DELETE' });
      mutate();
    } catch (e) { console.error(e); }
    setSel(null);
  };

  if (loading) {
    return (
      <div className="bl-loading">
        <div className="bl-loading-skull"><SkullIcon size={32} /></div>
        <span>데이터를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="bl-page fade-in">
      {/* Hero Header */}
      <div className="bl-hero">
        <FloatingParticles />
        <div className="bl-hero-content">
          <div className="bl-hero-icon">
            <SkullIcon size={28} />
          </div>
          <div>
            <h2 className="bl-hero-title">BLACKLIST</h2>
            <p className="bl-hero-sub">낙원에서 추방된 자들의 기록</p>
          </div>
        </div>
        <Button variant="danger" onClick={() => setShowAdd(true)} style={{ position: 'relative', zIndex: 2 }}>
          <Icons.Plus /> 유저 등록
        </Button>
      </div>

      {/* Stats Row */}
      <div className="bl-stats">
        <StatCard icon={<SkullIcon size={18} />} value={stats.total} label="등록된 유저" accent="#ff4444" />
        <StatCard icon={<Icons.Shield />} value={stats.clans} label="관련 클랜" accent="#ff6b35" />
        <StatCard icon={<AlertIcon />} value={stats.recent} label="이번 달" accent="#ffaa44" />
      </div>

      {/* Search */}
      <div className="bl-search-wrap">
        <div className="bl-search-icon"><Icons.Search /></div>
        <input
          className="bl-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름, UUID, 부캐, 소속으로 검색..."
        />
        {search && (
          <button className="bl-search-clear" onClick={() => setSearch('')}>
            <Icons.X />
          </button>
        )}
      </div>

      {/* Results Count */}
      {search && (
        <div className="bl-results-count fade-in">
          <AlertIcon size={14} />
          <span><strong>{filtered.length}</strong>건의 검색 결과</span>
        </div>
      )}

      {/* Card Grid */}
      <div className="bl-grid">
        {filtered.map((item, i) => (
          <EntryCard key={item.id} item={item} index={i} onClick={() => setSel(item)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bl-empty fade-in">
          <div className="bl-empty-icon"><Icons.Search /></div>
          <p>검색 결과가 없습니다</p>
          <span>다른 키워드로 다시 검색해보세요</span>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!sel} onClose={() => setSel(null)} title="블랙리스트 상세">
        {sel && (
          <div className="bl-detail">
            <div className="bl-detail-banner">
              <div className="bl-detail-avatar">
                <span>{(sel.name || '?')[0].toUpperCase()}</span>
              </div>
              <h3 className="bl-detail-name">{sel.name}</h3>
              {sel.uuid && (
                <div className="bl-detail-uuid">
                  <ClipboardIcon /> {sel.uuid}
                </div>
              )}
            </div>

            <div className="bl-detail-grid">
              <div className="bl-detail-cell">
                <div className="bl-detail-cell-icon"><Icons.Users /></div>
                <div>
                  <div className="bl-detail-cell-label">부캐</div>
                  <div className="bl-detail-cell-value">{sel.alts || '정보 없음'}</div>
                </div>
              </div>
              <div className="bl-detail-cell">
                <div className="bl-detail-cell-icon"><Icons.Shield /></div>
                <div>
                  <div className="bl-detail-cell-label">소속 클랜</div>
                  <div className="bl-detail-cell-value">{sel.clan || '무소속'}</div>
                </div>
              </div>
              <div className="bl-detail-cell">
                <div className="bl-detail-cell-icon"><CalendarIcon /></div>
                <div>
                  <div className="bl-detail-cell-label">등록일</div>
                  <div className="bl-detail-cell-value">{sel.date || '-'}</div>
                </div>
              </div>
              <div className="bl-detail-cell">
                <div className="bl-detail-cell-icon"><UserIcon /></div>
                <div>
                  <div className="bl-detail-cell-label">신고자</div>
                  <div className="bl-detail-cell-value">{sel.reporter || '익명'}</div>
                </div>
              </div>
            </div>

            <div className="bl-detail-section">
              <div className="bl-detail-section-title">
                <AlertIcon /> 사건 개요
              </div>
              <div className="bl-detail-incident">
                {sel.incident || '기록된 내용이 없습니다.'}
              </div>
            </div>

            {sel.image && (
              <div className="bl-detail-section">
                <div className="bl-detail-section-title">
                  <ImageIcon /> 증거 스크린샷
                </div>
                <div className="bl-detail-image-wrap">
                  <img src={sel.image} alt="증거 이미지" className="bl-detail-image" />
                </div>
              </div>
            )}

            <div className="bl-detail-actions">
              <Button variant="secondary" onClick={() => setSel(null)}>닫기</Button>
              <Button variant="danger" onClick={() => remove(sel.id)}>
                <Icons.Trash /> 삭제
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="블랙리스트 등록">
        <div className="bl-add-form">
          <div className="bl-add-form-header">
            <div className="bl-add-form-icon"><SkullIcon size={24} /></div>
            <p>새로운 블랙리스트 유저를 등록합니다</p>
          </div>
          <Input label="닉네임 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="게임 내 닉네임" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="UUID" value={form.uuid} onChange={(e) => setForm({ ...form, uuid: e.target.value })} placeholder="OH-XXXXX-KR" />
            <Input label="소속 하이브" value={form.clan} onChange={(e) => setForm({ ...form, clan: e.target.value })} placeholder="하이브명" />
          </div>
          <Input label="부캐" value={form.alts} onChange={(e) => setForm({ ...form, alts: e.target.value })} placeholder="쉼표로 구분 (선택)" />
          <TextArea label="사건 개요 *" value={form.incident} onChange={(e) => setForm({ ...form, incident: e.target.value })} placeholder="어떤 사건이 있었는지 자세히 기록해주세요..." />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>취소</Button>
            <Button variant="danger" onClick={add}>등록</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
