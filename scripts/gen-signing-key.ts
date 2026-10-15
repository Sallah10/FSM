import { randomUUID } from 'node:crypto';

// Generates an EC P-256 (ES256) keypair: the private JWK goes in .env.local, the
// public half into Supabase under Settings -> JWT signing keys.
async function main() {
  const pair = (await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify'],
  )) as CryptoKeyPair;

  const kid = randomUUID();
  const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);

  const priv = { kty: 'EC', crv: 'P-256', x: privateJwk.x, y: privateJwk.y, d: privateJwk.d, kid };
  const pub = { kty: 'EC', crv: 'P-256', x: publicJwk.x, y: publicJwk.y, kid };

  console.log('\n=== 1. Add to .env.local (single line) ===');
  console.log(`SUPABASE_JWT_PRIVATE_KEY=${JSON.stringify(priv)}`);
  console.log('\n=== 2. Import into Supabase ===');
  console.log('Dashboard -> Settings -> JWT signing keys -> Add new key -> import this JSON:');
  console.log(JSON.stringify(priv));
  console.log('\n=== 3. Public key (sanity check; should appear in your JWKS) ===');
  console.log(JSON.stringify(pub));
  console.log('\nAfter importing, click "Rotate key" so the public key is trusted.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
