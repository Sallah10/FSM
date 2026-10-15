import { describe, expect, it } from 'vitest';
import {
  base32Decode,
  base32Encode,
  generateTotp,
  generateTotpSecret,
  totpUri,
  verifyTotp,
} from '@/lib/auth/totp';

// RFC 6238 test vectors. The ASCII secret "12345678901234567890" is the
// base32 value below, and the times are Unix seconds.
const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890'));

describe('base32', () => {
  it('round-trips arbitrary bytes', () => {
    const input = Buffer.from('QuickSet-secret-bytes');
    expect(base32Decode(base32Encode(input))).toEqual(input);
  });

  it('ignores padding and spacing on decode', () => {
    const encoded = base32Encode(Buffer.from('hello'));
    expect(base32Decode(`${encoded}====`)).toEqual(Buffer.from('hello'));
    expect(base32Decode(encoded.toLowerCase())).toEqual(Buffer.from('hello'));
  });
});

describe('generateTotp', () => {
  it('matches the RFC 6238 SHA-1 vectors', () => {
    const vectors: Array<[number, string]> = [
      [59, '94287082'],
      [1111111109, '07081804'],
      [1111111111, '14050471'],
      [1234567890, '89005924'],
      [2000000000, '69279037'],
      [20000000000, '65353130'],
    ];
    for (const [seconds, expected] of vectors) {
      expect(generateTotp(RFC_SECRET, seconds * 1000, { digits: 8 })).toBe(expected);
    }
  });

  it('defaults to 6 digits', () => {
    const token = generateTotp(RFC_SECRET, 59_000);
    expect(token).toBe('287082');
  });
});

describe('verifyTotp', () => {
  it('accepts the current token', () => {
    const now = Date.now();
    const token = generateTotp(RFC_SECRET, now);
    expect(verifyTotp(RFC_SECRET, token)).toBe(true);
  });

  it('tolerates one step of clock drift in either direction', () => {
    const past = generateTotp(RFC_SECRET, Date.now() - 30_000);
    const future = generateTotp(RFC_SECRET, Date.now() + 30_000);
    expect(verifyTotp(RFC_SECRET, past)).toBe(true);
    expect(verifyTotp(RFC_SECRET, future)).toBe(true);
  });

  it('rejects tokens outside the window', () => {
    const stale = generateTotp(RFC_SECRET, Date.now() - 5 * 60_000);
    expect(verifyTotp(RFC_SECRET, stale)).toBe(false);
  });

  it('rejects malformed tokens', () => {
    expect(verifyTotp(RFC_SECRET, '')).toBe(false);
    expect(verifyTotp(RFC_SECRET, 'abcdef')).toBe(false);
    expect(verifyTotp(RFC_SECRET, '12345')).toBe(false);
    expect(verifyTotp(RFC_SECRET, '1234567')).toBe(false);
  });
});

describe('generateTotpSecret', () => {
  it('produces a unique base32 secret', () => {
    const a = generateTotpSecret();
    const b = generateTotpSecret();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Z2-7]+$/);
    expect(base32Decode(a)).toHaveLength(20);
  });
});

describe('totpUri', () => {
  it('builds an otpauth URI with issuer and secret', () => {
    const uri = totpUri(RFC_SECRET, 'demo@quickset.com');
    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain(`secret=${RFC_SECRET}`);
    expect(uri).toContain('issuer=QuickSet');
    expect(uri).toContain('digits=6');
  });
});
