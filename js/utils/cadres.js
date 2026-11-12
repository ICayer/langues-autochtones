// ==================================================
// js/utils/cadres.js
// Cadre de chaque zone dans le SVG
//
// Rôle : Mesurer où se trouve une zone dans la page et l’espace réservé à la visualisation
// Dépend de : aucun
// Utilisé par : main.js, layouts/, scroll/migrations.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

// Seule décision « téléphone ou écran large » de tout le JavaScript.
// ATTENTION : 768px doit rester identique à la requête @media de css/style.css,
// pour que la mise en page et les dispositions basculent en même temps.
const TELEPHONE = window.matchMedia('(max-width: 768px)');

// Le SVG couvre toute la page : on mesure la position réelle de la zone
// par rapport au SVG (Playbook FF2EplusADA §3.3 : mesurer, jamais présumer).
/** @returns {{gauche:number, largeur:number, haut:number, etroit:boolean}} */
export function cadreZone(idZone) {
  const svg = document.getElementById('visualisation').getBoundingClientRect();
  const zone = document.getElementById(idZone).getBoundingClientRect();
  const mobile = TELEPHONE.matches;

  // Sur téléphone, la visualisation commence sous le bloc de texte :
  // au repos, une pastille n'est jamais sous le texte.
  const texte = document.querySelector(`#${idZone} .texte`);
  const basTexte = texte ? texte.getBoundingClientRect().bottom - svg.top : zone.top - svg.top;

  return {
    gauche: mobile ? 20 : svg.width * 0.38,            // écran large : deux tiers de droite
    largeur: mobile ? svg.width - 40 : svg.width * 0.58,
    haut: mobile ? basTexte + 30 : zone.top - svg.top + 80,
    etroit: mobile            // les dispositions, les échelles et la projection lisent ce champ
  };
}

/** Nombre de nations par rangée : une seule règle pour toutes les zones. */
export function nationsParRangee(cadre) {
  return cadre.etroit ? 3 : 6;
}
