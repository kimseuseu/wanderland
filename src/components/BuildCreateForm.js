'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icons } from './Icons';
import { TextArea, Button } from './UI';

const catColor = { '총기': '#ff6b6b', '원소': '#88ccff', '하이브리드': '#cc88ff' };
const categories = ['총기', '원소', '하이브리드'];
const weaponTypes = ['권총', '산탄총', '기관단총', '돌격소총', '저격소총', '경기관총', '석궁'];
const grades = ['전설', '영웅', '희귀'];
const suffixTypes = ['섬광', '클래식', '신판'];
const typeColor = (t) => t === '섬광' ? '#88ccff' : t === '클래식' ? '#ffcc44' : t === '신판' ? '#88ff88' : 'var(--text-secondary)';
const tagOptions = ['PvE', 'PvP', '시즌', '뉴비추천', '상위자'];

/* ── 스타일 상수 ── */
const labelStyle = {
  display: 'block', fontSize: 11, color: 'var(--text-secondary)',
  marginBottom: 5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
};
const inputStyle = {
  width: '100%', padding: '9px 12px', background: 'var(--bg-tertiary)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)',
  fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
};
const addBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
  background: 'transparent', color: 'var(--text-muted)',
  border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-body)',
};
const removeBtnStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, borderRadius: 6, background: 'transparent',
  border: '1px solid var(--border)', color: 'var(--text-muted)',
  cursor: 'pointer', flexShrink: 0,
};

/* ── 섹션 카드 ── */
function SectionCard({ number, title, accent, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '24px 28px', marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 11, color: accent, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>{number}</span>
        <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ── 선택 버튼 그룹 ── */
function PillSelect({ label, options, value, onChange, colorMap }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const active = Array.isArray(value) ? value.includes(opt) : value === opt;
          const c = colorMap?.[opt] || '#fff';
          return (
            <button key={opt} type="button" onClick={() => onChange(opt)}
              style={{
                padding: '4px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: '1px solid', cursor: 'pointer', fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
                background: active ? c : 'transparent',
                color: active ? '#000' : (colorMap ? c : 'var(--text-muted)'),
                borderColor: active ? c : 'var(--border)',
              }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   빌드 작성 폼
   ═══════════════════════════════════════════ */
export default function BuildCreateForm({ onBack, onCreated }) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '', mainWeapon: '', subWeapon: '', grade: '전설',
    category: '', weaponType: '', image: '',
    tuning: [''], modules: [''], infections: [''], doping: [''],
    armorSet: '', armorOptions: [''],
    suffixes: [{ part: '', suffix: '', keyword: '', type: '섬광' }],
    leather: [{ part: '', name: '' }],
    tags: [], notes: '',
  });

  /* ── 배열 헬퍼 ── */
  const updateArr = (field, i, val) =>
    setForm((p) => ({ ...p, [field]: p[field].map((v, j) => j === i ? val : v) }));
  const addArr = (field, def = '') =>
    setForm((p) => ({ ...p, [field]: [...p[field], def] }));
  const removeArr = (field, i) =>
    setForm((p) => ({ ...p, [field]: p[field].filter((_, j) => j !== i) }));

  const updateObjArr = (field, i, key, val) =>
    setForm((p) => ({ ...p, [field]: p[field].map((v, j) => j === i ? { ...v, [key]: val } : v) }));
  const addObjArr = (field, def) =>
    setForm((p) => ({ ...p, [field]: [...p[field], def] }));
  const removeObjArr = (field, i) =>
    setForm((p) => ({ ...p, [field]: p[field].filter((_, j) => j !== i) }));

  const toggleTag = (tag) =>
    setForm((p) => ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter((t) => t !== tag) : [...p.tags, tag] }));

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  /* ── 제출 ── */
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.mainWeapon.trim()) {
      setError('빌드 이름과 메인 무기는 필수입니다.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        ...form,
        author: session?.user?.name || '익명',
        tuning: form.tuning.filter((v) => v.trim()),
        modules: form.modules.filter((v) => v.trim()),
        infections: form.infections.filter((v) => v.trim()),
        doping: form.doping.filter((v) => v.trim()),
        armorOptions: form.armorOptions.filter((v) => v.trim()),
        suffixes: form.suffixes.filter((s) => s.part.trim() || s.suffix.trim()),
        leather: form.leather.filter((l) => l.part.trim() || l.name.trim()),
      };
      const res = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '빌드 생성에 실패했습니다.');
      }
      onCreated();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── 동적 문자열 배열 UI ── */
  function DynList({ label, field, accent, placeholder }) {
    return (
      <div style={{ marginBottom: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <label style={{ ...labelStyle, color: accent, marginBottom: 0 }}>{label}</label>
          <button type="button" onClick={() => addArr(field)} style={addBtnStyle}><Icons.Plus /> 추가</button>
        </div>
        {form[field].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
            <input value={item} onChange={(e) => updateArr(field, i, e.target.value)}
              placeholder={placeholder} style={inputStyle} />
            {form[field].length > 1 && (
              <button type="button" onClick={() => removeArr(field, i)} style={removeBtnStyle}><Icons.X /></button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* ── 뒤로 가기 ── */}
      <button type="button" onClick={onBack}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', padding: '4px 0', fontSize: 13, fontFamily: 'var(--font-body)',
          display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <Icons.ChevronLeft /> 빌드 목록으로
      </button>

      <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 24 }}>
        빌드 작성
      </h2>

      {/* ═══ 섹션 1: 기본 정보 + 무기 & 전투 ═══ */}
      <SectionCard number="01" title="기본 정보 + 무기 & 전투 세팅" accent="#ff6b6b">
        {/* 빌드 이름 */}
        <div style={{ marginBottom: 13 }}>
          <label style={labelStyle}>빌드 이름 *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)}
            placeholder="예: SKS 탐색자 빌드" style={inputStyle} />
        </div>

        {/* 이미지 URL */}
        <div style={{ marginBottom: 13 }}>
          <label style={labelStyle}>이미지 URL</label>
          <input value={form.image} onChange={(e) => set('image', e.target.value)}
            placeholder="https://... (선택사항)" style={inputStyle} />
        </div>

        {/* 등급 */}
        <PillSelect label="등급" options={grades} value={form.grade}
          onChange={(g) => set('grade', g)} colorMap={{ '전설': '#ffd700', '영웅': '#cc88ff', '희귀': '#88ccff' }} />

        {/* 카테고리 */}
        <PillSelect label="대분류" options={categories} value={form.category}
          onChange={(c) => set('category', c)} colorMap={catColor} />

        {/* 무기 종류 */}
        <PillSelect label="무기 종류" options={weaponTypes} value={form.weaponType}
          onChange={(w) => set('weaponType', w)} />

        {/* 무기 */}
        <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
          <div>
            <label style={labelStyle}>메인 무기 *</label>
            <input value={form.mainWeapon} onChange={(e) => set('mainWeapon', e.target.value)}
              placeholder="예: SKS - 탐색자" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>서브 무기</label>
            <input value={form.subWeapon} onChange={(e) => set('subWeapon', e.target.value)}
              placeholder="예: 리커브석궁" style={inputStyle} />
          </div>
        </div>

        {/* 동적 배열들 */}
        <DynList label="TUNING" field="tuning" accent="#88ccff" placeholder="예: 안크크" />
        <DynList label="INFECTION" field="infections" accent="#cc88ff" placeholder="예: 저주인형" />
        <DynList label="DOPING" field="doping" accent="#44ff88" placeholder="예: 에드, 아드" />
      </SectionCard>

      {/* ═══ 섹션 2: 방어구 & 가죽 장비 ═══ */}
      <SectionCard number="02" title="방어구 & 가죽 장비" accent="#ffd700">
        {/* 방어구 세트 */}
        <div style={{ marginBottom: 13 }}>
          <label style={labelStyle}>방어구 세트</label>
          <input value={form.armorSet} onChange={(e) => set('armorSet', e.target.value)}
            placeholder="예: 화이트크래시 상의" style={inputStyle} />
        </div>

        {/* 방어구 옵션 */}
        <DynList label="ARMOR OPTIONS" field="armorOptions" accent="#ffd700" placeholder="예: 세이버3 + 어둠2" />

        {/* 가죽 장비 */}
        <div style={{ marginBottom: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <label style={{ ...labelStyle, color: '#c8a87c', marginBottom: 0 }}>LEATHER</label>
            <button type="button" onClick={() => addObjArr('leather', { part: '', name: '' })} style={addBtnStyle}><Icons.Plus /> 추가</button>
          </div>
          {form.leather.map((l, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 32px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <input value={l.part} onChange={(e) => updateObjArr('leather', i, 'part', e.target.value)}
                placeholder="부위" style={inputStyle} />
              <input value={l.name} onChange={(e) => updateObjArr('leather', i, 'name', e.target.value)}
                placeholder="이름" style={inputStyle} />
              {form.leather.length > 1 && (
                <button type="button" onClick={() => removeObjArr('leather', i)} style={removeBtnStyle}><Icons.X /></button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ═══ 섹션 3: 모듈 구성 ═══ */}
      <SectionCard number="03" title="모듈 구성" accent="#ffaa44">
        {/* 모듈 */}
        <DynList label="MODULES" field="modules" accent="#ffaa44" placeholder="예: 섬광 프로스트 볼텍스" />

        {/* 접미사 테이블 */}
        <div style={{ marginBottom: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...labelStyle, color: '#ffaa44', marginBottom: 0 }}>SUFFIX TABLE</label>
            <button type="button" onClick={() => addObjArr('suffixes', { part: '', suffix: '', keyword: '', type: '섬광' })} style={addBtnStyle}><Icons.Plus /> 추가</button>
          </div>

          {/* 헤더 */}
          <div className="suffix-row" style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 80px 32px', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>부위</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>접미사</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>키워드</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>타입</span>
            <span />
          </div>

          {form.suffixes.map((s, i) => (
            <div key={i} className="suffix-row" style={{
              display: 'grid', gridTemplateColumns: '90px 1fr 1fr 80px 32px',
              gap: 6, marginBottom: 6, alignItems: 'center',
            }}>
              <input value={s.part} onChange={(e) => updateObjArr('suffixes', i, 'part', e.target.value)}
                placeholder="무기" style={inputStyle} />
              <input value={s.suffix} onChange={(e) => updateObjArr('suffixes', i, 'suffix', e.target.value)}
                placeholder="접미사명" style={inputStyle} />
              <input value={s.keyword} onChange={(e) => updateObjArr('suffixes', i, 'keyword', e.target.value)}
                placeholder="키워드" style={inputStyle} />
              <select value={s.type} onChange={(e) => updateObjArr('suffixes', i, 'type', e.target.value)}
                style={{
                  padding: '9px 6px', background: 'var(--bg-tertiary)',
                  border: `1px solid ${typeColor(s.type)}30`,
                  borderRadius: 8, color: typeColor(s.type),
                  fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
                  outline: 'none', cursor: 'pointer',
                }}>
                {suffixTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {form.suffixes.length > 1 && (
                <button type="button" onClick={() => removeObjArr('suffixes', i)} style={removeBtnStyle}><Icons.X /></button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ═══ 섹션 4: 노트 & 태그 ═══ */}
      <SectionCard number="04" title="노트 & 태그" accent="#88ccff">
        {/* 태그 토글 */}
        <div style={{ marginBottom: 13 }}>
          <label style={labelStyle}>태그</label>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {tagOptions.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                style={{
                  padding: '4px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: '1px solid', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
                  background: form.tags.includes(tag) ? '#88ccff' : 'transparent',
                  color: form.tags.includes(tag) ? '#000' : 'var(--text-muted)',
                  borderColor: form.tags.includes(tag) ? '#88ccff' : 'var(--border)',
                }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 노트 */}
        <TextArea label="노트 / 메모" value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="빌드 설명, 주의사항, 팁 등..."
          style={{ minHeight: 120 }} />
      </SectionCard>

      {/* ── 에러 메시지 ── */}
      {error && (
        <div style={{
          padding: '12px 16px', background: 'rgba(255,68,68,0.06)',
          border: '1px solid rgba(255,68,68,0.15)', borderRadius: 10,
          color: '#ff4444', fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* ── 제출 ── */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 8,
        padding: '20px 0', borderTop: '1px solid var(--border)', marginTop: 8,
      }}>
        <Button variant="secondary" onClick={onBack}>취소</Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? '저장 중...' : '빌드 저장'}
        </Button>
      </div>
    </div>
  );
}
