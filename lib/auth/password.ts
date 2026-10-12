import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// scrypt from node itself, so we don't pull in bcrypt just for a demo.
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
