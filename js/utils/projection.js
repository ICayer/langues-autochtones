// ==================================================
// js/utils/projection.js
// Projection de la carte
//
// Rôle : Une seule projection conique conforme de Lambert, cadrée par fitExtent
//        dans le rectangle de la zone, partagée par la carte et les pastilles (D-08)
// Dépend de : d3 (chargé dans index.html), js/utils/cadres.js
// Utilisé par : js/layouts/layoutTerritoire.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { estEtroit } from './cadres.js';

// Écran large : la carte entière tient dans la hauteur de l'écran
const PART_HAUTEUR_ECRAN = 0.85;

/** Lambert conique conforme centrée sur le Québec : parallèles 46° et 60°, méridien 71° O. */
function lambertQuebec() {
  return d3.geoConicConformal().parallels([46, 60]).rotate([71, 0]);
}

/**
 * Projection ajustée au rectangle disponible de la zone.
 * Le rectangle est tiré du cadre ; sa hauteur suit les proportions de la carte.
 * Aucun décalage n'est ajouté après coup : fitExtent fait tout le cadrage.
 * @param {{gauche:number, largeur:number, haut:number}} cadre - voir cadreZone()
 * @param {object} geojson - le contour à faire tenir dans le rectangle
 */
export function calculerProjection(cadre, geojson) {
  const { gauche, largeur, haut } = cadre;

  // Proportions de la carte (hauteur / largeur), mesurées avec la même projection
  const [[x0, y0], [x1, y1]] = d3.geoPath(lambertQuebec().fitWidth(1000, geojson)).bounds(geojson);
  const proportion = (y1 - y0) / (x1 - x0);

  // Téléphone : toute la largeur du cadre.
  // Écran large : toute la largeur, sauf si la carte dépasse 85 % de la hauteur de l'écran.
  const hauteur = estEtroit(largeur)
    ? largeur * proportion
    : Math.min(largeur * proportion, window.innerHeight * PART_HAUTEUR_ECRAN);

  return lambertQuebec().fitExtent([[gauche, haut], [gauche + largeur, haut + hauteur]], geojson);
}
