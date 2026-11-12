// ==================================================
// js/utils/colors.js
// Palette des nations
//
// Rôle : Centraliser les couleurs, jamais de couleur inline (G-12)
// Dépend de : d3 (chargé dans index.html)
// Utilisé par : layers/, components/
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

// PROVISOIRE (G-12) : palette de travail pour le spike seulement.
// À remplacer par la palette validée, avec un contraste suffisant.
const PALETTE_PROVISOIRE = [...d3.schemeTableau10, '#6b6b6b'];

// PROVISOIRE : fond de carte de la zone D, gris clair, trait fin
export const COULEURS_CARTE = {
  remplissage: '#ebebeb',
  trait: '#d4d4d4'
};

// PROVISOIRE : repère de la roue (zone E), seulement pour juger les positions à l'œil
export const COULEURS_ROUE = {
  trait: '#c4c4c4'
};

export function couleurNation(idNation) {
  return PALETTE_PROVISOIRE[(idNation - 1) % PALETTE_PROVISOIRE.length];
}
