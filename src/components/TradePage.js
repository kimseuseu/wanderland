'use client';

import { useState, useMemo } from 'react';
import { Icons } from './Icons';
import { Input, TextArea, Button, Modal } from './UI';
import { useSession } from 'next-auth/react';
import { useApi } from '@/hooks/useApi';
import { useNicknames } from '@/hooks/useNicknames';
import { upload } from '@vercel/blob/client';

/* ── Icons ── */
const TagIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const PackageIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const GiftIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </svg>
);
const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TYPE_CONFIG = {
  sell: { label: '판매', color: '#44ff88', bg: 'rgba(68,255,136,0.1)' },
  buy: { label: '구매', color: '#66bbff', bg: 'rgba(102,187,255,0.1)' },
  share: { label: '나눔', color: '#ff88cc', bg: 'rgba(255,136,204,0.1)' },
};

const SCENARIOS = ['무한의꿈', '혹독한겨울', '터치오브스카이', '비정상수용'];

const DEFAULT_FORM = {
  type: 'sell', title: '', item: '', quantity: 1,
  price: '', description: '', scenario: '', server: '',
};

export default function TradePage() {
  const { data: session } = useSession();
  const { data: list, loading, mutate } = useApi('/api/trades');
  const resolveNick = useNicknames();

  const [view, setView] = useState('list');
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showClosed, setShowClosed] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sortBy, setSortBy] = useState('latest');

  const filtered = useMemo(() => {
    if (!list) return [];
    let result = list.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (!showClosed && t.status === 'closed') return false;
      if (search) {
        const q = search.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.item.toLowerCase().includes(q) ||
          (t.author || '').toLowerCase().includes(q);
      }
      return true;
    });
    if (sortBy === 'latest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'price-asc') result.sort((a, b) => (parseInt(a.price) || 0) - (parseInt(b.price) || 0));
    else if (sortBy === 'price-desc') result.sort((a, b) => (parseInt(b.price) || 0) - (parseInt(a.price) || 0));
    return result;
  }, [list, filterType, showClosed, search, sortBy]);

  const checkOwner = (entry) => {
    if (!session || !entry) return false;
    if (session.isAdmin) return true;
    if (entry.discordId && session.discordId) return entry.discordId === session.discordId;
    return entry.author === session.user?.name;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.item.trim()) return;
    setSaving(true);
    try {
      let imageUrl = editId ? sel?.image : null;
      if (imageFile) {
        const blob = await upload(imageFile.name, imageFile, {
          access: 'public', handleUploadUrl: '/api/upload',
        });
        imageUrl = blob.url;
      }
      const body = { ...form, image: imageUrl };
      const url = editId ? `/api/trades/${editId}` : '/api/trades';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        mutate();
        setView('list');
        setForm(DEFAULT_FORM);
        setEditId(null);
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/trades/${id}`, { method: 'DELETE' });
    if (res.ok) {
      mutate();
      setView('list');
      setSel(null);
    }
  };

  const handleToggleStatus = async (trade) => {
    const newStatus = trade.status === 'open' ? 'closed' : 'open';
    const res = await fetch(`/api/trades/${trade.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      mutate();
      if (sel?.id === trade.id) setSel({ ...sel, status: newStatus });
    }
  };

  const openEdit = (trade) => {
    setForm({
      type: trade.type, title: trade.title, item: trade.item,
      quantity: trade.quantity || 1, price: trade.price || '',
      description: trade.description || '', scenario: trade.scenario || '',
      server: trade.server || '',
    });
    setEditId(trade.id);
    setImagePreview(trade.image || null);
    setImageFile(null);
    setView('form');
  };

  const openNew = () => {
    setForm(DEFAULT_FORM);
    setEditId(null);
    setImageFile(null);
    setImagePreview(null);
    setView('form');
  };

  /* ── Detail View ── */
  if (view === 'detail' && sel) {
    const tc = TYPE_CONFIG[sel.type] || TYPE_CONFIG.sell;
    return (
      <div className="trade-page">
        <button className="trade-back-btn" onClick={() => { setView('list'); setSel(null); }}>
          <Icons.ChevronLeft /> 목록으로
        </button>

        <div className="trade-detail">
          <div className="trade-detail-header">
            <span className="trade-type-badge" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
            {sel.status === 'closed' && <span className="trade-status-closed">거래완료</span>}
            <h2 className="trade-detail-title">{sel.title}</h2>
          </div>

          <div className="trade-detail-grid">
            <div className="trade-detail-cell">
              <PackageIcon /> <span className="trade-detail-label">아이템</span>
              <span className="trade-detail-value">{sel.item}</span>
            </div>
            <div className="trade-detail-cell">
              <TagIcon /> <span className="trade-detail-label">수량</span>
              <span className="trade-detail-value">{sel.quantity || 1}개</span>
            </div>
            <div className="trade-detail-cell">
              <TagIcon /> <span className="trade-detail-label">{sel.type === 'share' ? '나눔' : '가격'}</span>
              <span className="trade-detail-value">{sel.type === 'share' ? '무료 나눔' : (sel.price || '협의')}</span>
            </div>
            <div className="trade-detail-cell">
              <Icons.Users /> <span className="trade-detail-label">작성자</span>
              <span className="trade-detail-value">{resolveNick(sel.discordId, sel.author)}</span>
            </div>
            {sel.scenario && (
              <div className="trade-detail-cell">
                <span className="trade-detail-label">시나리오</span>
                <span className="trade-detail-value">{sel.scenario}</span>
              </div>
            )}
            {sel.server && (
              <div className="trade-detail-cell">
                <span className="trade-detail-label">서버</span>
                <span className="trade-detail-value">{sel.server}</span>
              </div>
            )}
          </div>

          {sel.image && (
            <div className="trade-detail-image">
              <img src={sel.image} alt="" />
            </div>
          )}

          {sel.description && (
            <div className="trade-detail-desc">
              <p>{sel.description}</p>
            </div>
          )}

          {sel.createdAt && (
            <div className="trade-detail-date">
              {new Date(sel.createdAt).toLocaleDateString('ko-KR')}
            </div>
          )}

          {checkOwner(sel) && (
            <div className="trade-detail-actions">
              <Button onClick={() => handleToggleStatus(sel)} style={{ background: sel.status === 'open' ? 'var(--success)' : 'var(--accent-dim)' }}>
                <CheckIcon /> {sel.status === 'open' ? '거래완료 처리' : '다시 열기'}
              </Button>
              <Button onClick={() => openEdit(sel)}><Icons.Edit /> 수정</Button>
              <Button onClick={() => handleDelete(sel.id)} style={{ background: 'var(--danger-dim)', color: 'var(--danger)' }}>
                <Icons.Trash /> 삭제
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Form View ── */
  if (view === 'form') {
    return (
      <div className="trade-page">
        <button className="trade-back-btn" onClick={() => { setView('list'); setEditId(null); }}>
          <Icons.ChevronLeft /> 목록으로
        </button>

        <div className="trade-form">
          <h2 className="trade-form-title">{editId ? '거래 수정' : '새 거래 등록'}</h2>

          <div className="trade-form-types">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <button key={key}
                className={`trade-type-btn ${form.type === key ? 'active' : ''}`}
                style={form.type === key ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}
                onClick={() => setForm({ ...form, type: key })}
              >
                {key === 'share' && <GiftIcon size={14} />}
                {cfg.label}
              </button>
            ))}
          </div>

          <Input label="제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="거래 제목" />
          <Input label="아이템" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="아이템 이름" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="수량" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} min={1} />
            {form.type !== 'share' && (
              <Input label="가격" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="가격 (예: 1000에링)" />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>시나리오</label>
              <select
                value={form.scenario}
                onChange={(e) => setForm({ ...form, scenario: e.target.value })}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-body)',
                }}
              >
                <option value="">전체</option>
                {SCENARIOS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Input label="서버" value={form.server} onChange={(e) => setForm({ ...form, server: e.target.value })} placeholder="서버 이름" />
          </div>

          <TextArea label="설명" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="추가 설명 (선택)" rows={4} />

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>이미지 (선택)</label>
            <input type="file" accept="image/*" onChange={handleImageChange}
              style={{ fontSize: 12, color: 'var(--text-muted)' }} />
            {imagePreview && (
              <div style={{ marginTop: 8 }}>
                <img src={imagePreview} alt="" style={{ maxWidth: 200, borderRadius: 8, border: '1px solid var(--border)' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button onClick={handleSubmit} disabled={saving || !form.title.trim() || !form.item.trim()}>
              {saving ? '저장 중...' : (editId ? '수정' : '등록')}
            </Button>
            <Button onClick={() => { setView('list'); setEditId(null); }} style={{ background: 'var(--bg-tertiary)' }}>
              취소
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── List View ── */
  return (
    <div className="trade-page">
      {/* Hero */}
      <div className="trade-hero">
        <div className="hero-glow" style={{ '--accent': '#44ff88' }} />
        <div className="trade-hero-content">
          <Icons.Trade />
          <h1>거래소</h1>
          <p>아이템 판매 · 구매 · 나눔</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="trade-toolbar">
        <div className="trade-filters">
          <button className={`trade-filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}>전체</button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button key={key}
              className={`trade-filter-btn ${filterType === key ? 'active' : ''}`}
              style={filterType === key ? { color: cfg.color } : {}}
              onClick={() => setFilterType(key)}
            >{cfg.label}</button>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginLeft: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
            완료 포함
          </label>
        </div>
        <div className="trade-toolbar-right">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: 8, fontSize: 12,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', cursor: 'pointer',
            }}
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="price-asc">가격 낮은순</option>
            <option value="price-desc">가격 높은순</option>
          </select>
          <div className="trade-search">
            <Icons.Search />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="검색..." />
          </div>
          <Button onClick={openNew}><Icons.Plus /> 등록</Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="trade-loading">
          {[...Array(6)].map((_, i) => <div key={i} className="trade-skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="trade-empty">
          <PackageIcon size={32} />
          <p>등록된 거래가 없습니다</p>
        </div>
      ) : (
        <div className="trade-grid">
          {filtered.map((t) => {
            const tc = TYPE_CONFIG[t.type] || TYPE_CONFIG.sell;
            return (
              <div key={t.id} className={`trade-card ${t.status === 'closed' ? 'closed' : ''}`}
                onClick={() => { setSel(t); setView('detail'); }}>
                {t.image && (
                  <div className="trade-card-image">
                    <img src={t.image} alt="" />
                  </div>
                )}
                <div className="trade-card-body">
                  <div className="trade-card-top">
                    <span className="trade-type-badge" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
                    {t.status === 'closed' && <span className="trade-status-closed">완료</span>}
                  </div>
                  <h3 className="trade-card-title">{t.title}</h3>
                  <div className="trade-card-item">
                    <PackageIcon /> {t.item} {t.quantity > 1 ? `x${t.quantity}` : ''}
                  </div>
                  <div className="trade-card-price">
                    {t.type === 'share' ? '무료 나눔' : (t.price || '가격 협의')}
                  </div>
                  <div className="trade-card-footer">
                    <span>{resolveNick(t.discordId, t.author)}</span>
                    {t.scenario && <span className="trade-card-scenario">{t.scenario}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
