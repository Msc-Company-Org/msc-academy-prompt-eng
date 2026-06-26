// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// Estático por padrão (landing rápida, zero JS de framework).
// As rotas em src/pages/api/* optam por server com `export const prerender = false`.
export default defineConfig({
  site: 'https://arsenal.msc-academy.com.br',
  output: 'static',
  integrations: [sitemap({
    // não indexar páginas de pós-conversão/captura no sitemap
    filter: (page) => !/\/(obrigado|arsenal-gratis\/pronto)\/?$/.test(page),
  })],
  adapter: vercel({
    webAnalytics: { enabled: false },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
