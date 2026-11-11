// ==================================================
// js/layouts/layoutPopulation.js
// Disposition de la zone C
//
// Rôle : Nations dimensionnées selon leur population, communautés en beeswarm sur un axe des populations : horizontal sur écran large, vertical sur téléphone (C-02, C-03, C-04, C-10)
// Dépend de : js/data/dataStore.js, js/utils/echelles.js, js/utils/cadres.js
// Utilisé par : main.js, scroll/migrations.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { dataStore } from '../data/dataStore.js';
import { rayonPopulation } from '../utils/echelles.js';
import { nationsParRangee as parRangee, estEtroit } from '../utils/cadres.js';

const POPULATION_MAX_AXE = 15000;
const ESPACE_NATIONS_AXE = 80;       // écran large : entre la dernière rangée de nations et l'axe
const ESPACE_ENTRE_PASTILLES = 1.5;  // petit jour entre deux communautés voisines
const ESPACE_ENTRE_NATIONS = 10;     // téléphone : entre deux nations de la colonne
const ITERATIONS_BEESWARM = 300;

/**
 * Beeswarm (C-04) : chaque communauté est attirée vers sa population sur l'axe,
 * attirée plus faiblement vers la ligne de l'axe, et repoussée par ses voisines.
 * Le calcul est fait d'avance, en entier, puis figé : la disposition est stable,
 * et les migrations partent toujours des mêmes positions.
 * @param {'horizontale'|'verticale'} orientation - sens de l'axe des populations
 * @param {Function} echelle - population → position le long de l'axe
 * @param {number} ligneAxe - position de la ligne de l'axe (y si horizontale, x si verticale)
 */
function beeswarm(communautes, orientation, echelle, ligneAxe) {
  const horizontale = orientation === 'horizontale';
  const noeuds = communautes.map((c, i) => {
    const surAxe = echelle(c.population_communaute);
    const decalage = (i % 7) - 3;                  // départ légèrement décalé, toujours le même
    return {
      cle: `c-${c.id_communaute}`,
      r: rayonPopulation(c.population_communaute),
      cible: surAxe,
      x: horizontale ? surAxe : ligneAxe + decalage,
      y: horizontale ? ligneAxe + decalage : surAxe
    };
  });

  // Force forte le long de l'axe (la population), force faible vers la ligne de l'axe
  const forceLeLong = horizontale
    ? d3.forceX(d => d.cible).strength(0.9)
    : d3.forceY(d => d.cible).strength(0.9);
  const forceVersLigne = horizontale
    ? d3.forceY(ligneAxe).strength(0.08)
    : d3.forceX(ligneAxe).strength(0.08);

  d3.forceSimulation(noeuds)
    .randomSource(d3.randomLcg(42))   // même résultat à chaque chargement
    .force('leLong', forceLeLong)
    .force('versLigne', forceVersLigne)
    .force('collision', d3.forceCollide(d => d.r + ESPACE_ENTRE_PASTILLES).iterations(3))
    .stop()
    .tick(ITERATIONS_BEESWARM);

  return noeuds;
}

/** Nations de la plus petite à la plus grande (C-02). */
function nationsParTaille() {
  return [...dataStore.nations].sort((a, b) => a.population_nation - b.population_nation);
}

/** Écran large : nations en rangées, axe horizontal sous le nuage. */
function dispositionHorizontale({ gauche, largeur, haut }, positions) {
  const nations = nationsParTaille();
  const nationsParRangee = parRangee(largeur);
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

  const rayonMaxCommunaute = d3.max(dataStore.communautes, c => rayonPopulation(c.population_communaute));
  const yAxe = y + ESPACE_NATIONS_AXE + rayonMaxCommunaute;
  const x = d3.scaleSqrt().domain([0, POPULATION_MAX_AXE]).range([gauche, gauche + largeur]);

  beeswarm(dataStore.communautes, 'horizontale', x, yAxe)
    .forEach(n => positions.set(n.cle, { x: n.x, y: n.y, r: n.r }));
}

/**
 * Téléphone (option A, C-10) : nations en colonne à gauche, de la plus petite en bas
 * à la plus grande en haut ; axe vertical à droite, 0 en bas et 15 000 en haut.
 * Tout se lit de bas en haut, et on profite de la hauteur de la page.
 */
function dispositionVerticale({ gauche, largeur, haut }, positions) {
  const nations = nationsParTaille();
  const rayonMaxNation = d3.max(nations, n => rayonPopulation(n.population_nation));
  const largeurColonneNations = rayonMaxNation * 2 + 10;

  // Hauteur totale de la colonne : elle donne aussi la longueur de l'axe
  const hauteurColonne = d3.sum(nations, n => rayonPopulation(n.population_nation) * 2)
    + ESPACE_ENTRE_NATIONS * (nations.length - 1);
  const bas = haut + hauteurColonne;

  // Colonne des nations : on empile de bas en haut
  const xNations = gauche + largeurColonneNations / 2;
  let y = bas;
  nations.forEach(nation => {
    const r = rayonPopulation(nation.population_nation);
    y -= r;
    positions.set(`n-${nation.id_nation}`, { x: xNations, y, r });
    y -= r + ESPACE_ENTRE_NATIONS;
  });

  // Axe vertical au milieu de l'espace de droite : 0 en bas, 15 000 en haut
  const debutDroite = gauche + largeurColonneNations + 20;
  const xAxe = debutDroite + (gauche + largeur - debutDroite) / 2;
  const yEchelle = d3.scaleSqrt().domain([0, POPULATION_MAX_AXE]).range([bas, haut]);

  beeswarm(dataStore.communautes, 'verticale', yEchelle, xAxe)
    .forEach(n => positions.set(n.cle, { x: n.x, y: n.y, r: n.r }));
}

/** @returns {Map<string, {x:number, y:number, r:number}>} */
export function layoutPopulation(cadre) {
  const positions = new Map();
  if (estEtroit(cadre.largeur)) dispositionVerticale(cadre, positions);
  else dispositionHorizontale(cadre, positions);
  return positions;
}
