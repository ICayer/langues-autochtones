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
import { initEchelles } from './utils/echelles.js';
import { initI18n } from './utils/i18n.js';
import { initPastilles, placerPastilles } from './layers/pastillesLayer.js';
import { layoutNations } from './layouts/layoutNations.js';
import { cadreZone } from './utils/cadres.js';
import { initLiens } from './layers/liensLayer.js';
import { initAxe } from './layers/axeLayer.js';
import { initCarte } from './layers/carteLayer.js';
import { initRoue } from './layers/roueLayer.js';
import { initTooltip } from './components/tooltip.js';
import { initTableauDonnees } from './components/tableauDonnees.js';
import { initControles } from './components/controlesInterface.js';
import { initScroll } from './scroll/scrollInit.js';

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
  initScroll();            // 5. TOUJOURS EN DERNIER

  // Spike, étape 1 : afficher les pastilles dans la zone B
  dessinerZoneB();
  let minuterie;
  window.addEventListener('resize', () => {
    clearTimeout(minuterie);
    minuterie = setTimeout(dessinerZoneB, 150);  // recalcule après un redimensionnement
  });

  // Vérification du squelette (à retirer plus tard)
  console.log(`Données chargées : ${dataStore.nations.length} nations, ${dataStore.communautes.length} communautés`);
}

function dessinerZoneB() {
  placerPastilles(layoutNations(cadreZone('zone-b')));
}

init();
