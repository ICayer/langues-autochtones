// ==================================================
// js/utils/cadres.js
// Cadre de chaque zone dans le SVG
//
// Rôle : Mesurer où se trouve une zone dans la page et l’espace réservé à la visualisation
// Dépend de : aucun
// Utilisé par : main.js, scroll/migrations.js
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

  // Sur téléphone, la visualisation commence sous le bloc de texte :
  // au repos, une pastille n'est jamais sous le texte.
  const texte = document.querySelector(`#${idZone} .texte`);
  const basTexte = texte ? texte.getBoundingClientRect().bottom - svg.top : zone.top - svg.top;

  return {
    gauche: mobile ? 20 : svg.width * 0.38,            // écran large : deux tiers de droite
    largeur: mobile ? svg.width - 40 : svg.width * 0.58,
    haut: mobile ? basTexte + 30 : zone.top - svg.top + 80
  };
}
