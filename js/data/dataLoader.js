// ==================================================
// js/data/dataLoader.js
// Chargement des données
//
// Rôle : Charger donnees.json (et plus tard la carte) et remplir dataStore
// Dépend de : js/data/dataStore.js
// Utilisé par : main.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { dataStore } from './dataStore.js';

export async function loadData() {
  const url = new URL('../../public/data/donnees.json', import.meta.url);
  const donnees = await d3.json(url);
  dataStore.nations = donnees.nations;
  dataStore.communautes = donnees.nations.flatMap(n => n.communautes);
}
