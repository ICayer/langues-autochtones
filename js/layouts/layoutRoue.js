// ==================================================
// js/layouts/layoutRoue.js
// Disposition de la zone E
//
// Rôle : Converger au centre de la roue, puis placer chaque nation dans son secteur (E-02, E-03) ;
//        sur téléphone, une grille à la place des futures cartes (E-09)
// Dépend de : js/data/dataStore.js, js/utils/echelles.js, js/utils/cadres.js
// Utilisé par : main.js (deux étapes de la zone E), js/layers/roueLayer.js (géométrie)
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { dataStore } from '../data/dataStore.js';
import { rayonPopulation } from '../utils/echelles.js';
import { nationsParRangee } from '../utils/cadres.js';

// PROVISOIRE (E-04, en attente de Catherine) : ordre de l'affiche, id_nation dans le sens
// des aiguilles d'une montre à partir du haut. Donne aussi l'ordre des cases sur téléphone.
// Inuit, Naskapi, Innue, Mi'gmaq, Wolastoqey, Atikamekw, Huronne-Wendat,
// W8banaki, Kanien'kehá:ka, Anishnabe, Crie d'Eeyou Istchee
export const ORDRE_SECTEURS_PROVISOIRE = [5, 9, 4, 8, 11, 3, 10, 1, 6, 2, 7];

// Écran large : la roue entière tient dans la hauteur de l'écran
const PART_HAUTEUR_ECRAN = 0.85;

/**
 * Géométrie de la roue, partagée par les deux dispositions et par le repère (roueLayer).
 * Écran large : diamètre limité par 85 % de la hauteur de l'écran et par la largeur du cadre.
 * Téléphone : pas de roue ; une grille, et le « centre » est celui de la grille.
 * @returns {{cx:number, cy:number, rayon:number, colonnes:number, tailleCase:number}}
 */
export function geometrieRoue(cadre) {
  const { gauche, largeur, haut, etroit } = cadre;
  if (etroit) {
    const colonnes = nationsParRangee(cadre);
    const tailleCase = largeur / colonnes;
    const rangees = Math.ceil(ORDRE_SECTEURS_PROVISOIRE.length / colonnes);
    return { cx: gauche + largeur / 2, cy: haut + rangees * tailleCase / 2, rayon: 0, colonnes, tailleCase };
  }
  const rayon = Math.min(largeur, window.innerHeight * PART_HAUTEUR_ECRAN) / 2;
  return { cx: gauche + largeur / 2, cy: haut + rayon, rayon };
}

/** Les 55 communautés, fondues au centre (rayon 0) : elles existent dans toutes les dispositions. */
function communautesAuCentre(positions, { cx, cy }) {
  dataStore.communautes.forEach(c => positions.set(`c-${c.id_communaute}`, { x: cx, y: cy, r: 0 }));
}

/**
 * Temps 1 de D→E (E-03) : tout converge au centre de la roue.
 * Les nations y ont leur pleine taille : on voit les communautés se fondre en elles.
 * @returns {Map<string, {x:number, y:number, r:number}>}
 */
export function layoutRoueCentre(cadre) {
  const g = geometrieRoue(cadre);
  const positions = new Map();
  communautesAuCentre(positions, g);
  dataStore.nations.forEach(n => {
    positions.set(`n-${n.id_nation}`, { x: g.cx, y: g.cy, r: rayonPopulation(n.population_nation) });
  });
  return positions;
}

/**
 * Temps 2, disposition de repos : chaque nation rejoint son secteur (écran large)
 * ou sa case de la grille (téléphone). Taille selon la population (G-04).
 * @returns {Map<string, {x:number, y:number, r:number}>}
 */
export function layoutRoue(cadre) {
  const g = geometrieRoue(cadre);
  const positions = new Map();
  communautesAuCentre(positions, g);

  ORDRE_SECTEURS_PROVISOIRE.forEach((id, i) => {
    const nation = dataStore.nations.find(n => n.id_nation === id);
    const r = rayonPopulation(nation.population_nation);

    if (cadre.etroit) {
      // Grille : un cercle centré dans chaque case, de gauche à droite puis de haut en bas
      const x = cadre.gauche + (i % g.colonnes + 0.5) * g.tailleCase;
      const y = cadre.haut + (Math.floor(i / g.colonnes) + 0.5) * g.tailleCase;
      positions.set(`n-${id}`, { x, y, r });
    } else {
      // 11 secteurs égaux, le premier centré en haut, sens des aiguilles d'une montre.
      // La nation touche le bord extérieur de la roue, de l'intérieur.
      const angle = i * 2 * Math.PI / ORDRE_SECTEURS_PROVISOIRE.length;
      const distance = g.rayon - r;
      positions.set(`n-${id}`, { x: g.cx + distance * Math.sin(angle), y: g.cy - distance * Math.cos(angle), r });
    }
  });

  return positions;
}
