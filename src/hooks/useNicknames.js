'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Fetches Discord server members once and provides discordId → server nickname resolution.
export function useNicknames() {
  const { data: session } = useSession();
  const guildId = session?.guildId;
  const [members, setMembers] = useState(null);

  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/discord-members?action=members&guildId=${guildId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.members) setMembers(data.members); })
      .catch(() => {});
  }, [guildId]);

  const nicknameMap = useMemo(() => {
    if (!members) return new Map();
    const map = new Map();
    for (const m of members) {
      map.set(m.id, m.displayName);
    }
    return map;
  }, [members]);

  const resolve = useCallback((discordId, fallback) => {
    if (!discordId) return fallback || '익명';
    return nicknameMap.get(discordId) || fallback || '익명';
  }, [nicknameMap]);

  return resolve;
}
