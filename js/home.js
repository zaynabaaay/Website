// Homepage — the self-opening demonstration.
//
// The brief (§8 Phase 5) asks for a product that opens itself, once. This
// does not re-implement opening: js/motion.js and the shared .opening
// contract still own that. All this does is trigger the same mechanism
// unattended, on a visitor's first arrival, and only when the piece has
// not been opened before.
//
// "Plays once" is judged by the same localStorage key motion.js already
// writes, so clicking it manually on a first visit also counts, and the
// demonstration never plays at someone twice.

(function () {
  const opening = document.querySelector('.home .opening');
  if (!opening) return;

  const id = opening.dataset.openingId;
  const key = `storiel:opened:${id}`;

  let alreadyOpened = false;
  try {
    alreadyOpened = localStorage.getItem(key) === 'true';
  } catch (err) {
    // Storage blocked (see js/motion.js). Treat as a first visit: the
    // demonstration plays, which is the safe direction to fail in.
  }

  if (alreadyOpened) return;

  // Reduced motion is handled entirely in CSS — the same .is-open state
  // crossfades instead of hinging — so there is nothing to branch on
  // here. Only the delay is trimmed, so the piece does not sit still for
  // most of a second for someone who has asked for less movement.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const delay = reduced ? 200 : 700;

  function play() {
    if (opening.classList.contains('is-open')) return; // opened it themselves
    const trigger = opening.querySelector('.opening-trigger');
    if (trigger) trigger.click();
  }

  // The demonstration is not on the first spread, so a timer from page
  // load would play it to an empty screen and it would be missed — and
  // it only ever plays once. Wait until the visitor has actually
  // scrolled to it.
  if (!('IntersectionObserver' in window)) {
    window.setTimeout(play, delay);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      window.setTimeout(play, delay);
    });
  }, { threshold: 0.6 });

  observer.observe(opening);
})();
