// ==================================================
// js/layouts/layoutPopulation.js
// Disposition de la zone C
//
// Rôle : Nations dimensionnées selon leur population, communautés sur un axe des populations (C-02, C-03)
// Dépend de : js/data/dataStore.js, js/utils/echelles.js
// Utilisé par : main.js, scroll/migrations.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { dataStore } from '../data/dataStore.js';
import { rayonPopulation } from '../utils/echelles.js';

const POPULATION_MAX_AXE = 15000;
const ESPACE_NATIONS_AXE = 80;   // distance entre la dernière rangée de nations et l'axe

/**
 * Version simplifiée pour le spike : les communautés sont posées sur l'axe
 * et peuvent se chevaucher. Le beeswarm (C-04) viendra à une étape suivante.
 * @returns {Map<string, {x:number, y:number, r:number}>}
 */
export function layoutPopulation({ gauche, largeur, haut }) {
  const positions = new Map();

  // Nations de la plus petite à la plus grande (C-02)
  const nations = [...dataStore.nations]
    .sort((a, b) => a.population_nation - b.population_nation);

  const nationsParRangee = largeur < 500 ? 3 : 6;
  const largeurColonne = largeur / nationsParRangee;
  const rangees = d3.range(Math.ceil(nations.length / nationsParRangee))
    .map(i => nations.slice(i * nationsParRangee, (i + 1) * nationsParRangee));

  let y = haut;
  rangees.forEach(rangee => {
    const rayonMaxRangee = d3.max(rangee, n => rayonPopulation(n.population_nation));
    y += rayonMaxRangee;
    const decalage = (nationsParRangee - rangee.length) * largeurColonne / 2;
    rangee.forEach((nation, i) => {
      positions.set(`n-${nation.id_nation}`, {
        x: gauche + decalage + (i + 0.5) * largeurColonne,
        y,
        r: rayonPopulation(nation.population_nation)
      });
    });
    y += rayonMaxRangee + 20;
  });

  // Axe des populations en racine carrée (C-03)
  const yAxe = y + ESPACE_NATIONS_AXE;
  const x = d3.scaleSqrt().domain([0, POPULATION_MAX_AXE]).range([gauche, gauche + largeur]);

  dataStore.communautes.forEach(c => {
    positions.set(`c-${c.id_communaute}`, {
      x: x(c.population_communaute),
      y: yAxe,
      r: rayonPopulation(c.population_communaute)
    });
  });

  return positions;
}
