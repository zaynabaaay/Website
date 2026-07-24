// Opening ceremony state — Storiel
// Plays in full on first encounter; compresses to ~200ms afterward.
// Tracked in localStorage; no account required. See STORIEL_BRIEF.md §3.

document.querySelectorAll('.demo-card').forEach((card) => {
  const id = card.dataset.cardId || 'demo';
  const key = `storiel:opened:${id}`;
  const trigger = card.querySelector('.demo-card-trigger');

  if (localStorage.getItem(key) === 'true') {
    card.classList.add('repeat');
  }

  const toggle = () => {
    card.classList.toggle('is-open');
    if (card.classList.contains('is-open')) {
      localStorage.setItem(key, 'true');
    }
  };

  trigger.addEventListener('click', toggle);
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });
});
