import { importJWK, type JWK } from 'jose';

export interface RealtimeSigner {
  alg: 'ES256' | 'HS256';
  key: CryptoKey | Uint8Array;
  kid?: string;
}

function parsePrivateJwk(raw: string): JWK | null {
  try {
    const jwk = JSON.parse(raw) as JWK;
    if (jwk && typeof jwk === 'object' && 'd' in jwk) return jwk;
    return null;
  } catch {
    return null;
  }
}

export async function getRealtimeSigner(): Promise<RealtimeSigner | null> {
  const rawJwk = process.env.SUPABASE_JWT_PRIVATE_KEY?.trim();
  if (rawJwk) {
    const jwk = parsePrivateJwk(rawJwk);
    if (jwk) {
      const key = await importJWK(jwk, 'ES256');
      return { alg: 'ES256', key, kid: jwk.kid };
    }
  }

  const secret = process.env.SUPABASE_JWT_SECRET?.trim();
  if (secret && secret.split('.').length !== 3) {
    return { alg: 'HS256', key: new TextEncoder().encode(secret) };
  }

  return null;
}
