import type { APIRoute } from 'astro';
import { createCheckoutSession } from '../../lib/stripe';

export const prerender = false; // Vercel function (Node)

/**
 * Cria a sessão de checkout do Stripe e devolve { url }.
 * O front (goToCheckout) redireciona pra essa URL hospedada.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: any = {};
  try { body = await request.json(); } catch { /* noop */ }

  const { email, attribution, client_id, fbp, fbc, produto } = body || {};
  const r = await createCheckoutSession({
    email: email || undefined,
    produto: produto === 'tripwire' ? 'tripwire' : 'arsenal',
    attribution: attribution || {},
    gaClientId: client_id || undefined,
    fbp: fbp || undefined,
    fbc: fbc || undefined,
  });

  if (!r.url) {
    console.error('[checkout] falhou:', r.error);
    return new Response(JSON.stringify({ ok: false, error: r.error || 'checkout_failed' }), {
      status: 502, headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ ok: true, url: r.url }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
