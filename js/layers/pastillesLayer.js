// ==================================================
// js/layers/pastillesLayer.js
// Les pastilles qui voyagent
//
// Rôle : Dessiner les 11 nations et les 55 communautés, une clé par pastille, et les placer selon une disposition
// Dépend de : js/data/dataStore.js, js/utils/colors.js
// Utilisé par : main.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { dataStore } from '../data/dataStore.js';
import { couleurNation } from '../utils/colors.js';

let gPastilles;

export function initPastilles() {
  gPastilles = d3.select('#visualisation').append('g').attr('class', 'pastilles');

  // Une clé stable par pastille : c'est elle qui permet de retrouver
  // la même pastille d'une zone à l'autre (comme chez Shirley Wu)
  const donnees = [
    ...dataStore.nations.map(n => ({
      cle: `n-${n.id_nation}`, type: 'nation', id_nation: n.id_nation, nom: n.nation
    })),
    ...dataStore.communautes.map(c => ({
      cle: `c-${c.id_communaute}`, type: 'communaute', id_nation: c.id_nation, nom: c.nom_communaute
    }))
  ];

  gPastilles.selectAll('circle')
    .data(donnees, d => d.cle)
    .join('circle')
      .attr('class', d => `pastille ${d.type}`)
      .attr('fill', d => couleurNation(d.id_nation))
    .append('title')              // infobulle native, temporaire pour le spike
      .text(d => d.nom);
}

/**
 * Place chaque pastille selon une disposition (Map clé → {x, y, r, o?}).
 * o (opacité) n'existe que pendant un fondu (G-09) ; 1 par défaut.
 */
export function placerPastilles(positions) {
  gPastilles.selectAll('circle')
    .attr('cx', d => positions.get(d.cle).x)
    .attr('cy', d => positions.get(d.cle).y)
    .attr('r',  d => positions.get(d.cle).r)
    .attr('opacity', d => positions.get(d.cle).o ?? 1);
}
