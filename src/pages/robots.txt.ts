import type { APIRoute } from 'astro';

// Préfixe du site (ex. "/fat_and_furious/" sur GitHub Pages), toujours terminé par "/".
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

// robots.txt généré avec le bon domaine et le bon préfixe (ceux de astro.config.mjs).
export const GET: APIRoute = ({ site }) =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      `Disallow: ${base}styleguide`,
      '',
      `Sitemap: ${new URL(`${base}sitemap-index.xml`, site)}`,
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
