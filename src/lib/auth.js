import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireMember() {
  const session = await getSession();
  if (!session || !session.isMember) {
    return null;
  }
  return session;
}

/**
 * 세션 사용자가 해당 항목의 소유자인지 확인합니다.
 * @param {object} session - NextAuth 세션
 * @param {object} entry - DB 행 (discordId, reporter/author 포함)
 * @param {string} nameField - 'reporter' (블랙리스트) 또는 'author' (빌드)
 * @returns {boolean}
 */
export function isOwner(session, entry, nameField = 'reporter') {
  if (!session || !entry) return false;
  // 1차: Discord ID 매칭
  if (entry.discordId && session.discordId) {
    return entry.discordId === session.discordId;
  }
  // 2차 (레거시): discordId 없는 기존 항목은 이름으로 폴백
  if (!entry.discordId && session.user?.name) {
    return entry[nameField] === session.user.name;
  }
  return false;
}
