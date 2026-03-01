'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Icons } from './Icons';
import { Input, TextArea, Button } from './UI';
import { useSession } from 'next-auth/react';
import { useApi } from '@/hooks/useApi';
import { useNicknames } from '@/hooks/useNicknames';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { upload } from '@vercel/blob/client';

/* ── Icons ── */
const BookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
  </svg>
);
const EyeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const HeartIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const CATEGORIES = {
  beginner: { label: '입문', color: '#44ff88' },
  weapon: { label: '무기', color: '#ff6b6b' },
  scenario: { label: '시나리오', color: '#66bbff' },
  boss: { label: '보스', color: '#ffaa44' },
  cradle: { label: '크레이들', color: '#cc66ff' },
  tips: { label: '팁', color: '#88ddff' },
};

const DEFAULT_FORM = {
  title: '', category: 'tips', content: '', summary: '', tags: '',
};

/* ── Markdown Editor ── */
function MarkdownEditor({ value, onChange }) {
  const ref = useRef(null);
  const [tab, setTab] = useState('write');

  const insertText = useCallback((before, after = '') => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const newText = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange({ target: { value: newText } });
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }, [value, onChange]);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const blob = await upload(file.name, file, {
          access: 'public', handleUploadUrl: '/api/upload',
        });
        insertText(`![${file.name}](${blob.url})`);
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    };
    input.click();
  }, [insertText]);

  return (
    <div className="guide-editor">
      <div className="guide-editor-tabs">
        <button className={tab === 'write' ? 'active' : ''} onClick={() => setTab('write')}>작성</button>
        <button className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}>미리보기</button>
      </div>
      {tab === 'write' ? (
        <>
          <div className="guide-editor-toolbar">
            <button onClick={() => insertText('**', '**')} title="굵게"><strong>B</strong></button>
            <button onClick={() => insertText('*', '*')} title="기울임"><em>I</em></button>
            <button onClick={() => insertText('## ')} title="제목">H</button>
            <button onClick={() => insertText('- ')} title="목록">•</button>
            <button onClick={() => insertText('`', '`')} title="코드">{'{}'}</button>
            <button onClick={() => insertText('[', '](url)')} title="링크">🔗</button>
            <button onClick={handleImageUpload} title="이미지">📷</button>
            <button onClick={() => insertText('| 열1 | 열2 |\n|---|---|\n| ', ' |  |\n')} title="표">⊞</button>
          </div>
          <textarea ref={ref} value={value} onChange={onChange}
            placeholder="마크다운으로 작성하세요..."
            className="guide-editor-textarea" rows={16} />
        </>
      ) : (
        <div className="guide-preview bl-markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '*내용을 입력하세요*'}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  const { data: session } = useSession();
  const { data: list, loading, mutate } = useApi('/api/guides');
  const resolveNick = useNicknames();

  const [view, setView] = useState('list');
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const filtered = useMemo(() => {
    if (!list) return [];
    return list.filter((g) => {
      if (filterCat !== 'all' && g.category !== filterCat) return false;
      if (search) {
        const q = search.toLowerCase();
        return g.title.toLowerCase().includes(q) ||
          (g.summary || '').toLowerCase().includes(q) ||
          (g.author || '').toLowerCase().includes(q) ||
          (g.tags || []).some((t) => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [list, filterCat, search]);

  const checkOwner = (entry) => {
    if (!session || !entry) return false;
    if (session.isAdmin) return true;
    if (entry.discordId && session.discordId) return entry.discordId === session.discordId;
    return entry.author === session.user?.name;
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      let imageUrl = editId ? sel?.image : null;
      if (coverFile) {
        const blob = await upload(coverFile.name, coverFile, {
          access: 'public', handleUploadUrl: '/api/upload',
        });
        imageUrl = blob.url;
      }
      const tags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      const body = {
        title: form.title, category: form.category,
        content: form.content, summary: form.summary,
        image: imageUrl, tags,
      };
      const url = editId ? `/api/guides/${editId}` : '/api/guides';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        mutate();
        setView('list');
        setForm(DEFAULT_FORM);
        setEditId(null);
        setCoverFile(null);
        setCoverPreview(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/guides/${id}`, { method: 'DELETE' });
    if (res.ok) {
      mutate();
      setView('list');
      setSel(null);
    }
  };

  const openEdit = (guide) => {
    setForm({
      title: guide.title, category: guide.category,
      content: guide.content || '', summary: guide.summary || '',
      tags: (guide.tags || []).join(', '),
    });
    setEditId(guide.id);
    setCoverPreview(guide.image || null);
    setCoverFile(null);
    setView('form');
  };

  const openDetail = async (guide) => {
    setSel(guide);
    setView('detail');
    // Increment view count
    try { await fetch(`/api/guides/${guide.id}`); } catch {}
  };

  /* ── Detail View ── */
  if (view === 'detail' && sel) {
    const cat = CATEGORIES[sel.category] || CATEGORIES.tips;
    return (
      <div className="guide-page">
        <button className="guide-back-btn" onClick={() => { setView('list'); setSel(null); }}>
          <Icons.ChevronLeft /> 목록으로
        </button>

        <article className="guide-detail">
          {sel.image && (
            <div className="guide-detail-cover">
              <img src={sel.image} alt="" />
            </div>
          )}

          <div className="guide-detail-header">
            <span className="guide-cat-badge" style={{ background: `${cat.color}18`, color: cat.color }}>
              {cat.label}
            </span>
            <h1 className="guide-detail-title">{sel.title}</h1>
            <div className="guide-detail-meta">
              <span>{resolveNick(sel.discordId, sel.author)}</span>
              <span>·</span>
              <span>{sel.createdAt ? new Date(sel.createdAt).toLocaleDateString('ko-KR') : ''}</span>
              {sel.views > 0 && <><span>·</span><span><EyeIcon /> {sel.views}</span></>}
            </div>
            {sel.tags && sel.tags.length > 0 && (
              <div className="guide-detail-tags">
                {sel.tags.map((tag, i) => <span key={i} className="guide-tag">#{tag}</span>)}
              </div>
            )}
          </div>

          <div className="guide-detail-content bl-markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{sel.content}</ReactMarkdown>
          </div>

          {checkOwner(sel) && (
            <div className="guide-detail-actions">
              <Button onClick={() => openEdit(sel)}><Icons.Edit /> 수정</Button>
              <Button onClick={() => handleDelete(sel.id)} style={{ background: 'var(--danger-dim)', color: 'var(--danger)' }}>
                <Icons.Trash /> 삭제
              </Button>
            </div>
          )}
        </article>
      </div>
    );
  }

  /* ── Form View ── */
  if (view === 'form') {
    return (
      <div className="guide-page">
        <button className="guide-back-btn" onClick={() => { setView('list'); setEditId(null); }}>
          <Icons.ChevronLeft /> 목록으로
        </button>

        <div className="guide-form">
          <h2 className="guide-form-title">{editId ? '가이드 수정' : '새 가이드 작성'}</h2>

          <Input label="제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="가이드 제목" />

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>카테고리</label>
            <div className="guide-cat-select">
              {Object.entries(CATEGORIES).map(([key, cfg]) => (
                <button key={key}
                  className={`guide-cat-btn ${form.category === key ? 'active' : ''}`}
                  style={form.category === key ? { background: `${cfg.color}18`, color: cfg.color, borderColor: cfg.color } : {}}
                  onClick={() => setForm({ ...form, category: key })}
                >{cfg.label}</button>
              ))}
            </div>
          </div>

          <Input label="요약 (한 줄)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="가이드 요약" />

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>내용</label>
            <MarkdownEditor value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>

          <Input label="태그 (쉼표로 구분)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="팁, 보스, 무기" />

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>커버 이미지 (선택)</label>
            <input type="file" accept="image/*" onChange={handleCoverChange}
              style={{ fontSize: 12, color: 'var(--text-muted)' }} />
            {coverPreview && (
              <div style={{ marginTop: 8 }}>
                <img src={coverPreview} alt="" style={{ maxWidth: 300, borderRadius: 8, border: '1px solid var(--border)' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button onClick={handleSubmit} disabled={saving || !form.title.trim() || !form.content.trim()}>
              {saving ? '저장 중...' : (editId ? '수정' : '발행')}
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
    <div className="guide-page">
      {/* Hero */}
      <div className="guide-hero">
        <div className="hero-glow" style={{ '--accent': '#66bbff' }} />
        <div className="guide-hero-content">
          <BookIcon size={28} />
          <h1>공략 · 가이드</h1>
          <p>원스휴먼 공략과 팁을 공유하세요</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="guide-toolbar">
        <div className="guide-filters">
          <button className={`guide-filter-btn ${filterCat === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCat('all')}>전체</button>
          {Object.entries(CATEGORIES).map(([key, cfg]) => (
            <button key={key}
              className={`guide-filter-btn ${filterCat === key ? 'active' : ''}`}
              style={filterCat === key ? { color: cfg.color } : {}}
              onClick={() => setFilterCat(key)}
            >{cfg.label}</button>
          ))}
        </div>
        <div className="guide-toolbar-right">
          <div className="guide-search">
            <Icons.Search />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="검색..." />
          </div>
          <Button onClick={() => { setForm(DEFAULT_FORM); setEditId(null); setCoverFile(null); setCoverPreview(null); setView('form'); }}>
            <Icons.Plus /> 작성
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="guide-loading">
          {[...Array(6)].map((_, i) => <div key={i} className="guide-skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="guide-empty">
          <BookIcon size={32} />
          <p>등록된 가이드가 없습니다</p>
        </div>
      ) : (
        <div className="guide-grid">
          {filtered.map((g) => {
            const cat = CATEGORIES[g.category] || CATEGORIES.tips;
            return (
              <div key={g.id} className="guide-card" onClick={() => openDetail(g)}>
                {g.image && (
                  <div className="guide-card-cover">
                    <img src={g.image} alt="" />
                  </div>
                )}
                <div className="guide-card-body">
                  <div className="guide-card-top">
                    <span className="guide-cat-badge" style={{ background: `${cat.color}18`, color: cat.color }}>{cat.label}</span>
                  </div>
                  <h3 className="guide-card-title">{g.title}</h3>
                  {g.summary && <p className="guide-card-summary">{g.summary}</p>}
                  <div className="guide-card-footer">
                    <span>{resolveNick(g.discordId, g.author)}</span>
                    <div className="guide-card-stats">
                      {g.views > 0 && <span><EyeIcon /> {g.views}</span>}
                    </div>
                  </div>
                  {g.tags && g.tags.length > 0 && (
                    <div className="guide-card-tags">
                      {g.tags.slice(0, 3).map((tag, i) => <span key={i} className="guide-tag">#{tag}</span>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
