'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// 모든 봇 서버의 멤버 닉네임을 통합 조회
// byId: discordId → 서버 닉네임
// byName: 저장된 이름(username/global_name) → 서버 닉네임 (기존 데이터 역조회)
export function useNicknames() {
  const { data: session } = useSession();
  const [byId, setById] = useState(new Map());
  const [byName, setByName] = useState(new Map());

  useEffect(() => {
    if (!session?.isMember) return;
    fetch('/api/nicknames')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          if (data.byId) setById(new Map(Object.entries(data.byId)));
          if (data.byName) setByName(new Map(Object.entries(data.byName)));
        }
      })
      .catch((e) => console.warn('[nicknames] load failed:', e));
  }, [session?.isMember]);

  const resolve = useCallback((discordId, fallback) => {
    // 1순위: discordId로 직접 조회
    if (discordId) {
      const found = byId.get(discordId);
      if (found) return found;
    }

    // 2순위: 저장된 이름으로 역조회 (discordId 없는 기존 데이터)
    if (fallback && typeof fallback === 'string') {
      const found = byName.get(fallback.toLowerCase());
      if (found) return found;
    }

    return fallback || '익명';
  }, [byId, byName]);

  return resolve;
}
