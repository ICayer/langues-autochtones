// ==================================================
// js/layouts/layoutTerritoire.js
// Disposition de la zone D
//
// Rôle : Placer les communautés sur la carte, à l’échelle réduite (D-05) ;
//        les nations rétrécissent jusqu'à disparaître au centre de leurs communautés (D-10, provisoire)
// Dépend de : js/data/dataStore.js, js/utils/echelles.js, js/utils/projection.js
// Utilisé par : main.js ; sa projection est lue par js/layers/carteLayer.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { dataStore } from '../data/dataStore.js';
import { rayonPopulation } from '../utils/echelles.js';
import { calculerProjection } from '../utils/projection.js';

// Pastilles à échelle réduite sur la carte (D-05)
const FACTEUR_RAYON_CARTE = 0.5;

// Projection de la dernière disposition calculée : la carte la réutilise telle quelle,
// pour que les communautés tombent exactement à leur place sur le contour (D-08).
export let projectionCarte;

/** @returns {Map<string, {x:number, y:number, r:number}>} */
export function layoutTerritoire(cadre) {
  projectionCarte = calculerProjection(cadre, dataStore.geojson);
  const positions = new Map();

  dataStore.communautes.forEach(c => {
    const [x, y] = projectionCarte([c.longitude, c.latitude]);
    positions.set(`c-${c.id_communaute}`, { x, y, r: rayonPopulation(c.population_communaute) * FACTEUR_RAYON_CARTE });
  });

  // D-10 (provisoire) : chaque nation se fond au centre de ses communautés
  dataStore.nations.forEach(n => {
    const points = n.communautes.map(c => positions.get(`c-${c.id_communaute}`));
    positions.set(`n-${n.id_nation}`, { x: d3.mean(points, p => p.x), y: d3.mean(points, p => p.y), r: 0 });
  });

  return positions;
}
