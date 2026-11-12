// ==================================================
// js/layers/roueLayer.js
// Repère de la roue des langues (zone E)
//
// Rôle : PROVISOIRE, pour juger à l'œil où arrivent les nations : un cercle et 11 rayons fins,
//        sur écran large seulement. Ce n'est pas le design de la roue.
// Dépend de : js/layouts/layoutRoue.js, js/utils/colors.js
// Utilisé par : main.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { geometrieRoue, ORDRE_SECTEURS_PROVISOIRE } from '../layouts/layoutRoue.js';
import { COULEURS_ROUE } from '../utils/colors.js';

let gRoue;

/** Crée le groupe du repère : appelé avant initPastilles(), pour rester sous les pastilles. */
export function initRoue() {
  gRoue = d3.select('#visualisation').append('g').attr('class', 'roue')
    .attr('fill', 'none')
    .attr('stroke', COULEURS_ROUE.trait)
    .attr('stroke-width', 0.75);
}

/** (Re)dessine le repère avec la même géométrie que layoutRoue : sur téléphone, rien. */
export function dessinerRoue(cadre) {
  gRoue.selectAll('*').remove();
  if (cadre.etroit) return;

  const { cx, cy, rayon } = geometrieRoue(cadre);
  const nb = ORDRE_SECTEURS_PROVISOIRE.length;

  gRoue.append('circle').attr('cx', cx).attr('cy', cy).attr('r', rayon);

  // Limites entre les secteurs : à mi-chemin entre deux centres de secteur
  gRoue.selectAll('line')
    .data(d3.range(nb).map(i => (i + 0.5) * 2 * Math.PI / nb))
    .join('line')
      .attr('x1', cx).attr('y1', cy)
      .attr('x2', a => cx + rayon * Math.sin(a))
      .attr('y2', a => cy - rayon * Math.cos(a));
}
