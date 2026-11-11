// ==================================================
// js/utils/cadres.js
// Cadre de chaque zone dans le SVG
//
// Rôle : Mesurer où se trouve une zone dans la page et l’espace réservé à la visualisation
// Dépend de : aucun
// Utilisé par : main.js, layouts/
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

// Le SVG couvre toute la page : on mesure la position réelle de la zone
// par rapport au SVG (Playbook FF2EplusADA §3.3 : mesurer, jamais présumer).
export function cadreZone(idZone) {
  const svg = document.getElementById('visualisation').getBoundingClientRect();
  const zone = document.getElementById(idZone).getBoundingClientRect();
  const mobile = svg.width < 768;

  return {
    gauche: mobile ? 20 : svg.width * 0.38,           // écran large : deux tiers de droite
    largeur: mobile ? svg.width - 40 : svg.width * 0.58,
    haut: zone.top - svg.top + 80                       // marge sous le haut de la zone
  };
}
