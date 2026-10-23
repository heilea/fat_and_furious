const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** 1400 → "1 400 XPF" (espaces insécables, pour ne jamais couper un prix en fin de ligne). */
export function formatPrix(montant: number, devise = 'XPF') {
  return `${nombre.format(montant)} ${devise}`;
}

/** Prix d'un produit : montant formaté, ou libellé libre pour les prix variables. */
export function prixProduit(produit: { prix?: number; prixLibelle?: string }, devise = 'XPF') {
  if (produit.prix !== undefined) return formatPrix(produit.prix, devise);
  return `${produit.prixLibelle} ${devise}`;
}
