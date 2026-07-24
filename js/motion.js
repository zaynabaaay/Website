// Opening ceremony — Storiel
// The one shared open/close mechanism for every openable component
// (see the .opening contract documented in css/motion.css). Plays in
// full on first encounter; compresses to ~200ms afterward. Tracked in
// localStorage; no account required. See STORIEL_BRIEF.md §3.

document.querySelectorAll('.opening').forEach((opening) => {
  const id = opening.dataset.openingId || 'opening';
  const key = `storiel:opened:${id}`;
  const trigger = opening.querySelector('.opening-trigger');
  const panel = opening.querySelector('.opening-panel');

  try {
    if (localStorage.getItem(key) === 'true') {
      opening.classList.add('repeat');
    }
  } catch (err) {
    // localStorage can throw (e.g. cookies/site data blocked in Safari).
    // The ceremony must still open and close — it just won't remember
    // "already opened" on this device.
  }

  const toggle = () => {
    const isOpen = opening.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(isOpen));
    if (panel) panel.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) {
      try {
        localStorage.setItem(key, 'true');
      } catch (err) {
        // ignore — see above
      }
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
