/**
 * Tracking client-side da landing (perpétuo): atribuição + dataLayer + Consent Mode v2.
 * Portado dos snippets do plano de tracking (07-tracking.md) para Astro (vanilla, sem framework).
 * Todos os eventos vão pro dataLayer; o GTM (PUBLIC_GTM_ID) roteia GA4 + Ads + Meta.
 */

export type Attribution = {
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  utm_content?: string; utm_term?: string; gclid?: string; fbclid?: string;
};

const ATTR_KEY = 'msc_attr';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  const fresh: Attribution = {
    utm_source: p.get('utm_source') || undefined,
    utm_medium: p.get('utm_medium') || undefined,
    utm_campaign: p.get('utm_campaign') || undefined,
    utm_content: p.get('utm_content') || undefined,
    utm_term: p.get('utm_term') || undefined,
    gclid: p.get('gclid') || p.get('gbraid') || p.get('wbraid') || undefined,
    fbclid: p.get('fbclid') || undefined,
  };
  const hasNew = Object.values(fresh).some(Boolean);
  let stored: Attribution = {};
  try { stored = JSON.parse(localStorage.getItem(ATTR_KEY) || '{}'); } catch { /* noop */ }
  // last-touch para tráfego pago: sobrescreve se vier gclid/fbclid/utm novo.
  // IMPORTANTE: só mescla as chaves DEFINIDAS de `fresh` — senão um chave `undefined`
  // (ex.: voltar pelo bridge só com UTMs) apagaria o gclid/fbclid já salvos e a venda
  // nunca seria atribuída ao clique pago.
  const freshDefined = Object.fromEntries(
    Object.entries(fresh).filter(([, v]) => v != null && v !== '')
  ) as Attribution;
  const merged = hasNew ? { ...stored, ...freshDefined } : stored;
  try {
    localStorage.setItem(ATTR_KEY, JSON.stringify(merged));
    document.cookie = `${ATTR_KEY}=${encodeURIComponent(JSON.stringify(merged))};path=/;max-age=${60 * 60 * 24 * 90};SameSite=Lax`;
  } catch { /* noop */ }
  return merged;
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(ATTR_KEY) || '{}'); } catch { return {}; }
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function track(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  const enriched = { ...getAttribution(), ...params };
  // 1) dataLayer (GTM roteia p/ Ads/Meta quando configurado)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...enriched });
  // 2) GA4 direto via gtag — garante que o evento (generate_lead etc.) chega ao GA4
  //    mesmo sem tag configurada no GTM. (Se um dia rotear via GTM, remover p/ não duplicar.)
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, enriched);
  }
}

/** _ga client_id — para reconciliar a venda no webhook server-side */
export function getGaClientId(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(/_ga=GA\d\.\d\.(\d+\.\d+)/);
  return m?.[1];
}

const ITEM = { item_id: 'arsenal-de-ia-97', item_name: 'Arsenal de IA', price: 97, quantity: 1 };

/**
 * Checkout INTERNO via Stripe: chama /api/checkout (que cria a sessão carimbando
 * gclid/fbclid/utm/ga_client_id nos metadados) e redireciona pra URL hospedada do Stripe.
 * Dispara begin_checkout. Pix/cartão/boleto conforme o que estiver ativo na conta Stripe.
 */
export async function goToCheckout(opts: { email?: string; produto?: 'arsenal' | 'tripwire' } = {}): Promise<void> {
  const a = getAttribution();
  const price = opts.produto === 'tripwire' ? 27 : 97;
  track('begin_checkout', { value: price, currency: 'BRL', event_id: uuid(), items: [ITEM] });
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: opts.email, produto: opts.produto || 'arsenal',
        attribution: a, client_id: getGaClientId(),
        fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1], fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1],
      }),
    });
    const data = await res.json();
    if (data?.url) { window.location.href = data.url; return; }
    console.error('[checkout] sem url', data);
  } catch (e) { console.error('[checkout] falhou', e); }
}

/** Inicialização padrão de toda página: consent banner + page_view + reveal + view_offer + VSL */
export function initPage(): void {
  if (typeof window === 'undefined') return;
  captureAttribution();
  track('page_view', { page_path: location.pathname, page_location: location.href, page_title: document.title });

  // ---- Consent banner ----
  const consentKey = 'msc_consent';
  const setConsent = (granted: boolean) => {
    try { localStorage.setItem(consentKey, granted ? 'granted' : 'denied'); } catch { /* noop */ }
    window.gtag?.('consent', 'update', {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
    });
    document.getElementById('consent-banner')?.remove();
  };
  let prior: string | null = null;
  try { prior = localStorage.getItem(consentKey); } catch { /* noop */ }
  if (prior === 'granted') window.gtag?.('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
  if (!prior) {
    document.getElementById('consent-accept')?.addEventListener('click', () => setConsent(true));
    document.getElementById('consent-decline')?.addEventListener('click', () => setConsent(false));
    document.getElementById('consent-banner')?.classList.remove('hidden');
  }

  // ---- reveal on scroll ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // ---- view_offer (bloco de preço) ----
  const offer = document.querySelector('[data-offer]');
  if (offer) {
    let fired = false;
    const oio = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired) { fired = true; track('view_offer', { value: 97, currency: 'BRL', items: [ITEM] }); oio.disconnect(); }
    }, { threshold: 0.5 });
    oio.observe(offer);
  }

  // ---- CTAs de checkout ----
  document.querySelectorAll('[data-checkout]').forEach((btn) => {
    btn.addEventListener('click', (ev) => { ev.preventDefault(); goToCheckout(); });
  });

  // ---- TSL: profundidade de leitura (scroll) + barra de progresso ----
  const bar = document.getElementById('read-progress');
  const fired = new Set<number>();
  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
    if (bar) bar.style.width = pct + '%';
    [25, 50, 75, 90].forEach((m) => {
      if (pct >= m && !fired.has(m)) { fired.add(m); track('scroll_depth', { content_type: 'tsl', percent: m }); }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
