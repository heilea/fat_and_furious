// Données structurées schema.org (JSON-LD) : ce que Google lit pour la fiche du restaurant
// (horaires, adresse, menu, prix…). Tout est généré depuis src/data/.
import { getBurgerDuMoment, getMenu, getRestaurant } from './data';
import { openingHoursSpecification } from './horaires';

export async function restaurantJsonLd(site: URL, image: URL) {
  const [restaurant, menu, burger] = await Promise.all([
    getRestaurant(),
    getMenu(),
    getBurgerDuMoment(),
  ]);
  const { adresse } = restaurant;
  const url = new URL('/', site).href;

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${url}#restaurant`,
    name: restaurant.nom,
    description: restaurant.description,
    slogan: restaurant.accroche,
    url,
    image: image.href,
    telephone: restaurant.contact.telephoneInternational,
    priceRange: restaurant.gammeDePrix,
    currenciesAccepted: restaurant.devise,
    servesCuisine: ['American', 'Burgers'],
    acceptsReservations: restaurant.reservation,
    knowsLanguage: restaurant.langues,
    address: {
      '@type': 'PostalAddress',
      streetAddress: adresse.rue,
      postalCode: adresse.codePostal,
      addressLocality: adresse.commune,
      addressRegion: adresse.ile,
      addressCountry: adresse.pays,
    },
    ...(adresse.gps && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: adresse.gps.latitude,
        longitude: adresse.gps.longitude,
      },
    }),
    hasMap: adresse.lienMaps,
    openingHoursSpecification: openingHoursSpecification(restaurant),
    sameAs: Object.values(restaurant.reseaux).filter(Boolean),
    hasMenu: {
      '@type': 'Menu',
      name: `Carte ${restaurant.nom}`,
      url: `${url}#menu`,
      hasMenuSection: menu.map((categorie) => ({
        '@type': 'MenuSection',
        name: categorie.titre,
        ...(categorie.note && { description: categorie.note }),
        hasMenuItem: categorie.produits.map((produit) => ({
          '@type': 'MenuItem',
          name: produit.nom,
          ...(produit.description && { description: produit.description }),
          ...(produit.prix !== undefined && {
            offers: { '@type': 'Offer', price: produit.prix, priceCurrency: restaurant.devise },
          }),
        })),
      })),
    },
    makesOffer: {
      '@type': 'Offer',
      name: `${burger.titre} ${burger.titreScript}`,
      description: burger.description,
      ...(burger.prix && { price: burger.prix, priceCurrency: restaurant.devise }),
      ...(burger.jusquau && { validThrough: burger.jusquau.toISOString().slice(0, 10) }),
    },
  };
}
