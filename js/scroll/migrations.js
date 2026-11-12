// ==================================================
// js/scroll/migrations.js
// Migrations entre les zones
//
// Rôle : Interpoler entre deux dispositions selon la progression du défilement,
//        en courbe et en cascade par nation (G-02, G-08, BC-02, BC-03, BC-04) ;
//        sous prefers-reduced-motion, fondu sur place sans déplacement (G-09)
// Dépend de : js/utils/cadres.js, js/data/dataStore.js
// Utilisé par : main.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { cadreZone } from '../utils/cadres.js';
import { dataStore } from '../data/dataStore.js';

// --- Réglages à ajuster à l'œil ---
// Repère : la ligne horizontale de l'écran qui sert à mesurer la progression
// (0,5 = milieu de l'écran). (BC-01)
const REPERE_ECRAN = 0.5;
// Part de la zone pendant laquelle rien ne bouge (temps de lecture),
// avant que la migration commence. Logique de Shirley Wu (Data Sketches). (BC-01)
const DEBUT_MIGRATION = 0.35;
// Courbure des trajets : 0 = ligne droite, 0,5 = belle courbe en S. (BC-04)
const COURBURE = 0.5;
// Cascade (BC-03) : décalage de départ entre deux nations voisines
// (en part de la migration ; 0 = tout le monde part ensemble).
const DECALAGE_ENTRE_NATIONS = 0.015;
// Les communautés partent après les nations, avec ce retard.
const RETARD_COMMUNAUTES = 0.10;
// Mouvement réduit (G-09) : part de la migration où les pastilles commencent
// à s'effacer, et où elles ont fini de réapparaître. Le changement de
// disposition se fait à 0,5, quand elles sont invisibles.
const DEBUT_FONDU = 0.3;
const FIN_FONDU = 0.7;

// Préférence du système de la personne ; .matches est relu à chaque image,
// donc un changement de réglage en cours de lecture est pris en compte.
const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');

let ordreZones = [];        // ex. ['zone-b', 'zone-c']
let dispositions = {};      // id de zone → Map(clé → {x, y, r})
let delais = new Map();     // clé de pastille → retard de départ (0 à DELAI_MAX)
let DELAI_MAX = 0;

/** Retard de départ de chaque pastille : nations d'abord, puis communautés, nation par nation. */
function calculerDelais() {
  delais = new Map();
  // Même ordre que la zone B (alphabétique) : la cascade se lit de gauche à droite
  const nations = [...dataStore.nations].sort((a, b) => a.nation.localeCompare(b.nation, 'fr'));
  nations.forEach((nation, rang) => {
    const decalage = rang * DECALAGE_ENTRE_NATIONS;
    delais.set(`n-${nation.id_nation}`, decalage);
    nation.communautes.forEach(c => delais.set(`c-${c.id_communaute}`, RETARD_COMMUNAUTES + decalage));
  });
  DELAI_MAX = Math.max(...delais.values());
}

/** Calcule (ou recalcule après un redimensionnement) la disposition de chaque zone. */
export function calculerDispositions(fabriques) {
  ordreZones = Object.keys(fabriques);
  dispositions = {};
  ordreZones.forEach(id => { dispositions[id] = fabriques[id](cadreZone(id)); });
  calculerDelais();
}

/**
 * Point sur une courbe en S entre p et q (courbe de Bézier cubique) :
 * la pastille part à la verticale et arrive à la verticale,
 * comme les liens de d3.linkVertical. t va de 0 (départ) à 1 (arrivée).
 */
function pointSurCourbe(p, q, t) {
  const tirage = (q.y - p.y) * COURBURE;
  const c1 = { x: p.x, y: p.y + tirage };   // premier point de contrôle, sous le départ
  const c2 = { x: q.x, y: q.y - tirage };   // second point de contrôle, au-dessus de l'arrivée
  const u = 1 - t;
  return {
    x: u * u * u * p.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * q.x,
    y: u * u * u * p.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * q.y
  };
}

/** Mélange deux dispositions : T = 0 donne le départ, T = 1 donne l'arrivée. */
function interpoler(depart, arrivee, T) {
  const resultat = new Map();
  depart.forEach((p, cle) => {
    const q = arrivee.get(cle);
    // Chaque pastille a sa propre progression, décalée selon son retard (cascade)
    const tLocal = Math.min(1, Math.max(0, (T - delais.get(cle)) / (1 - DELAI_MAX)));
    // Pas d'accélération ajoutée (easing) : c'est le défilement de la personne qui donne le rythme.
    // Un easing rendait le mouvement près de 4 fois plus rapide à son maximum (testé le 11 nov.).
    const t = tLocal;
    const { x, y } = pointSurCourbe(p, q, t);
    resultat.set(cle, { x, y, r: p.r + (q.r - p.r) * t, o: 1 });   // mise à l'échelle au même rythme (BC-02)
  });
  return resultat;
}

/**
 * Mouvement réduit (G-09) : aucune pastille ne se déplace.
 * Le départ s'efface sur place, puis l'arrivée apparaît sur place.
 * T = 0 donne le départ (opacité 1), T = 1 donne l'arrivée (opacité 1).
 */
function fonduSurPlace(depart, arrivee, T) {
  const avantMilieu = T < 0.5;
  const disposition = avantMilieu ? depart : arrivee;
  const o = avantMilieu
    ? 1 - Math.min(1, Math.max(0, (T - DEBUT_FONDU) / (0.5 - DEBUT_FONDU)))
    : Math.min(1, Math.max(0, (T - 0.5) / (FIN_FONDU - 0.5)));

  // Nouvelle Map : on ne modifie jamais les dispositions calculées
  const resultat = new Map();
  disposition.forEach(({ x, y, r }, cle) => resultat.set(cle, { x, y, r, o }));
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
      const T = (progression - DEBUT_MIGRATION) / (1 - DEBUT_MIGRATION);
      const migrer = mouvementReduit.matches ? fonduSurPlace : interpoler;
      return migrer(dispositions[ordreZones[i]], dispositions[ordreZones[i + 1]], T);
    }
  }
  return dispositions[ordreZones[ordreZones.length - 1]];
}
