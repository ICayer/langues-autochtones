// ==================================================
// js/data/dataStore.js
// Source de vérité unique des données
//
// Rôle : Contenir toutes les données chargées, jamais de fetch ailleurs
// Dépend de : aucun
// Utilisé par : tous les modules
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

export const dataStore = {
  nations: [],        // 11 nations, chacune avec ses communautés
  communautes: [],    // 55 communautés (liste à plat)
  geojson: null       // contour du Québec (FeatureCollection, Natural Earth)
};
