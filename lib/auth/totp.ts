import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Time-based One-Time Passwords (RFC 6238): works with Google Authenticator,
// Authy and 1Password. SHA-1, 6 digits, 30s step by default.

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export interface TotpOptions {
  digits?: number;
  step?: number;
  window?: number;
}

export function base32Encode(input: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of input) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(bytes = 20): string {
  return base32Encode(randomBytes(bytes));
}

function hotp(secret: string, counter: number, digits: number): string {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', key).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return (binary % 10 ** digits).toString().padStart(digits, '0');
}

export function generateTotp(
  secret: string,
  time = Date.now(),
  { digits = 6, step = 30 }: TotpOptions = {},
): string {
  const counter = Math.floor(time / 1000 / step);
  return hotp(secret, counter, digits);
}

// Accepts the previous/next step too, to tolerate clock drift.
export function verifyTotp(
  secret: string,
  token: string,
  { digits = 6, step = 30, window = 1 }: TotpOptions = {},
): boolean {
  const candidate = token.replace(/\s/g, '');
  if (candidate.length !== digits || !/^\d+$/.test(candidate)) return false;

  const counter = Math.floor(Date.now() / 1000 / step);
  for (let offset = -window; offset <= window; offset++) {
    const expected = hotp(secret, counter + offset, digits);
    const a = Buffer.from(expected);
    const b = Buffer.from(candidate);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

export function totpUri(
  secret: string,
  accountName: string,
  issuer = 'QuickSet',
): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
