const CARD_ENTRANCE_STAGGER_MS = 100;

window.onload = () => {
  let delay = 0;
  document.querySelectorAll('.card').forEach((cardEl) => {
  	setTimeout(() => {
  	  cardEl.classList.add('visible');
  	}, delay);
  	delay += CARD_ENTRANCE_STAGGER_MS;
  });
};