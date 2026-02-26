'use client';

import { Icons } from './Icons';

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)',
        paddingTop: 68, overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 16, width: '94%', maxWidth: 620,
          maxHeight: 'calc(100vh - 90px)', overflow: 'auto', padding: '26px 28px',
          marginBottom: 24, flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontFamily: 'var(--font-display)', fontWeight: 800 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <Icons.X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 13 }}>
      {label && (
        <label style={{
          display: 'block', fontSize: 11, color: 'var(--text-secondary)',
          marginBottom: 5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          width: '100%', padding: '9px 12px',
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text-primary)',
          fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
          ...(props.style || {}),
        }}
      />
    </div>
  );
}

export function TextArea({ label, ...props }) {
  return (
    <div style={{ marginBottom: 13 }}>
      {label && (
        <label style={{
          display: 'block', fontSize: 11, color: 'var(--text-secondary)',
          marginBottom: 5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {label}
        </label>
      )}
      <textarea
        {...props}
        style={{
          width: '100%', padding: '9px 12px',
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text-primary)',
          fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
          resize: 'vertical', minHeight: 68,
          ...(props.style || {}),
        }}
      />
    </div>
  );
}

export function Button({ children, variant = 'primary', ...props }) {
  const styles = {
    primary: { background: '#fff', color: '#000', border: 'none' },
    secondary: { background: 'transparent', color: '#eee', border: '1px solid var(--border)' },
    danger: { background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid rgba(255,68,68,0.15)' },
  };
  return (
    <button
      {...props}
      style={{
        padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
        fontFamily: 'var(--font-body)', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 7,
        transition: 'all 0.2s',
        ...styles[variant],
        ...(props.style || {}),
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {children}
    </button>
  );
}

export function Tag({ children, color }) {
  const c = color || 'var(--text-secondary)';
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, color: c,
      background: `${c}12`, border: `1px solid ${c}20`,
    }}>
      {children}
    </span>
  );
}

export function Section({ icon, title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8,
        fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.03em',
      }}>
        <span>{icon}</span>{title}
      </div>
      {children}
    </div>
  );
}

export function Chip({ children, accent }) {
  const c = accent || 'var(--text-secondary)';
  return (
    <span style={{
      display: 'inline-block', padding: '4px 10px', borderRadius: 6,
      fontSize: 12, fontWeight: 600,
      background: `${c}10`, color: c, border: `1px solid ${c}18`,
      marginRight: 5, marginBottom: 4,
    }}>
      {children}
    </span>
  );
}
