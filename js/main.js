// ==================================================
// js/main.js
// Orchestrateur
//
// Rôle : Séquence d’initialisation unique : données, échelles, couches, interface, puis défilement
// Dépend de : tous les modules
// Utilisé par : index.html
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

import { loadData } from './data/dataLoader.js';
import { dataStore } from './data/dataStore.js';
import { initEchelles, majEchelles } from './utils/echelles.js';
import { cadreZone } from './utils/cadres.js';
import { initI18n } from './utils/i18n.js';
import { initPastilles, placerPastilles } from './layers/pastillesLayer.js';
import { initLiens } from './layers/liensLayer.js';
import { initAxe } from './layers/axeLayer.js';
import { initCarte, dessinerCarte } from './layers/carteLayer.js';
import { initRoue, dessinerRoue } from './layers/roueLayer.js';
import { initTooltip } from './components/tooltip.js';
import { initTableauDonnees } from './components/tableauDonnees.js';
import { initControles } from './components/controlesInterface.js';
import { layoutNations } from './layouts/layoutNations.js';
import { layoutPopulation } from './layouts/layoutPopulation.js';
import { layoutTerritoire } from './layouts/layoutTerritoire.js';
import { layoutRoueCentre, layoutRoue } from './layouts/layoutRoue.js';
import { calculerDispositions, positionsSelonDefilement } from './scroll/migrations.js';
import { initScroll } from './scroll/scrollInit.js';

// Une disposition par zone, dans l'ordre du récit
const DISPOSITIONS = {
  'zone-b': layoutNations,
  'zone-c': layoutPopulation,
  'zone-d': layoutTerritoire,
  'zone-e': [layoutRoueCentre, layoutRoue]   // deux temps : tout converge, puis chaque nation reprend sa place (E-03)
};

function miseAJour() {
  placerPastilles(positionsSelonDefilement());
}

function recalculer() {
  majEchelles(cadreZone('zone-c'));           // la taille des cercles suit le cadre (largeur, téléphone ou non)
  calculerDispositions(DISPOSITIONS);
  dessinerCarte();                             // même projection que la disposition de la zone D
  dessinerRoue(cadreZone('zone-e'));           // même géométrie que la disposition de la zone E
  miseAJour();
}

async function init() {
  await loadData();        // 1. TOUJOURS EN PREMIER
  initEchelles();          // 2. échelles partagées
  initI18n();
  initCarte();             // 3. couches, de l'arrière vers l'avant
  initAxe();
  initRoue();
  initLiens();
  initPastilles();
  initTooltip();           // 4. interface
  initTableauDonnees();
  initControles();

  recalculer();
  let minuterie;
  window.addEventListener('resize', () => {
    clearTimeout(minuterie);
    minuterie = setTimeout(recalculer, 150);
  });

  initScroll(miseAJour);   // 5. TOUJOURS EN DERNIER

  console.log(`Données chargées : ${dataStore.nations.length} nations, ${dataStore.communautes.length} communautés`);
}

init();
