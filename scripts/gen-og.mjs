// Gera public/og.jpg (1200x630) — capa social Editorial Premium.
// Placeholder de marca até o Moisés colocar a arte real (Nano Banana Pro).
// sharp é importado dinamicamente (pode estar bloqueado local; no build da Vercel funciona).

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F5F1EA"/>
  <rect x="0" y="0" width="1200" height="10" fill="#4338CA"/>
  <text x="80" y="150" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#4338CA" letter-spacing="6">MSC ACADEMY</text>
  <text x="76" y="290" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="120" fill="#1B1714">Arsenal de IA</text>
  <text x="80" y="380" font-family="Arial, sans-serif" font-size="40" fill="#1B1714" opacity="0.82">Templates, prompts e superpowers prontos.</text>
  <text x="80" y="438" font-family="Arial, sans-serif" font-size="40" fill="#1B1714" opacity="0.82">Pegue <tspan fill="#4338CA" font-weight="bold">7 peças grátis</tspan> pra sua profissão.</text>
  <rect x="80" y="510" width="300" height="64" rx="12" fill="#F59E0B"/>
  <text x="230" y="551" font-family="Arial, sans-serif" font-weight="bold" font-size="28" fill="#1B1714" text-anchor="middle">Quero as 7 grátis →</text>
  <text x="1120" y="551" font-family="Arial, sans-serif" font-size="26" fill="#1B1714" opacity="0.55" text-anchor="end">arsenal.msc-academy.com.br</text>
</svg>`;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#163300"/>
  <path d="M7.6 24.2 L16 7.2 L24.4 24.2" fill="none" stroke="#FAF7F0" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="10.8" y="17.2" width="10.4" height="2.7" rx="1.35" fill="#9FE870"/>
  <circle cx="16" cy="7.2" r="2.5" fill="#FF4F40"/>
</svg>`;

try {
  const sharpMod = (await import('sharp')).default;
  await sharpMod(Buffer.from(svg)).jpeg({ quality: 88 }).toFile('public/og.jpg');
  await sharpMod(Buffer.from(iconSvg)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  console.log('public/og.jpg + apple-touch-icon.png gerados');
} catch (e) {
  // sharp pode estar bloqueado no ambiente local (política de Temp); no build da Vercel funciona.
  console.warn('[gen-og] sharp indisponível aqui, pulando og.jpg local:', e.message);
}
