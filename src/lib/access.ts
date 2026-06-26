/**
 * Token de acesso à área de membros — assinado (HMAC), stateless.
 * Não precisa de leitura no banco: /membros valida a assinatura. Acesso vitalício (não expira).
 * Chave de assinatura = ACCESS_SECRET (ou, na falta, STRIPE_WEBHOOK_SECRET — ambos server-only).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

function secret(): string {
  return process.env.ACCESS_SECRET || process.env.STRIPE_WEBHOOK_SECRET || 'dev-only-insecure';
}

const b64u = (s: string) => Buffer.from(s, 'utf8').toString('base64url');
const unb64u = (s: string) => Buffer.from(s, 'base64url').toString('utf8');

export function signAccess(email: string): string {
  const payload = b64u(String(email).trim().toLowerCase());
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAccess(token: string | null | undefined): string | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return unb64u(payload);
  } catch { return null; }
}
