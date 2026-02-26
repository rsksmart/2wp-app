function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const binary = atob(b64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

function importPrivateKey(pemKey: string): Promise<CryptoKey> {
  const keyData = pemToArrayBuffer(pemKey);
  return window.crypto.subtle.importKey(
    'pkcs8',
    keyData,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );
}

function base64url(source: ArrayBuffer): string {
  let str = '';
  const bytes = new Uint8Array(source);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    str += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)) as number[],
    );
  }
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlJSON(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function sha256Hex(data: string): Promise<string> {
  const enc = new TextEncoder().encode(data);
  return window.crypto.subtle.digest('SHA-256', enc).then((hashBuffer) => Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(''));
}

function generateNonce(): string {
  const arr = new Uint8Array(16);
  window.crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface JwtPayload {
  uri: string;
  nonce: string;
  iat: number;
  exp: number;
  sub: string;
  bodyHash: string;
}

interface BuildJwtOptions {
  pemKey: string;
  apiKey: string;
  uri: string;
  body?: string;
}

export async function buildJWT({
  pemKey,
  apiKey,
  uri,
  body = '',
}: BuildJwtOptions): Promise<string> {
  const privateKey = await importPrivateKey(pemKey);

  const now = Math.floor(Date.now() / 1000);
  const nonce = generateNonce();
  const bodyHash = await sha256Hex(body);

  const payload: JwtPayload = {
    uri,
    nonce,
    iat: now,
    exp: now + 30,
    sub: apiKey,
    bodyHash,
  };

  const header = { alg: 'RS256', typ: 'JWT' };

  const encodedHeader = base64urlJSON(header);
  const encodedPayload = base64urlJSON(payload);

  const toSign = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);

  const signature = await window.crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    privateKey,
    toSign,
  );

  return `${encodedHeader}.${encodedPayload}.${base64url(signature)}`;
}
