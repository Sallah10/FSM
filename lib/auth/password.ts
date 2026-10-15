import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// scrypt is built into Node, so there's no need for a bcrypt dependency.
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored?: string | null): boolean {
  if (!stored) return false;

  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;

  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, 'hex');

  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
