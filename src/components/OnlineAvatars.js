'use client';

import { useState, useRef, useEffect } from 'react';
import { useNicknames } from '@/hooks/useNicknames';

export default function OnlineAvatars({ users = [] }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const wrapRef = useRef(null);
  const resolveNick = useNicknames();

  const MAX_DISPLAY = 5;
  const displayed = users.slice(0, MAX_DISPLAY);
  const overflow = users.length - MAX_DISPLAY;

  // 바깥 클릭 시 툴팁 닫기
  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTooltip]);

  if (!users.length) return null;

  return (
    <div
      ref={wrapRef}
      className="online-avatars-wrap"
      style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}
    >
      {/* 녹색 dot */}
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: '#44ff88',
        boxShadow: '0 0 6px rgba(68,255,136,0.5)',
        flexShrink: 0,
      }} />

      {/* 아바타 스택 */}
      <div
        style={{
          display: 'flex', alignItems: 'center', cursor: 'pointer',
        }}
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {displayed.map((user, i) => (
          <div
            key={user.discord_id}
            style={{
              width: 22, height: 22, borderRadius: '50%',
              border: '2px solid rgba(10,10,10,0.92)',
              marginLeft: i === 0 ? 0 : -8,
              zIndex: MAX_DISPLAY - i,
              position: 'relative', flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: '#5865F2', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: '#fff',
              }}>
                {(user.username || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
        ))}

        {/* 인원수 */}
        <span style={{
          fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
          marginLeft: 4, fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap',
        }}>
          {users.length}
        </span>
      </div>

      {/* 툴팁 */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, padding: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 300,
            minWidth: 160, maxWidth: 220,
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
            padding: '2px 6px 6px', borderBottom: '1px solid var(--border)',
            marginBottom: 4, fontFamily: 'var(--font-mono)',
          }}>
            접속 중 · {users.length}명
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {users.map((user) => (
              <div
                key={user.discord_id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '4px 6px', borderRadius: 6,
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  flexShrink: 0, overflow: 'hidden',
                }}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: '#5865F2', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, fontWeight: 700, color: '#fff',
                    }}>
                      {(user.username || '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {resolveNick(user.discord_id, user.username)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
