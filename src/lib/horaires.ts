// Horaires : mise en forme pour l'affichage, données Google (schema.org) et calcul "ouvert maintenant".
import { JOURS } from '../content.config';

export type Jour = (typeof JOURS)[number];
export type Plage = { debut: string; fin: string };

const SCHEMA_DAYS: Record<Jour, string> = {
  lundi: 'Monday',
  mardi: 'Tuesday',
  mercredi: 'Wednesday',
  jeudi: 'Thursday',
  vendredi: 'Friday',
  samedi: 'Saturday',
  dimanche: 'Sunday',
};

/** "11:00-21:00" → { debut: "11:00", fin: "21:00" } ; "fermé" → null */
export function parsePlage(valeur: string): Plage | null {
  if (valeur === 'fermé') return null;
  const [debut, fin] = valeur.split('-');
  return { debut, fin };
}

/** "11:00" → "11h", "21:30" → "21h30" */
export function formatHeure(heure: string) {
  const [h, m] = heure.split(':');
  return `${Number(h)}h${m === '00' ? '' : m}`;
}

export function formatPlage(plage: Plage | null) {
  return plage ? `${formatHeure(plage.debut)} – ${formatHeure(plage.fin)}` : 'Fermé';
}

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** [lundi, mardi, mercredi, jeudi] → "Du lundi au jeudi" ; [samedi, dimanche] → "Samedi et dimanche" */
export function formatJours(jours: readonly Jour[]) {
  const tries = [...jours].sort((a, b) => JOURS.indexOf(a) - JOURS.indexOf(b));
  if (tries.length === 1) return majuscule(tries[0]);
  const consecutifs = tries.every(
    (j, i) => i === 0 || JOURS.indexOf(j) === JOURS.indexOf(tries[i - 1]) + 1,
  );
  if (consecutifs && tries.length > 2) return `Du ${tries[0]} au ${tries.at(-1)}`;
  return majuscule(`${tries.slice(0, -1).join(', ')} et ${tries.at(-1)}`);
}

interface HorairesSource {
  horaires: Partial<Record<Jour, string>>;
  brunch: { jours: readonly Jour[]; horaire: string };
}

/** Plages d'ouverture de chaque jour, brunch compris (le brunch précède le service du midi). */
export function plagesParJour(source: HorairesSource): Record<Jour, Plage[]> {
  const brunch = parsePlage(source.brunch.horaire);
  return Object.fromEntries(
    JOURS.map((jour) => {
      const service = parsePlage(source.horaires[jour] ?? 'fermé');
      const plages = [brunch && source.brunch.jours.includes(jour) ? brunch : null, service].filter(
        (p): p is Plage => p !== null,
      );
      return [jour, plages];
    }),
  ) as Record<Jour, Plage[]>;
}

/** openingHoursSpecification schema.org : jours regroupés par plage identique. */
export function openingHoursSpecification(source: HorairesSource) {
  const groupes = new Map<string, string[]>();
  for (const [jour, plages] of Object.entries(plagesParJour(source)) as [Jour, Plage[]][]) {
    for (const p of plages) {
      const cle = `${p.debut}-${p.fin}`;
      groupes.set(cle, [...(groupes.get(cle) ?? []), SCHEMA_DAYS[jour]]);
    }
  }
  return [...groupes].map(([cle, jours]) => {
    const [opens, closes] = cle.split('-');
    return { '@type': 'OpeningHoursSpecification', dayOfWeek: jours, opens, closes };
  });
}
