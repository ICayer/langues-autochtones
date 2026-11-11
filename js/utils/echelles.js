// ==================================================
// js/utils/echelles.js
// Échelles partagées
//
// Rôle : Échelle de surface commune aux nations et aux communautés, avec surface maximale adaptée à la largeur de l’écran (G-03, G-04)
// Dépend de : js/data/dataStore.js, js/utils/cadres.js
// Utilisé par : main.js, layouts/
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { dataStore } from '../data/dataStore.js';
import { nationsParRangee } from './cadres.js';

// Rayon du plus gros cercle sur écran large : la surface maximale (G-03)
const RAYON_MAX_ECRAN_LARGE = 60;
// Part de sa colonne que le plus gros cercle peut occuper (0,8 = 80 %)
const PART_COLONNE_MAX = 0.8;

// Surface proportionnelle à la population : d3.scaleSqrt (G-03).
// Une seule échelle pour les nations ET les communautés (G-04).
export let rayonPopulation;

export function initEchelles() { /* l'échelle est créée par majEchelles(), qui connaît la largeur */ }

/** (Re)calcule l'échelle selon la largeur disponible, pour que le plus gros cercle tienne dans sa colonne. */
export function majEchelles(largeur) {
  const demiColonne = largeur / nationsParRangee(largeur) / 2;
  const rayonMax = Math.min(RAYON_MAX_ECRAN_LARGE, demiColonne * PART_COLONNE_MAX);
  const populationMax = d3.max(dataStore.nations, n => n.population_nation);
  rayonPopulation = d3.scaleSqrt().domain([0, populationMax]).range([0, rayonMax]);
}
