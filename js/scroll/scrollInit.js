// ==================================================
// js/scroll/scrollInit.js
// Défilement
//
// Rôle : Appeler la mise à jour de la visualisation à chaque défilement, au plus une fois par image ; toujours initialisé en dernier
// Dépend de : aucun
// Utilisé par : main.js
//
// 2627_langues_autochtones_Web
// Isabel Cayer · Atelier Love & Code · 2026
// ==================================================

// requestAnimationFrame : on attend que le navigateur soit prêt à dessiner
// la prochaine image, pour ne pas recalculer plus souvent que l'écran ne s'affiche.
export function initScroll(miseAJour) {
  let enAttente = false;
  window.addEventListener('scroll', () => {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame(() => {
      miseAJour();
      enAttente = false;
    });
  }, { passive: true });
}
