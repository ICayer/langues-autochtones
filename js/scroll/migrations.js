// ==================================================
// js/scroll/migrations.js
// Migrations entre les zones
//
// Rôle : Interpoler entre deux dispositions selon la progression du défilement (G-02, G-08)
// Dépend de : js/utils/cadres.js
// Utilisé par : main.js, scroll/scrollInit.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { cadreZone } from '../utils/cadres.js';

// --- Réglages à ajuster à l'œil (BC-01) ---
// Repère : la ligne horizontale de l'écran qui sert à mesurer la progression
// (0,5 = milieu de l'écran).
const REPERE_ECRAN = 0.5;
// Part de la zone pendant laquelle rien ne bouge (temps de lecture),
// avant que la migration commence. Logique de Shirley Wu (Data Sketches).
const DEBUT_MIGRATION = 0.35;

let ordreZones = [];        // ex. ['zone-b', 'zone-c']
let dispositions = {};      // id de zone → Map(clé → {x, y, r})

/** Calcule (ou recalcule après un redimensionnement) la disposition de chaque zone. */
export function calculerDispositions(fabriques) {
  ordreZones = Object.keys(fabriques);
  dispositions = {};
  ordreZones.forEach(id => { dispositions[id] = fabriques[id](cadreZone(id)); });
}

/** Mélange deux dispositions : t = 0 donne le départ, t = 1 donne l'arrivée. */
function interpoler(depart, arrivee, t) {
  const resultat = new Map();
  depart.forEach((p, cle) => {
    const q = arrivee.get(cle);
    resultat.set(cle, {
      x: p.x + (q.x - p.x) * t,
      y: p.y + (q.y - p.y) * t,
      r: p.r + (q.r - p.r) * t     // mise à l'échelle au rythme du déplacement (BC-02)
    });
  });
  return resultat;
}

/**
 * Lit la position du défilement et renvoie la disposition à afficher.
 * Calculé à chaque image : un défilement rapide donne un mouvement rapide,
 * mais jamais de saut (G-08).
 */
export function positionsSelonDefilement() {
  const repere = window.innerHeight * REPERE_ECRAN;

  for (let i = 0; i < ordreZones.length - 1; i++) {
    const rect = document.getElementById(ordreZones[i]).getBoundingClientRect();
    const progression = (repere - rect.top) / rect.height;   // 0 = haut de la zone au repère

    if (progression < DEBUT_MIGRATION) return dispositions[ordreZones[i]];
    if (progression < 1) {
      const t = (progression - DEBUT_MIGRATION) / (1 - DEBUT_MIGRATION);
      return interpoler(dispositions[ordreZones[i]], dispositions[ordreZones[i + 1]], t);
    }
  }
  return dispositions[ordreZones[ordreZones.length - 1]];
}
