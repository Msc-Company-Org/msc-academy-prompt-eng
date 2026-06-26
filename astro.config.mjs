// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// Estático por padrão (landing rápida, zero JS de framework).
// As rotas em src/pages/api/* optam por server com `export const prerender = false`.
export default defineConfig({
  site: 'https://academy.msccompany.com.br', // [SUP] ajustar domínio final
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
