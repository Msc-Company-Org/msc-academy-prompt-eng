/**
 * Envio de e-mail via Resend + template HTML reutilizável (identidade "Tinta Floresta").
 * Server-side apenas. Best-effort: se faltar env, não envia e retorna {ok:false}.
 */

export const SITE = 'https://arsenal.msc-academy.com.br';
const UNSUB_MAILTO = 'sair@msc-academy.com.br';

export function siteUrlFromEnv(): string {
  return process.env.PUBLIC_SITE_URL || SITE;
}

export type EmailParts = {
  preheader: string;     // subtítulo eficiente que aparece na inbox antes de abrir
  heroTitulo: string;    // H1 de impacto
  corpoHtml: string;     // parágrafos <p>…</p>
  ctaLabel: string;
  ctaUrl: string;
  psHtml?: string;
  unsubUrl: string;
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Monta o HTML completo (table-based, mobile-first, botão coral bulletproof p/ Outlook). */
export function renderEmail(p: EmailParts): string {
  return `<!doctype html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(p.heroTitulo)}</title>
<style>
  @media (max-width:620px){ .container{width:100%!important} .px{padding-left:20px!important;padding-right:20px!important} .btn a{display:block!important} }
  a{color:#45611F}
</style>
</head>
<body style="margin:0;padding:0;background:#FAF7F0;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#FAF7F0;">${esc(p.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0"
             style="width:600px;max-width:600px;background:#FAF7F0;border:1px solid rgba(22,51,0,.10);border-radius:16px;overflow:hidden;">
        <tr><td class="px" style="padding:24px 32px 8px;">
          <span style="font:700 20px Georgia,'Times New Roman',serif;color:#163300;letter-spacing:.2px;">MSC Academy</span>
          <span style="font:600 11px Arial,sans-serif;color:#45611F;letter-spacing:.12em;text-transform:uppercase;"> · Arsenal de IA</span>
        </td></tr>
        <tr><td class="px" style="padding:12px 32px 0;">
          <h1 style="margin:0;font:700 27px/1.2 Georgia,'Times New Roman',serif;color:#163300;">${esc(p.heroTitulo)}</h1>
        </td></tr>
        <tr><td class="px" style="padding:16px 32px 4px;font:16px/1.7 Arial,Helvetica,sans-serif;color:#26331c;">
          ${p.corpoHtml}
        </td></tr>
        <tr><td class="px btn" align="center" style="padding:12px 32px 6px;">
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${p.ctaUrl}" style="height:52px;v-text-anchor:middle;width:340px;" arcsize="20%" fillcolor="#FF4F40" stroke="f"><center><![endif]-->
          <a href="${p.ctaUrl}" style="background:#FF4F40;color:#FFF7F0;display:inline-block;font:700 16px Arial,sans-serif;line-height:52px;text-align:center;text-decoration:none;border-radius:10px;padding:0 28px;min-width:240px;">${esc(p.ctaLabel)} &rarr;</a>
          <!--[if mso]></center></v:roundrect><![endif]-->
          <div style="margin-top:10px;font:13px Arial,sans-serif;color:#5C6B3C;">Salva este e-mail &middot; você vai querer voltar nele</div>
        </td></tr>
        ${p.psHtml ? `<tr><td class="px" style="padding:8px 32px 4px;font:14px/1.6 Arial,sans-serif;color:#45611F;">${p.psHtml}</td></tr>` : ''}
        <tr><td class="px" style="padding:12px 32px 0;font:15px/1.6 Arial,sans-serif;color:#163300;">&mdash; Moisés &middot; MSC Academy</td></tr>
        <tr><td class="px" style="padding:24px 32px 28px;border-top:1px solid rgba(22,51,0,.10);font:12px/1.7 Arial,sans-serif;color:#5C6B3C;">
          Você recebeu este e-mail porque pediu material gratuito do Arsenal de IA em arsenal.msc-academy.com.br.<br>
          MSC Academy &middot; Rio de Janeiro/RJ &middot; Brasil.<br>
          <a href="${p.unsubUrl}" style="color:#5C6B3C;text-decoration:underline;">Descadastrar</a> &middot;
          <a href="${SITE}/privacidade" style="color:#5C6B3C;">Privacidade</a><br>
          <span style="color:#8a9576;">Este produto não garante resultado financeiro. Entregamos ferramentas e a habilidade de usá-las; resultados dependem da aplicação de cada pessoa.</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Versão texto-plano (entregabilidade) a partir do corpo HTML + CTA. */
export function toPlainText(p: EmailParts): string {
  const body = p.corpoHtml
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>(?!\n)/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&middot;/g, '·').replace(/&rarr;/g, '→')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return `${p.heroTitulo}\n\n${body}\n\n${p.ctaLabel}: ${p.ctaUrl}\n\n— Moisés · MSC Academy\n\nDescadastrar: ${p.unsubUrl}`;
}

export function unsubUrlFor(email: string): string {
  return `${SITE}/descadastro?e=${encodeURIComponent(String(email).trim().toLowerCase())}`;
}

/** Envia via Resend. Best-effort. */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  parts: EmailParts;
  tags?: { name: string; value: string }[];
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM; // ex.: Moisés (MSC Academy) <arsenal@send.msc-academy.com.br>
  if (!key || !from) return { ok: false, error: 'resend_env_missing' };
  const replyTo = process.env.RESEND_REPLY_TO;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [opts.to],
        reply_to: replyTo || undefined,
        subject: opts.subject,
        html: renderEmail(opts.parts),
        text: toPlainText(opts.parts),
        headers: {
          'List-Unsubscribe': `<mailto:${UNSUB_MAILTO}?subject=sair>, <${opts.parts.unsubUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        tags: opts.tags,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, error: `resend_${res.status}:${t.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: `resend_fetch:${e?.message || 'err'}` };
  }
}
