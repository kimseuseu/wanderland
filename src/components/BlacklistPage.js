'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Icons } from './Icons';
import { Input, TextArea, Button } from './UI';
import { useSession } from 'next-auth/react';
import { useApi } from '@/hooks/useApi';
import { useNicknames } from '@/hooks/useNicknames';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { upload } from '@vercel/blob/client';

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
const GroupIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
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
  const isGroup = item.type === 'group';
  const initial = isGroup ? null : (item.name || '?')[0].toUpperCase();
  const [uuidCopied, setUuidCopied] = useState(false);

  const handleUuidCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.uuid).then(() => {
      setUuidCopied(true);
      setTimeout(() => setUuidCopied(false), 1500);
    });
  };

  return (
    <div className={`bl-card fade-in${isGroup ? ' bl-card--group' : ''}`} style={{ animationDelay: `${index * 0.06}s` }} onClick={onClick}>
      <div className="bl-card-glow" />
      <div className="bl-card-header">
        <div className={`bl-card-avatar${isGroup ? ' bl-card-avatar--group' : ''}`}>
          <span>{isGroup ? <GroupIcon size={18} /> : initial}</span>
          <div className="bl-card-avatar-ring" />
        </div>
        <div className="bl-card-identity">
          <div className="bl-card-name">
            {isGroup && <span className="bl-card-type-badge">집단</span>}
            {item.name}
          </div>
          {!isGroup && item.uuid && (
            <div className="bl-card-uuid bl-card-uuid--copyable" onClick={handleUuidCopy} title="클릭하여 UUID 복사">
              <ClipboardIcon /> {item.uuid}
              {uuidCopied && <span className="bl-copied-toast">복사됨!</span>}
            </div>
          )}
        </div>
        <ChevronIcon />
      </div>

      <div className="bl-card-body">
        {!isGroup && item.clan && (
          <div className="bl-card-tag">
            <Icons.Shield /> {item.clan}
          </div>
        )}
        {item.alts && (
          <div className="bl-card-tag bl-card-tag--alt">
            <Icons.Users /> {isGroup ? item.alts : item.alts}
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

  const toggleImgPopover = useCallback(() => {
    setShowImgPopover(!showImgPopover);
  }, [showImgPopover]);

  const toolbarActions = [
    { icon: <BoldIcon />, action: () => wrapSelection('**', '**'), title: '굵게' },
    { icon: <ItalicIcon />, action: () => wrapSelection('*', '*'), title: '기울임' },
    { icon: <HeadingIcon />, action: () => insertAtCursor('\n### '), title: '제목' },
    'sep',
    { icon: <HrIcon />, action: () => insertAtCursor('\n---\n'), title: '구분선' },
    { icon: <LinkIcon />, action: () => wrapSelection('[', '](url)'), title: '링크' },
    'sep',
    { icon: <ImageIcon size={14} />, action: toggleImgPopover, title: '이미지', id: 'img' },
  ];

  const uploadImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) { alert('파일 크기는 10MB 이하여야 합니다.'); return; }
    setUploading(true);
    try {
      const blob = await upload(`blacklist/${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      insertAtCursor(`\n![이미지](${blob.url})\n`);
      setShowImgPopover(false);
      setImgUrl('');
    } catch (e) { console.error(e); alert(e.message || '업로드에 실패했습니다.'); }
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
          <div className="bl-editor-toolbar">
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
          </div>
        )}

        {/* Content Area */}
        {tab === 'write' ? (
          <>
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
            {/* 인라인 이미지 프리뷰 — textarea 안에서 이미지만 바로 표시 */}
            {(() => {
              const imgs = [...(value || '').matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)];
              if (imgs.length === 0) return null;
              return (
                <div className="bl-editor-inline-images">
                  {imgs.map((m, i) => (
                    <div key={i} className="bl-editor-inline-img">
                      <img src={m[1]} alt="" loading="lazy" />
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
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

      {/* Image Popover - rendered outside editor-wrap to avoid overflow clipping */}
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
                  autoFocus
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
  );
}

/* ────────── Main Component ────────── */
export default function BlacklistPage() {
  const { data: session } = useSession();
  const { data: list, loading, mutate } = useApi('/api/blacklist');
  const resolveNick = useNicknames();
  const [view, setView] = useState('list'); // 'list' | 'form' | 'detail'
  const [sel, setSel] = useState(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || '';
    }
    return '';
  });
  const [form, setForm] = useState({ type: 'individual', name: '', uuid: '', alts: '', clan: '', incident: '', content: '' });
  const [editItem, setEditItem] = useState(null);

  const EMPTY_FORM = { type: 'individual', name: '', uuid: '', alts: '', clan: '', incident: '', content: '' };

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
    const individuals = items.filter(i => i.type !== 'group');
    const groups = items.filter(i => i.type === 'group');
    const thisMonth = items.filter(i => {
      if (!i.date) return false;
      const d = new Date(i.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return { total: individuals.length, groups: groups.length, recent: thisMonth.length };
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
      type: item.type || 'individual',
      name: item.name || '',
      uuid: item.uuid || '',
      alts: item.alts || '',
      clan: item.clan || '',
      incident: item.incident || '',
      content: item.content || '',
    });
    setEditItem(item);
    setView('form');
    setSel(null);
  };

  const copyUuid = (uuid) => {
    navigator.clipboard.writeText(uuid).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const openDetail = (item) => {
    setSel(item);
    setView('detail');
  };

  const closeDetail = () => {
    setSel(null);
    setView('list');
  };

  const openNewForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditItem(null);
    setView('form');
  };

  const closeForm = () => {
    setView('list');
    setEditItem(null);
    setForm({ ...EMPTY_FORM });
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
          body: JSON.stringify({ ...form, type: form.type || 'individual', reporter: session?.user?.name || '익명' }),
        });
      }
      mutate();
    } catch (e) { console.error(e); }
    closeForm();
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

  /* ── 풀페이지 상세 ── */
  if (view === 'detail' && sel) {
    const isGroupDetail = sel.type === 'group';
    return (
      <div className="bl-page fade-in">
        <div className="bl-form-page">
          <button className="bl-form-back" onClick={closeDetail}>
            ← 목록으로
          </button>

          <div className="bl-detail">
            <div className="bl-detail-banner">
              <div className={`bl-detail-avatar${isGroupDetail ? ' bl-detail-avatar--group' : ''}`}>
                <span>{isGroupDetail ? <GroupIcon size={24} /> : (sel.name || '?')[0].toUpperCase()}</span>
              </div>
              {isGroupDetail && <div className="bl-detail-type-badge">집단 신고</div>}
              <h3 className="bl-detail-name">{sel.name}</h3>
              {!isGroupDetail && sel.uuid && (
                <div
                  className="bl-detail-uuid bl-detail-uuid--copyable"
                  onClick={() => copyUuid(sel.uuid)}
                  title="클릭하여 UUID 복사"
                >
                  <ClipboardIcon /> {sel.uuid}
                  {copied && <span className="bl-copied-toast">복사됨!</span>}
                </div>
              )}
            </div>

            <div className="bl-detail-grid">
              {isGroupDetail ? (
                <>
                  <div className="bl-detail-cell">
                    <div className="bl-detail-cell-icon"><Icons.Users /></div>
                    <div>
                      <div className="bl-detail-cell-label">관련 인물</div>
                      <div className="bl-detail-cell-value">{sel.alts || '정보 없음'}</div>
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
                      <div className="bl-detail-cell-value">{resolveNick(sel.discordId, sel.reporter)}</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                      <div className="bl-detail-cell-value">{resolveNick(sel.discordId, sel.reporter)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bl-detail-section">
              <div className="bl-detail-section-title">
                <AlertIcon /> 사건 개요
              </div>
              <div className="bl-detail-incident">
                {sel.incident || '기록된 내용이 없습니다.'}
              </div>
            </div>

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
              <Button variant="secondary" onClick={closeDetail}>목록으로</Button>
              {checkOwner(sel) && (
                <>
                  <Button variant="secondary" onClick={() => startEdit(sel)}>
                    <Icons.Edit /> 수정
                  </Button>
                  <Button variant="danger" onClick={() => { remove(sel.id); closeDetail(); }}>
                    <Icons.Trash /> 삭제
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── 풀페이지 폼 (등록/수정) ── */
  if (view === 'form') {
    const isGroupForm = form.type === 'group';
    return (
      <div className="bl-page fade-in">
        <div className="bl-form-page">
          <button className="bl-form-back" onClick={closeForm}>
            ← 목록으로
          </button>

          <h2 className="bl-form-title">{editItem ? '블랙리스트 수정' : '블랙리스트 등록'}</h2>
          <p className="bl-form-subtitle">{editItem ? '블랙리스트 정보를 수정합니다' : '새로운 블랙리스트 항목을 등록합니다'}</p>

          {/* 신고 유형 선택 */}
          <div className="bl-form-section">
            <div className="bl-form-section-title"><AlertIcon size={14} /> 신고 유형</div>
            <div className="bl-type-toggle">
              <button
                className={`bl-type-btn${!isGroupForm ? ' active' : ''}`}
                onClick={() => setForm({ ...form, type: 'individual' })}
              >
                <SkullIcon size={16} />
                <span>개인</span>
              </button>
              <button
                className={`bl-type-btn${isGroupForm ? ' active' : ''}`}
                onClick={() => setForm({ ...form, type: 'group' })}
              >
                <GroupIcon size={16} />
                <span>집단</span>
              </button>
            </div>
          </div>

          {/* 기본 정보 섹션 */}
          <div className="bl-form-section">
            <div className="bl-form-section-title">
              {isGroupForm ? <><GroupIcon size={14} /> 집단 정보</> : <><SkullIcon size={14} /> 기본 정보</>}
            </div>
            {isGroupForm ? (
              <>
                <Input label="집단 이름 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="하이브 / 클랜 이름" />
                <Input label="관련 인물" value={form.alts} onChange={(e) => setForm({ ...form, alts: e.target.value })} placeholder="주요 멤버, 리더 등 (쉼표로 구분)" />
              </>
            ) : (
              <>
                <Input label="닉네임 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="게임 내 닉네임" />
                <div className="bl-form-grid">
                  <Input label="UUID" value={form.uuid} onChange={(e) => setForm({ ...form, uuid: e.target.value })} placeholder="숫자 9자리 (예: 123456789)" />
                  <Input label="소속 클랜" value={form.clan} onChange={(e) => setForm({ ...form, clan: e.target.value })} placeholder="클랜 / 하이브명" />
                </div>
                <Input label="부캐" value={form.alts} onChange={(e) => setForm({ ...form, alts: e.target.value })} placeholder="쉼표로 구분 (선택)" />
              </>
            )}
          </div>

          {/* 사건 내용 섹션 */}
          <div className="bl-form-section">
            <div className="bl-form-section-title"><AlertIcon size={14} /> 사건 내용</div>
            <TextArea label="사건 개요 *" value={form.incident} onChange={(e) => setForm({ ...form, incident: e.target.value })} placeholder="어떤 사건이 있었는지 간략히 기록해주세요..." />
          </div>

          {/* 상세 내용 (마크다운 에디터) 섹션 */}
          <div className="bl-form-section">
            <div className="bl-form-section-title"><DocIcon size={14} /> 상세 내용</div>
            <MarkdownEditor
              value={form.content}
              onChange={(val) => setForm({ ...form, content: val })}
            />
          </div>

          {/* 하단 버튼 */}
          <div className="bl-form-actions">
            <Button variant="secondary" onClick={closeForm}>취소</Button>
            <Button variant="danger" onClick={addOrUpdate}>{editItem ? '수정' : '등록'}</Button>
          </div>
        </div>
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
            <p className="bl-hero-sub">주의 유저 / 집단 공유 목록</p>
          </div>
        </div>
        <Button variant="danger" onClick={openNewForm} style={{ position: 'relative', zIndex: 2 }}>
          <Icons.Plus /> 신고 등록
        </Button>
      </div>

      {/* Stats Row */}
      <div className="bl-stats">
        <StatCard icon={<SkullIcon size={18} />} value={stats.total} label="등록된 유저" accent="#ff4444" />
        <StatCard icon={<GroupIcon size={18} />} value={stats.groups} label="등록된 집단" accent="#ff6b35" />
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
          <EntryCard key={item.id} item={item} index={i} onClick={() => openDetail(item)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bl-empty fade-in">
          <div className="bl-empty-icon"><Icons.Search /></div>
          <p>검색 결과가 없습니다</p>
          <span>다른 키워드로 다시 검색해보세요</span>
        </div>
      )}


    </div>
  );
}
