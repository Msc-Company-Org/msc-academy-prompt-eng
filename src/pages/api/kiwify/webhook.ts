import type { APIRoute } from 'astro';
import crypto from 'node:crypto';

export const prerender = false; // endpoint server (Vercel function, runtime Node)

/**
 * Webhook Kiwify — purchase AUTORITATIVO (a venda acontece no Kiwify, não na landing).
 * Em "compra aprovada": dispara GA4 (Measurement Protocol) + Meta CAPI Purchase.
 * Google Ads Enhanced Conversion offline (gclid) fica como TODO (via sGTM ou Google Ads API).
 * Idempotência por order_id é TODO (plugar Supabase/KV quando houver volume).
 *
 * [SUP] Confirmar no painel do produto Kiwify: header de assinatura, nomes dos campos
 * (order_status/order_id/Customer/Commissions) e os campos custom de tracking (s1/s2/s3).
 */

const sha256 = (s: string) => crypto.createHash('sha256').update(s.trim().toLowerCase()).digest('hex');

function verifyKiwify(raw: string, signature: string | null): boolean {
  const token = import.meta.env.KIWIFY_WEBHOOK_TOKEN;
  if (!token) return true; // sem token configurado: não bloqueia (MVP) — configurar antes de produção real
  if (!signature) return false;
  const h = crypto.createHmac('sha1', token).update(raw).digest('hex');
  // comparação em tempo constante
  try { return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(h)); } catch { return false; }
}

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.text();
  const signature = request.headers.get('x-kiwify-signature'); // [SUP] confirmar header real
  if (!verifyKiwify(raw, signature)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_signature' }), { status: 401 });
  }

  let body: any = {};
  try { body = JSON.parse(raw); } catch { return new Response(JSON.stringify({ ok: false }), { status: 400 }); }

  const status = body.order_status || body.status;
  const paid = status === 'paid' || status === 'approved' || status === 'compra_aprovada';
  if (!paid) return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });

  const orderId = String(body.order_id || body.id || '');
  const value = Number(body.Commissions?.charge_amount ?? body.charge_amount ?? body.amount ?? 97);
  const email = body.Customer?.email || body.customer?.email;
  const phone = String(body.Customer?.mobile || body.customer?.phone || '').replace(/\D/g, '');
  const tracking = body.tracking || body.utm || {};
  const fbclid = String(tracking.s2 || '').replace('fbclid:', '') || undefined;
  const clientId = String(tracking.s3 || '').replace('cid:', '') || body.client_id || undefined;

  const GA_ID = import.meta.env.GA_ID;
  const GA_API_SECRET = import.meta.env.GA_API_SECRET;
  const FB_PIXEL_ID = import.meta.env.PUBLIC_FB_PIXEL_ID;
  const FB_CAPI_TOKEN = import.meta.env.FB_CAPI_TOKEN;

  const items = [{ item_id: 'curso-prompt-97', item_name: 'Prompt Profissional', price: value, quantity: 1 }];

  // 1) GA4 Measurement Protocol -> purchase
  if (GA_ID && GA_API_SECRET && clientId) {
    try {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_ID}&api_secret=${GA_API_SECRET}`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: clientId,
          events: [{ name: 'purchase', params: { transaction_id: orderId, value, currency: 'BRL', items } }],
        }),
      });
    } catch { /* best-effort */ }
  }

  // 2) Meta CAPI Purchase (eventID = orderId p/ dedup com o Pixel da /obrigado)
  if (FB_PIXEL_ID && FB_CAPI_TOKEN) {
    try {
      const user_data: Record<string, unknown> = {};
      if (email) user_data.em = [sha256(String(email))];
      if (phone) user_data.ph = [sha256(phone)];
      if (fbclid) user_data.fbc = `fb.1.${Date.now()}.${fbclid}`;
      await fetch(`https://graph.facebook.com/v21.0/${FB_PIXEL_ID}/events?access_token=${FB_CAPI_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [{
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            event_id: orderId,
            action_source: 'website',
            user_data,
            custom_data: { currency: 'BRL', value, content_ids: ['curso-prompt-97'] },
          }],
        }),
      });
    } catch { /* best-effort */ }
  }

  // 3) TODO: Google Ads Enhanced Conversion offline (gclid em tracking.s1) via sGTM/Google Ads API
  // 4) TODO: persistir venda (gclid/fbclid/utm -> orderId -> value) + idempotência por orderId

  return new Response(JSON.stringify({ ok: true, orderId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
