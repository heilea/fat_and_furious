// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Domaine définitif du site : sert à l'URL canonique, au sitemap et aux balises Open Graph.
// TODO : remplacer par le vrai nom de domaine avant la mise en ligne.
const SITE_URL = 'https://fatandfurious.example';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [
    sitemap({
      // La planche du design system n'a rien à faire dans Google.
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
  // Polices Google téléchargées au build et servies par le site lui-même (pas d'appel à Google côté visiteur).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Bebas Neue',
      cssVariable: '--font-poster',
      weights: [400],
      fallbacks: ['Impact', 'Arial Narrow', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Lobster',
      cssVariable: '--font-script',
      weights: [400],
      fallbacks: ['cursive'],
    },
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-body',
      weights: ['400 700'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
});
