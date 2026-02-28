'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Icons } from './Icons';
import { Modal, Input, TextArea, Button } from './UI';
import { useSession } from 'next-auth/react';
import { useApi } from '@/hooks/useApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
const BoldIcon = () => <span style={{ fontWeight: 900, fontSize: 14 }}>B</span>;
const ItalicIcon = () => <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: 14 }}>I</span>;
const HeadingIcon = () => <span style={{ fontWeight: 800, fontSize: 12 }}>H</span>;
const HrIcon = () => <span style={{ fontSize: 16, lineHeight: 1 }}>—</span>;
const LinkIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);
const UploadIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const DocIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
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
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {item.content && <span className="bl-card-has-image"><DocIcon /> 본문</span>}
          {item.image && <span className="bl-card-has-image"><ImageIcon /> 증거</span>}
        </div>
      </div>
    </div>
  );
}

/* ────────── Markdown Editor ────────── */
function MarkdownEditor({ value, onChange }) {
  const [tab, setTab] = useState('write');
  const [showImgPopover, setShowImgPopover] = useState(false);
  const [imgMode, setImgMode] = useState('url');
  const [imgUrl, setImgUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const insertAtCursor = useCallback((text) => {
    const ta = textareaRef.current;
    if (!ta) { onChange(value + text); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = value.slice(0, start) + text + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + text.length;
    }, 0);
  }, [value, onChange]);

  const wrapSelection = useCallback((before, after) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const text = selected || '텍스트';
    const newVal = value.slice(0, start) + before + text + after + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + text.length;
    }, 0);
  }, [value, onChange]);

  const toolbarActions = [
    { icon: <BoldIcon />, action: () => wrapSelection('**', '**'), title: '굵게' },
    { icon: <ItalicIcon />, action: () => wrapSelection('*', '*'), title: '기울임' },
    { icon: <HeadingIcon />, action: () => insertAtCursor('\n### '), title: '제목' },
    'sep',
    { icon: <HrIcon />, action: () => insertAtCursor('\n---\n'), title: '구분선' },
    { icon: <LinkIcon />, action: () => wrapSelection('[', '](url)'), title: '링크' },
    'sep',
    { icon: <ImageIcon size={14} />, action: () => setShowImgPopover(!showImgPopover), title: '이미지', id: 'img' },
  ];

  const uploadImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('prefix', 'blacklist');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('업로드 실패');
      const { url } = await res.json();
      insertAtCursor(`\n![이미지](${url})\n`);
      setShowImgPopover(false);
      setImgUrl('');
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const insertImgUrl = () => {
    if (!imgUrl.trim()) return;
    insertAtCursor(`\n![이미지](${imgUrl.trim()})\n`);
    setShowImgPopover(false);
    setImgUrl('');
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        uploadImage(item.getAsFile());
        return;
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    }
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label className="bl-editor-label">상세 내용</label>
      <div className="bl-editor-wrap">
        {/* Header: Tabs */}
        <div className="bl-editor-header">
          <div className="bl-editor-tabs">
            <button className={`bl-editor-tab${tab === 'write' ? ' active' : ''}`} onClick={() => setTab('write')}>작성</button>
            <button className={`bl-editor-tab${tab === 'preview' ? ' active' : ''}`} onClick={() => setTab('preview')}>미리보기</button>
          </div>
        </div>

        {/* Toolbar (write mode only) */}
        {tab === 'write' && (
          <div className="bl-editor-toolbar" style={{ position: 'relative' }}>
            {toolbarActions.map((a, i) =>
              a === 'sep' ? (
                <div key={i} className="bl-editor-toolbar-sep" />
              ) : (
                <button
                  key={i}
                  className={`bl-editor-toolbar-btn${a.id === 'img' && showImgPopover ? ' active' : ''}`}
                  onClick={a.action}
                  title={a.title}
                >
                  {a.icon}
                </button>
              )
            )}

            {/* Image Popover */}
            {showImgPopover && (
              <>
                <div className="bl-img-popover-overlay" onClick={() => setShowImgPopover(false)} />
                <div className="bl-img-popover">
                  <div className="bl-img-popover-title">이미지 추가</div>

                  {/* URL Option */}
                  <div className="bl-img-option" onClick={() => setImgMode('url')}>
                    <div className={`bl-img-option-radio${imgMode === 'url' ? ' selected' : ''}`} />
                    <span className="bl-img-option-label">URL 입력</span>
                  </div>
                  {imgMode === 'url' && (
                    <>
                      <input
                        className="bl-img-url-input"
                        placeholder="https://example.com/image.png"
                        value={imgUrl}
                        onChange={(e) => setImgUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && insertImgUrl()}
                      />
                      <div className="bl-img-popover-actions">
                        <Button variant="secondary" onClick={() => setShowImgPopover(false)} style={{ padding: '5px 12px', fontSize: 11 }}>취소</Button>
                        <Button variant="danger" onClick={insertImgUrl} style={{ padding: '5px 12px', fontSize: 11 }}>삽입</Button>
                      </div>
                    </>
                  )}

                  {/* Upload Option */}
                  <div className="bl-img-option" onClick={() => setImgMode('upload')}>
                    <div className={`bl-img-option-radio${imgMode === 'upload' ? ' selected' : ''}`} />
                    <span className="bl-img-option-label">파일 업로드</span>
                  </div>
                  {imgMode === 'upload' && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => { const f = e.target.files[0]; if (f) uploadImage(f); }}
                      />
                      <div
                        className={`bl-img-upload-zone${dragOver ? ' dragover' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadImage(f); }}
                      >
                        <div className="bl-img-upload-zone-icon"><UploadIcon /></div>
                        {uploading ? '업로드 중...' : '클릭 또는 드래그하여 업로드'}
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>10MB 이하 이미지</div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Content Area */}
        {tab === 'write' ? (
          <textarea
            ref={textareaRef}
            className="bl-editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            placeholder="마크다운 형식으로 상세 내용을 작성하세요...&#10;&#10;**굵게**, *기울임*, ### 제목, - 목록&#10;이미지: 툴바의 이미지 버튼 또는 Ctrl+V로 붙여넣기"
          />
        ) : (
          <div className="bl-editor-preview">
            {value ? (
              <div className="bl-markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({ src, alt }) => (
                      <div className="bl-markdown-img-wrap">
                        <img src={src} alt={alt || ''} className="bl-markdown-img" loading="lazy" />
                      </div>
                    ),
                  }}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
                미리보기할 내용이 없습니다
              </div>
            )}
          </div>
        )}
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
  const [form, setForm] = useState({ name: '', uuid: '', alts: '', clan: '', incident: '', content: '' });
  const [editItem, setEditItem] = useState(null);

  const EMPTY_FORM = { name: '', uuid: '', alts: '', clan: '', incident: '', content: '' };

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

  const checkOwner = (item) => {
    if (!session || !item) return false;
    if (session.isAdmin) return true;
    if (item.discordId && session.discordId) return item.discordId === session.discordId;
    if (!item.discordId && session.user?.name) return item.reporter === session.user.name;
    return false;
  };

  const startEdit = (item) => {
    setForm({
      name: item.name || '',
      uuid: item.uuid || '',
      alts: item.alts || '',
      clan: item.clan || '',
      incident: item.incident || '',
      content: item.content || '',
    });
    setEditItem(item);
    setShowAdd(true);
    setSel(null);
  };

  const addOrUpdate = async () => {
    if (!form.name) return;
    try {
      if (editItem) {
        await fetch(`/api/blacklist/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/blacklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, reporter: session?.user?.name || '익명' }),
        });
      }
      mutate();
    } catch (e) { console.error(e); }
    setShowAdd(false);
    setEditItem(null);
    setForm({ ...EMPTY_FORM });
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

            {/* Markdown Content */}
            {sel.content && (
              <div className="bl-detail-section">
                <div className="bl-detail-section-title">
                  <DocIcon /> 상세 내용
                </div>
                <div className="bl-markdown-body">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ src, alt }) => (
                        <div className="bl-markdown-img-wrap">
                          <img src={src} alt={alt || ''} className="bl-markdown-img" loading="lazy" />
                        </div>
                      ),
                    }}
                  >
                    {sel.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}

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
              {checkOwner(sel) && (
                <>
                  <Button variant="secondary" onClick={() => startEdit(sel)}>
                    <Icons.Edit /> 수정
                  </Button>
                  <Button variant="danger" onClick={() => remove(sel.id)}>
                    <Icons.Trash /> 삭제
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditItem(null); setForm({ ...EMPTY_FORM }); }} title={editItem ? '블랙리스트 수정' : '블랙리스트 등록'}>
        <div className="bl-add-form">
          <div className="bl-add-form-header">
            <div className="bl-add-form-icon"><SkullIcon size={24} /></div>
            <p>{editItem ? '블랙리스트 정보를 수정합니다' : '새로운 블랙리스트 유저를 등록합니다'}</p>
          </div>
          <Input label="닉네임 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="게임 내 닉네임" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="UUID" value={form.uuid} onChange={(e) => setForm({ ...form, uuid: e.target.value })} placeholder="OH-XXXXX-KR" />
            <Input label="소속 하이브" value={form.clan} onChange={(e) => setForm({ ...form, clan: e.target.value })} placeholder="하이브명" />
          </div>
          <Input label="부캐" value={form.alts} onChange={(e) => setForm({ ...form, alts: e.target.value })} placeholder="쉼표로 구분 (선택)" />
          <TextArea label="사건 개요 *" value={form.incident} onChange={(e) => setForm({ ...form, incident: e.target.value })} placeholder="어떤 사건이 있었는지 간략히 기록해주세요..." />

          {/* Markdown Editor */}
          <MarkdownEditor
            value={form.content}
            onChange={(val) => setForm({ ...form, content: val })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button variant="secondary" onClick={() => { setShowAdd(false); setEditItem(null); setForm({ ...EMPTY_FORM }); }}>취소</Button>
            <Button variant="danger" onClick={addOrUpdate}>{editItem ? '수정' : '등록'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
