// Accès typé aux données de src/data/. Les composants passent toujours par ici.
import { getCollection, getEntry } from 'astro:content';

export async function getRestaurant() {
  const entry = await getEntry('restaurant', 'restaurant');
  if (!entry) throw new Error('src/data/restaurant.yaml est introuvable');
  return entry.data;
}

let rappelsAffiches = false;

export async function getBurgerDuMoment() {
  const entry = await getEntry('burgerDuMoment', 'actuel');
  if (!entry) throw new Error('src/data/burger-du-moment.yaml est introuvable');
  const burger = entry.data;

  // Rappels affichés une seule fois par build, même si plusieurs pages lisent le burger.
  if (rappelsAffiches) return burger;
  rappelsAffiches = true;

  if (burger.jusquau && burger.jusquau < new Date()) {
    console.warn(
      `\n⚠️  Le burger du moment "${burger.titre} ${burger.titreScript}" a expiré le ` +
        `${burger.jusquau.toLocaleDateString('fr-FR')}. Pensez à mettre à jour src/data/burger-du-moment.yaml.\n`,
    );
  }
  if (!burger.image) {
    console.warn(
      '\n⚠️  Pas encore de photo pour le burger du moment : un emplacement "photo à venir" est affiché.\n',
    );
  }
  return burger;
}

/** Catégories visibles du menu, dans l'ordre du fichier. */
export async function getMenu() {
  const categories = await getCollection('menu', ({ data }) => data.visible);
  return categories
    .sort((a, b) => a.data.ordre - b.data.ordre)
    .map(({ id, data }) => ({ id, ...data }));
}

export async function getGalerie() {
  const entry = await getEntry('galerie', 'galerie');
  return entry?.data.photos ?? [];
}
