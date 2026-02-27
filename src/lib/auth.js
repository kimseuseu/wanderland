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
