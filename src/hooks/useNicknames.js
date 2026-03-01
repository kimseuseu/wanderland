'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// 모든 봇 서버의 멤버 닉네임을 통합 조회하여 discordId → 서버 닉네임 매핑 제공
// 주 서버(DISCORD_GUILD_ID) 닉네임이 우선 적용됨
export function useNicknames() {
  const { data: session } = useSession();
  const [nicknameMap, setNicknameMap] = useState(new Map());

  useEffect(() => {
    if (!session?.isMember) return;
    fetch('/api/nicknames')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setNicknameMap(new Map(Object.entries(data)));
        }
      })
      .catch(() => {});
  }, [session?.isMember]);

  const resolve = useCallback((discordId, fallback) => {
    if (!discordId) return fallback || '익명';
    return nicknameMap.get(discordId) || fallback || '익명';
  }, [nicknameMap]);

  return resolve;
}
