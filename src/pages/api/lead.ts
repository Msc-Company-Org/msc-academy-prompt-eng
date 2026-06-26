import type { APIRoute } from 'astro';

export const prerender = false; // endpoint server (Vercel function)

const sha256 = async (s: string): Promise<string> => {
  const data = new TextEncoder().encode(s.trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Captura de lead da isca:
 *  - (opcional) grava o lead num webhook/CRM (LEAD_WEBHOOK_URL) p/ reconciliar a venda depois
 *  - dispara Meta CAPI "Lead" (mesmo event_id do Pixel -> dedup) se FB_CAPI_TOKEN/FB_PIXEL_ID setados
 * Tudo é best-effort: se faltar env, a rota responde 200 e não quebra o funil.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: any = {};
  try { body = await request.json(); } catch { /* noop */ }

  const { name, email, phone, profissao, event_id, attribution, fbp, fbc, client_id } = body || {};
  if (!email) return new Response(JSON.stringify({ ok: false, error: 'email_required' }), { status: 400 });

  const lead = {
    name, email, phone, profissao, event_id, client_id,
    attribution, fbp, fbc,
    ua: request.headers.get('user-agent') || '',
    ip: clientAddress || '',
    ts: new Date().toISOString(),
  };

  // 1) Encaminha pro seu CRM/automação (n8n, Make, planilha, webhook) — opcional
  const hook = import.meta.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try { await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) }); }
    catch { /* não bloqueia o usuário */ }
  }

  // 2) Meta CAPI "Lead" (dedup com o Pixel pelo event_id)
  const pixel = import.meta.env.PUBLIC_FB_PIXEL_ID;
  const capiToken = import.meta.env.FB_CAPI_TOKEN;
  if (pixel && capiToken) {
    try {
      const user_data: Record<string, unknown> = {
        client_user_agent: lead.ua,
        client_ip_address: lead.ip,
      };
      if (email) user_data.em = [await sha256(String(email))];
      if (phone) user_data.ph = [await sha256(String(phone).replace(/\D/g, ''))];
      if (fbp) user_data.fbp = fbp;
      if (fbc) user_data.fbc = fbc;
      else if (attribution?.fbclid) user_data.fbc = `fb.1.${Date.now()}.${attribution.fbclid}`;

      await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${capiToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [{
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            event_id,
            action_source: 'website',
            event_source_url: request.headers.get('referer') || undefined,
            user_data,
            custom_data: { currency: 'BRL', value: 5 },
          }],
        }),
      });
    } catch { /* best-effort */ }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
