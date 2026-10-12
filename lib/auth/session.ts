import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Small helper so route handlers can just ask "who is calling?".
export function getApiSession() {
  return getServerSession(authOptions);
}
