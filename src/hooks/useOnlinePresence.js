'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const HEARTBEAT_INTERVAL = 60_000;  // 60초
const FETCH_INTERVAL = 30_000;      // 30초

export function useOnlinePresence() {
  const { data: session, status } = useSession();
  const [onlineUsers, setOnlineUsers] = useState([]);

  const fetchOnline = useCallback(async () => {
    try {
      const res = await fetch('/api/online');
      if (res.ok) {
        const data = await res.json();
        setOnlineUsers(Array.isArray(data) ? data : []);
      }
    } catch { /* silent */ }
  }, []);

  const sendHeartbeat = useCallback(async () => {
    try {
      await fetch('/api/online/heartbeat', { method: 'POST' });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !session) return;

    // 하트비트 먼저 전송 → 완료 후 온라인 목록 조회
    sendHeartbeat().then(() => fetchOnline());

    const heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    const fetchTimer = setInterval(fetchOnline, FETCH_INTERVAL);

    // 탭 복귀 시 즉시 갱신
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat().then(() => fetchOnline());
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(heartbeatTimer);
      clearInterval(fetchTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [status, session, sendHeartbeat, fetchOnline]);

  return onlineUsers;
}
