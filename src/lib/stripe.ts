/**
 * Stripe interno (sem SDK): cria Checkout Session via REST + verifica assinatura do webhook.
 * Pagamento "tudo interno" — checkout hospedado pelo Stripe, entrega e tracking no nosso domínio.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

const API = 'https://api.stripe.com/v1';

export function siteUrl(): string {
  return process.env.PUBLIC_SITE_URL || 'https://arsenal.msc-academy.com.br';
}

/** Preço atual do lote (em centavos). Lote de fundador = R$97. Ajustável por env quando o lote virar. */
export function currentPriceCents(produto: 'arsenal' | 'tripwire' = 'arsenal'): number {
  if (produto === 'tripwire') return Number(process.env.ARSENAL_TRIPWIRE_CENTS || 2700);
  return Number(process.env.ARSENAL_PRICE_CENTS || 9700);
}

type Attribution = {
  gclid?: string; fbclid?: string;
  utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string; utm_term?: string;
};

/** Cria a sessão de checkout e devolve a URL hospedada do Stripe. */
export async function createCheckoutSession(opts: {
  email?: string;
  produto?: 'arsenal' | 'tripwire';
  attribution?: Attribution;
  gaClientId?: string;
  fbp?: string;
  fbc?: string;
}): Promise<{ url?: string; error?: string }> {
  const key = process.env.STRIPE_SECRET_KEY;
  const productId = process.env.STRIPE_PRODUCT_ID;
  if (!key) return { error: 'stripe_key_missing' };

  const produto = opts.produto || 'arsenal';
  const amount = currentPriceCents(produto);
  const site = siteUrl();
  const a = opts.attribution || {};

  const p = new URLSearchParams();
  p.set('mode', 'payment');
  p.set('locale', 'pt-BR');
  p.set('line_items[0][quantity]', '1');
  p.set('line_items[0][price_data][currency]', 'brl');
  p.set('line_items[0][price_data][unit_amount]', String(amount));
  if (productId) p.set('line_items[0][price_data][product]', productId);
  else p.set('line_items[0][price_data][product_data][name]', produto === 'tripwire' ? 'Kit Conteúdo na Veia' : 'Arsenal de IA');
  p.set('success_url', `${site}/obrigado?session_id={CHECKOUT_SESSION_ID}`);
  p.set('cancel_url', `${site}/?checkout=cancelado`);
  if (opts.email) p.set('customer_email', opts.email);
  // metadata (vira o elo lead↔venda no webhook)
  const meta: Record<string, string | undefined> = {
    produto, gclid: a.gclid, fbclid: a.fbclid,
    utm_source: a.utm_source, utm_medium: a.utm_medium, utm_campaign: a.utm_campaign,
    utm_content: a.utm_content, utm_term: a.utm_term,
    ga_client_id: opts.gaClientId, fbp: opts.fbp, fbc: opts.fbc,
  };
  for (const [k, v] of Object.entries(meta)) if (v) p.set(`metadata[${k}]`, String(v).slice(0, 480));

  try {
    const res = await fetch(`${API}/checkout/sessions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: p.toString(),
    });
    const data: any = await res.json();
    if (!res.ok) return { error: `stripe_${res.status}:${data?.error?.message || ''}`.slice(0, 200) };
    return { url: data.url };
  } catch (e: any) {
    return { error: `stripe_fetch:${e?.message || 'err'}` };
  }
}

/** Verifica a assinatura do webhook Stripe (Stripe-Signature: t=..,v1=..). */
export function verifyStripeSignature(rawBody: string, sigHeader: string | null, secret: string | undefined): boolean {
  if (!sigHeader || !secret) return false;
  const parts = Object.fromEntries(sigHeader.split(',').map((kv) => kv.split('=') as [string, string]));
  const t = parts['t'];
  const v1 = parts['v1'];
  if (!t || !v1) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  try {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(v1, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}
