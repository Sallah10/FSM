import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('password hashing', () => {
  it('verifies a correct password', () => {
    const hash = hashPassword('demo123');
    expect(verifyPassword('demo123', hash)).toBe(true);
  });

  it('rejects a wrong password', () => {
    const hash = hashPassword('demo123');
    expect(verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('salts each hash so the same password looks different', () => {
    expect(hashPassword('same')).not.toBe(hashPassword('same'));
  });

  it('rejects a missing or malformed hash', () => {
    expect(verifyPassword('x', null)).toBe(false);
    expect(verifyPassword('x', 'not-a-valid-hash')).toBe(false);
  });
});
