# MSC Academy — Landing "Prompt Profissional" (R$97)

Landing de **VSL perpétuo** do curso de Prompt Engineering da MSC Academy.
**Astro 5 + Tailwind v4 + adapter Vercel.** Estática (zero JS de framework) com 2 endpoints de servidor.

## Stack & por quê
- **Astro** em vez de Next.js: landing de marketing manda HTML estático e quase nenhum JS → Core Web Vitals verde, que é o que converte VSL.
- **Tailwind v4** via `@tailwindcss/vite`.
- **Adapter Vercel**: páginas estáticas + 2 rotas server (`/api/lead`, `/api/kiwify/webhook`) que viram Vercel Functions.

## Páginas
| Rota | O quê |
|---|---|
| `/` | Página de vendas + VSL (a copy real está em `02-pagina-vendas-vsl.md` do kit) |
| `/isca` | Página de captura do lead magnet (Kit Prompt Engineering + régua C.L.A.R.O.) |
| `/obrigado` | Pós-compra (dispara `purchase` best-effort, deduplicado pelo webhook) |
| `/privacidade`, `/termos` | Legais (LGPD) |
| `POST /api/lead` | Captura de lead → CRM/webhook + Meta CAPI "Lead" |
| `POST /api/kiwify/webhook` | `purchase` autoritativo (GA4 MP + Meta CAPI) na compra aprovada |

## Tracking (já ligado)
- **GTM `GTM-P4P7R35C`** (container real) é o default — sobrescrevível por `PUBLIC_GTM_ID`.
- **Consent Mode v2** (LGPD): `denied` por padrão + banner que dá `update granted`.
- Eventos no `dataLayer`: `page_view`, `video_start`, `video_progress` (25/50/75/90), `form_start`,
  `generate_lead`, `view_offer`, `begin_checkout`, `purchase`. Configurar as tags no GTM apontando pra esses eventos.
- Atribuição (`gclid`/`fbclid`/UTMs) é capturada e **carimbada na URL do checkout Kiwify** (campos `s1/s2/s3`).
- Detalhe completo: `Desktop\Marketing-MSC-2026\11-academy-lancamento\07-tracking.md`.

## Rodar local
```bash
pnpm install
cp .env.example .env   # preencher o que tiver
pnpm dev               # http://localhost:4321
pnpm build             # gera dist/ (estático) + functions
```

## Antes de ir pra produção (checklist)
- [ ] Configurar `PUBLIC_KIWIFY_CHECKOUT_URL` (link do produto R$97) — sem ele os CTAs não saem pro checkout.
- [ ] Gravar a VSL e trocar o placeholder do player no `index.astro` por `<video data-vsl …>` ou embed Mux/Vimeo.
- [ ] No GTM: criar as tags GA4/Ads/Meta lendo os eventos do `dataLayer` (ver `07-tracking.md`).
- [ ] Preencher env de servidor no Vercel: `FB_CAPI_TOKEN`, `GA_ID`, `GA_API_SECRET`, `KIWIFY_WEBHOOK_TOKEN`, `LEAD_WEBHOOK_URL`.
- [ ] Confirmar nomes dos campos custom/assinatura do webhook no painel Kiwify (marcados `[SUP]` no código).
- [ ] Trocar depoimentos placeholder por reais antes de escalar verba (regra da casa: real > IA).

## Conteúdo-fonte
Toda a copy/oferta/e-mails/ads vêm de `C:\Users\Moises e  Naiara\Desktop\Marketing-MSC-2026\11-academy-lancamento\`.
