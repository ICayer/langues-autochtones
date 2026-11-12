// ==================================================
// js/layouts/layoutNations.js
// Disposition de la zone B
//
// Rôle : Calculer la position de chaque pastille : grille des nations et de leurs communautés
// Dépend de : js/data/dataStore.js, js/utils/cadres.js
// Utilisé par : main.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { dataStore } from '../data/dataStore.js';
import { nationsParRangee as parRangee } from '../utils/cadres.js';

// Tailles uniformes en zone B (B-02) : la taille selon la population arrive en zone C.
export const RAYON_NATION = 22;
export const RAYON_COMMUNAUTE = 6;
const ESPACE_COMMUNAUTES = 16;      // distance entre deux communautés voisines
const COMMUNAUTES_PAR_RANGEE = 3;
const HAUTEUR_RANGEE_NATIONS = 180; // assez pour les 14 communautés inuit (5 rangées)

/**
 * Calcule la position de chaque pastille dans la zone B.
 * @param {{gauche:number, largeur:number, haut:number, etroit:boolean}} cadre - voir cadreZone()
 * @returns {Map<string, {x:number, y:number, r:number}>} clé de pastille → position
 */
export function layoutNations(cadre) {
  const { gauche, largeur, haut } = cadre;
  const positions = new Map();

  // Ordre alphabétique (script technique, zone B)
  const nations = [...dataStore.nations]
    .sort((a, b) => a.nation.localeCompare(b.nation, 'fr'));

  const nationsParRangee = parRangee(cadre);         // 2 rangées (6 et 5) sur écran large
  const largeurColonne = largeur / nationsParRangee;

  nations.forEach((nation, i) => {
    const rangee = Math.floor(i / nationsParRangee);
    const colonne = i % nationsParRangee;

    // Une rangée incomplète est centrée
    const nbDansRangee = Math.min(nationsParRangee, nations.length - rangee * nationsParRangee);
    const decalage = (nationsParRangee - nbDansRangee) * largeurColonne / 2;

    const x = gauche + decalage + (colonne + 0.5) * largeurColonne;
    const y = haut + rangee * HAUTEUR_RANGEE_NATIONS + RAYON_NATION;
    positions.set(`n-${nation.id_nation}`, { x, y, r: RAYON_NATION });

    // Les communautés en petite grille sous leur nation
    nation.communautes.forEach((communaute, j) => {
      const dx = (j % COMMUNAUTES_PAR_RANGEE - (COMMUNAUTES_PAR_RANGEE - 1) / 2) * ESPACE_COMMUNAUTES;
      const dy = RAYON_NATION + 18 + Math.floor(j / COMMUNAUTES_PAR_RANGEE) * ESPACE_COMMUNAUTES;
      positions.set(`c-${communaute.id_communaute}`, { x: x + dx, y: y + dy, r: RAYON_COMMUNAUTE });
    });
  });

  return positions;
}
