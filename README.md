# Fat & Furious Diner — site vitrine

Site une page du premier diner américain de Tahiti (Pirae). Construit avec [Astro](https://docs.astro.build) : HTML statique, très rapide, pensé pour le référencement local.

**Règle d'or : le contenu se modifie dans `src/data/`, jamais dans le code.** Le build vérifie chaque fichier : s'il manque un champ ou si un format est faux, il s'arrête et indique le fichier et le champ fautifs.

## Démarrer

Node 22.23 ou plus récent (`nvm use 22.23.4`).

```bash
npm install
```

```bash
npm run dev
```

Puis ouvrir http://localhost:4321. La planche du design system est sur http://localhost:4321/styleguide.

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | vérifie les données et les types, puis construit le site dans `dist/` |
| `npm run preview` | prévisualise le site construit |
| `npm run format` | remet en forme le code (Prettier) |

---

## Recettes

### Changer le burger du moment (chaque mois)

1. Déposer la photo dans `src/assets/burger-du-moment/`, de préférence **détourée sur fond transparent** (PNG ou WebP, 1200 px de large environ).
2. Modifier `src/data/burger-du-moment.yaml` :

```yaml
mention: Suggestion du mois de novembre
titre: Le Texas
titreScript: Burger
description: Steak Angus, cheddar fumé, onion rings et sauce barbecue maison.
prix: 2400
image: ../assets/burger-du-moment/texas.png
imageAlt: Le Texas Burger avec son cheddar fumé et ses onion rings
detouree: true        # false pour une photo classique (affichée dans un cercle)
pastille: NEW         # facultatif
jusquau: 2026-11-30   # au-delà, le build affiche un rappel
```

La bannière, l'image de partage sur les réseaux et les données Google se mettent à jour toutes seules. Laisser `prix:` vide masque la pastille de prix.

### Ajouter ou modifier un produit

Dans `src/data/menu.yaml`, trouver la catégorie et ajouter une entrée dans `produits` :

```yaml
    - nom: Texas Burger
      prix: 2400
      description: Potato bun, steak Angus, cheddar fumé, onion rings, sauce BBQ
      tags: [nouveau]          # facultatif : nouveau, a-partager, signature
      image: ../assets/menu/texas.jpg   # facultatif
```

Pour un prix variable, remplacer `prix` par `prixLibelle: 350 – 900`.

### Ajouter, masquer ou réordonner une catégorie

Les catégories s'affichent dans l'ordre du fichier `menu.yaml`. Pour masquer une catégorie sans la supprimer : `visible: false`. Une catégorie visible doit avoir un prix pour chaque produit.

**Brunch** et **Boissons** sont déjà prêtes à la fin du fichier, masquées en attendant les prix : compléter les `prix`, puis passer `visible: true`.

### Modifier les horaires, le brunch ou le happy hour

Dans `src/data/restaurant.yaml`, rubriques `horaires`, `brunch` et `happyHour`. Format `"11:00-21:00"`, ou `fermé`. Le tableau du site, la mention « Ouvert maintenant » et les horaires lus par Google suivent automatiquement.

### Ajouter des photos à la galerie

Déposer les photos dans `src/assets/gallery/`, puis dans `src/data/gallery.yaml` :

```yaml
photos:
  - image: ../assets/gallery/salle-banquettes.jpg
    alt: La salle du diner avec ses banquettes rouges et blanches
```

Les photos sont redimensionnées et converties en WebP automatiquement. `alt` décrit la photo pour les malvoyants et pour Google.

### Remplacer le logo

Déposer le fichier dans `src/assets/brand/` sous le nom `logo.svg` (ou `logo.png`, `logo.webp`). Il remplace automatiquement le logo texte provisoire, dans l'en-tête et le pied de page. Penser aussi à `public/favicon.svg` (icône d'onglet).

### Changer le texte « À propos »

`src/data/restaurant.yaml`, rubrique `aPropos` (titre, paragraphes, points forts et photo).

### Changer une couleur ou une police

- Couleurs, espacements, ombres : `src/styles/tokens.css`. Une ligne à changer, tout le site suit.
- Polices : `astro.config.mjs`, rubrique `fonts`.

### Mettre en ligne

1. Renseigner le vrai domaine dans `astro.config.mjs` (`SITE_URL`). Il sert à l'URL canonique, au sitemap et au `robots.txt`.
2. Déployer le dossier du projet sur **Netlify** ou **Cloudflare Pages** : commande de build `npm run build`, dossier publié `dist`, variable `NODE_VERSION=22.23.4`.
3. Après la mise en ligne :
   - créer ou mettre à jour la fiche **Google Business Profile** avec exactement le même nom, la même adresse et le même téléphone que le site ;
   - ajouter le site dans **Google Search Console** et y soumettre `https://<domaine>/sitemap-index.xml`.

---

## Organisation du code

```
src/
├── data/            ← tout le contenu (YAML)
├── assets/          ← logo et photos (optimisés au build)
├── content.config.ts← schémas qui valident les données
├── lib/             ← accès aux données, formats (prix, horaires), SEO (JSON-LD)
├── styles/          ← tokens.css (design system) + global.css
├── layouts/Base.astro ← <head> : SEO, Open Graph, polices, JSON-LD
├── components/      ← une section par fichier, et ui/ pour les briques réutilisables
└── pages/           ← index (le site), styleguide (interne), robots.txt
```

Les trois interactions (menu mobile, onglets de la carte, visionneuse photo) sont de petits scripts natifs dans leur composant. Sans JavaScript, la carte complète reste affichée.

## Encore à fournir par le client

- Logo (SVG) et photos originales (burgers, salle, façade)
- Photo et prix de l'Indiana Burger
- Carte des boissons à plat (PDF ou image) et prix du brunch
- Lien Google Maps exact ou coordonnées GPS (`restaurant.yaml` → `adresse`)
- Texte « notre histoire »
- Nom de domaine
