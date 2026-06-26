import type { APIRoute } from 'astro';
import { insertLead, type LeadRow } from '../../lib/leads';
import { sendEmail } from '../../lib/email';
import { buildDeliveryEmail } from '../../lib/email-templates';

export const prerender = false; // endpoint server (Vercel function, runtime Node)

const sha256 = async (s: string): Promise<string> => {
  const data = new TextEncoder().encode(s.trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

// mapeia o "sample" legado do front pra chave de isca canônica
const iscaFrom = (isca?: string, sample?: string): string => {
  if (isca) return isca;
  if (sample === 'quiz') return 'quiz';
  if (sample === '7-do-arsenal') return 'arsenal-7';
  return 'arsenal-7';
};

/**
 * Captura de lead da isca:
 *  1) PERSISTE no Supabase (msc-hub) — insert-first, nunca perde o lead (resolve B3)
 *  2) ENTREGA por e-mail via Resend, template conforme a isca (resolve B2)
 *  3) dispara Meta CAPI "Lead" (dedup com o Pixel pelo event_id)
 * Segredos lidos via process.env (NÃO import.meta.env — em serverless viraria undefined).
 * Tudo best-effort: a rota sempre responde 200 e nunca quebra o funil.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: any = {};
  try { body = await request.json(); } catch { /* noop */ }

  const {
    name, email, phone, profissao, event_id, attribution, fbp, fbc, client_id,
    isca: iscaRaw, variant, quiz_result, sample, source_surface,
  } = body || {};
  if (!email) return new Response(JSON.stringify({ ok: false, error: 'email_required' }), { status: 400 });

  const isca = iscaFrom(iscaRaw, sample);
  const variante = (variant === 'B' || variant === 'A') ? variant : (isca === 'quiz' ? 'B' : 'A');
  const a = attribution || {};
  const ua = request.headers.get('user-agent') || '';
  const ip = clientAddress || '';

  // 1) Persiste o lead (insert-first)
  const row: LeadRow = {
    email, whatsapp: phone || null, nome: name || null, profissao: profissao || null,
    isca, variante, quiz_result: quiz_result || null,
    gclid: a.gclid || null, fbclid: a.fbclid || null,
    utm_source: a.utm_source || null, utm_medium: a.utm_medium || null,
    utm_campaign: a.utm_campaign || null, utm_content: a.utm_content || null, utm_term: a.utm_term || null,
    ga_client_id: client_id || null, fbp: fbp || null, fbc: fbc || null,
    event_id: event_id || null, source_surface: source_surface || 'lead_lp',
    user_agent: ua, ip, email_status: 'queued',
  };
  const saved = await insertLead(row);
  if (!saved.ok) console.error('[lead] supabase insert falhou:', saved.error);

  // 2) Entrega por e-mail (Resend), best-effort
  const mail = buildDeliveryEmail({ email, profissao, isca, quiz_result });
  if (mail) {
    const sent = await sendEmail({ to: email, subject: mail.subject, parts: mail.parts, tags: mail.tags });
    if (!sent.ok) console.error('[lead] resend envio falhou:', sent.error);
  }

  // 3) Meta CAPI "Lead" (dedup com o Pixel pelo event_id)
  const pixel = process.env.PUBLIC_FB_PIXEL_ID;
  const capiToken = process.env.FB_CAPI_TOKEN;
  if (pixel && capiToken) {
    try {
      const user_data: Record<string, unknown> = { client_user_agent: ua, client_ip_address: ip };
      if (email) user_data.em = [await sha256(String(email))];
      if (phone) user_data.ph = [await sha256(String(phone).replace(/\D/g, ''))];
      if (fbp) user_data.fbp = fbp;
      if (fbc) user_data.fbc = fbc;
      else if (a.fbclid) user_data.fbc = `fb.1.${Date.now()}.${a.fbclid}`;

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
            custom_data: { currency: 'BRL', value: 5, isca, variant: variante },
          }],
        }),
      });
    } catch { /* best-effort */ }
  }

  // 4) Webhook/CRM opcional (legado) — não bloqueia
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try { await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...row, ts: new Date().toISOString() }) }); }
    catch { /* noop */ }
  }

  return new Response(JSON.stringify({ ok: true, persisted: saved.ok }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
