// ==================================================
// js/utils/echelles.js
// Échelles partagées
//
// Rôle : Échelle de surface commune aux nations et aux communautés, avec surface maximale (G-03, G-04)
// Dépend de : js/data/dataStore.js
// Utilisé par : layouts/
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { dataStore } from '../data/dataStore.js';

// Rayon du plus gros cercle (la nation la plus nombreuse) : la surface maximale (G-03)
export const RAYON_MAX = 60;

// Surface proportionnelle à la population : d3.scaleSqrt (G-03).
// Une seule échelle pour les nations ET les communautés (G-04).
export let rayonPopulation;

export function initEchelles() {
  const populationMax = d3.max(dataStore.nations, n => n.population_nation);
  rayonPopulation = d3.scaleSqrt().domain([0, populationMax]).range([0, RAYON_MAX]);
}
