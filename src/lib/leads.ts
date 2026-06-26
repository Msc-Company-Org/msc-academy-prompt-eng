/**
 * Persistência de lead no Supabase (projeto msc-hub, online — sa-east-1) via PostgREST.
 * Usa a chave PUBLICÁVEL (papel anon) — server-side em /api/lead. A tabela tem RLS on
 * com policy SÓ de INSERT p/ anon: a chave não lê nem altera nada (blast radius mínimo).
 * Sem SDK: chamada via fetch puro (nenhuma dependência npm nova).
 */

export type LeadRow = {
  email: string;
  whatsapp?: string | null;
  nome?: string | null;
  profissao?: string | null;
  isca: string; // 'arsenal-7' | 'quiz' | 'guia-memoria' | 'starter-mcp'
  variante?: string | null; // 'A' | 'B'
  quiz_result?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  ga_client_id?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  event_id?: string | null;
  email_status?: string | null;
  source_surface?: string | null;
  user_agent?: string | null;
  ip?: string | null;
};

async function insertRow(table: string, row: Record<string, unknown>): Promise<{ ok: boolean; duplicate?: boolean; error?: string }> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY; // chave publicável (anon)
  if (!url || !key) return { ok: false, error: 'supabase_env_missing' };
  try {
    const res = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    });
    if (res.status === 409) return { ok: true, duplicate: true }; // unique violation → já existe
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return { ok: false, error: `supabase_${res.status}:${txt.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: `supabase_fetch:${e?.message || 'err'}` };
  }
}

/**
 * Insere o lead (insert-first: nunca perde o lead).
 * Duplicata (mesmo email+isca → unique violation 409) é tratada como sucesso.
 */
export function insertLead(row: LeadRow) {
  return insertRow('leads', { ...row, email: String(row.email).trim().toLowerCase() });
}

export type PurchaseRow = {
  stripe_session_id: string;
  email?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  produto?: string | null;
  status?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  ga_client_id?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

/**
 * Insere a compra. Idempotência: duplicata (mesmo stripe_session_id) volta {duplicate:true}
 * — o webhook usa isso pra NÃO disparar purchase/entrega duas vezes.
 */
export function insertPurchase(row: PurchaseRow) {
  return insertRow('purchases', { ...row, email: row.email ? String(row.email).trim().toLowerCase() : null });
}
