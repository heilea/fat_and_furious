// Schémas des données du site (dossier src/data/).
// Si un fichier YAML est mal rempli, le build s'arrête avec un message qui indique le champ fautif :
// impossible de publier une page cassée par erreur.
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

/** Charge un fichier YAML qui ne contient qu'un seul objet (et non une liste) comme une entrée unique. */
const singleton = (path: string, id: string) =>
  file(path, { parser: (text) => ({ [id]: parse(text) }) });

export const JOURS = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
] as const;
const jour = z.enum(JOURS);

/** Plage horaire "HH:MM-HH:MM". */
const plage = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-4]):[0-5]\d$/, 'Format attendu : "11:00-21:00"');

const restaurant = defineCollection({
  loader: singleton('src/data/restaurant.yaml', 'restaurant'),
  schema: ({ image }) =>
    z.object({
      nom: z.string(),
      accroche: z.string(),
      description: z.string(),
      contact: z.object({
        telephone: z.string(),
        telephoneInternational: z.string().regex(/^\+\d+$/, 'Format attendu : "+68940576776"'),
      }),
      adresse: z.object({
        rue: z.string(),
        codePostal: z.string(),
        commune: z.string(),
        ile: z.string(),
        pays: z.string().length(2, 'Code pays à 2 lettres, ex. "PF"'),
        repere: z.string().optional(),
        lienMaps: z.url(),
        gps: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
      }),
      fuseauHoraire: z.string(),
      /** Une plage par jour, ou "fermé". */
      horaires: z.record(jour, z.union([plage, z.literal('fermé')])),
      brunch: z.object({ jours: z.array(jour).min(1), horaire: plage, description: z.string() }),
      happyHour: z.object({
        jours: z.array(jour).min(1),
        horaire: plage,
        offre: z.string(),
        pastille: z.string().max(8).optional(),
      }),
      aPropos: z.object({
        titre: z.string(),
        paragraphes: z.array(z.string()).min(1),
        points: z.array(z.string()).default([]),
        image: image().optional(),
        imageAlt: z.string(),
      }),
      reservation: z.boolean(),
      gammeDePrix: z.string(),
      devise: z.string().length(3),
      langues: z.array(z.string()),
      reseaux: z.object({ instagram: z.url().optional(), facebook: z.url().optional() }),
      seo: z.object({ titre: z.string().max(70), description: z.string().max(170) }),
    }),
});

const burgerDuMoment = defineCollection({
  loader: singleton('src/data/burger-du-moment.yaml', 'actuel'),
  schema: ({ image }) =>
    z.object({
      mention: z.string(),
      titre: z.string(),
      titreScript: z.string(),
      description: z.string(),
      /** Prix en XPF ; vide tant qu'il n'est pas confirmé. */
      prix: z.number().int().positive().nullish(),
      image: image().optional(),
      imageAlt: z.string().min(10, 'Décrire la photo en une phrase'),
      detouree: z.boolean().default(true),
      pastille: z.string().max(12).optional(),
      /** Date de fin ; au-delà, le build affiche un rappel. */
      jusquau: z.coerce.date().optional(),
    }),
});

export const TAGS = ['nouveau', 'a-partager', 'signature'] as const;

const menu = defineCollection({
  // "ordre" = position dans le fichier : la carte s'affiche dans l'ordre où elle est écrite.
  loader: file('src/data/menu.yaml', {
    parser: (text) =>
      (parse(text) as Record<string, unknown>[]).map((categorie, ordre) => ({
        ...categorie,
        ordre,
      })),
  }),
  schema: ({ image }) =>
    z
      .object({
        ordre: z.number(),
        titre: z.string(),
        note: z.string().optional(),
        visible: z.boolean().default(true),
        produits: z
          .array(
            z.object({
              nom: z.string(),
              description: z.string().optional(),
              prix: z.number().int().positive().optional(),
              prixLibelle: z.string().optional(),
              tags: z.array(z.enum(TAGS)).default([]),
              image: image().optional(),
            }),
          )
          .min(1),
      })
      .superRefine((categorie, ctx) => {
        if (!categorie.visible) return;
        categorie.produits.forEach((produit, i) => {
          if (produit.prix === undefined && produit.prixLibelle === undefined) {
            ctx.addIssue({
              code: 'custom',
              path: ['produits', i, 'prix'],
              message: `"${produit.nom}" n'a pas de prix (renseigner "prix" ou "prixLibelle", ou masquer la catégorie)`,
            });
          }
        });
      }),
});

const galerie = defineCollection({
  loader: singleton('src/data/gallery.yaml', 'galerie'),
  schema: ({ image }) =>
    z.object({
      photos: z.array(
        z.object({ image: image(), alt: z.string().min(10, 'Décrire la photo en une phrase') }),
      ),
    }),
});

export const collections = { restaurant, burgerDuMoment, menu, galerie };
