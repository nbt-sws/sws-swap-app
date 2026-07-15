/**
 * Simple password hashing using Web Crypto API (available in Workers)
 * For local scripts, we use Node crypto fallback
 */

export async function hash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'sws-swap-salt-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verify(password: string, hashValue: string): Promise<boolean> {
  const hashed = await hash(password);
  return hashed === hashValue;
}
