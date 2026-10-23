import type { APIRoute } from 'astro';

// robots.txt généré avec le bon domaine (celui de astro.config.mjs).
export const GET: APIRoute = ({ site }) =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /styleguide',
      '',
      `Sitemap: ${new URL('sitemap-index.xml', site)}`,
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
