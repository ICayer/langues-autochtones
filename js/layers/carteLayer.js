// ==================================================
// js/layers/carteLayer.js
// Carte du Québec (zone D)
//
// Rôle : Dessiner la carte et, si décidé, les territoires (D-02, D-04) ;
//        même projection que les pastilles (D-08)
// Dépend de : js/data/dataStore.js, js/layouts/layoutTerritoire.js, js/utils/colors.js
// Utilisé par : main.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { dataStore } from '../data/dataStore.js';
import { projectionCarte } from '../layouts/layoutTerritoire.js';
import { COULEURS_CARTE } from '../utils/colors.js';

let gCarte;

/** Crée le groupe de la carte : appelé avant initPastilles(), pour rester sous les pastilles. */
export function initCarte() {
  gCarte = d3.select('#visualisation').append('g').attr('class', 'carte');
  gCarte.selectAll('path')
    .data(dataStore.geojson.features)
    .join('path')
      .attr('fill', COULEURS_CARTE.remplissage)
      .attr('stroke', COULEURS_CARTE.trait)
      .attr('stroke-width', 0.5);
}

/** (Re)dessine le contour avec la projection de la zone D : après calculerDispositions(). */
export function dessinerCarte() {
  gCarte.selectAll('path').attr('d', d3.geoPath(projectionCarte));
}
