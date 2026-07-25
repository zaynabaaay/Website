// The piece — page gating, progress reporting, resume.
// Runs inside a sandboxed iframe when previewed (opaque origin, so
// localStorage is unavailable here by design). All persistence lives in
// the parent; this file only reports where the reader is and accepts a
// starting page. See STORIEL_BRIEF.md §7.

(function () {
  const params = new URLSearchParams(location.search);
  const pages = Array.from(document.querySelectorAll('.piece-page'));
  const total = pages.length;

  // ?gate=N — show only the first N pages, then the gate card. Absent
  // for the purchased piece, which shows everything.
  const gate = parseInt(params.get('gate'), 10);
  const gated = Number.isInteger(gate) && gate > 0 && gate < total;

  if (gated) {
    pages.slice(gate).forEach((page) => page.remove());
    const card = document.getElementById('piece-gate');
    if (card) {
      card.hidden = false;
      const marker = document.getElementById('piece-gate-marker');
      if (marker) marker.textContent = `Preview: pages 1–${gate} of ${total}.`;
    }
  } else {
    const card = document.getElementById('piece-gate');
    if (card) card.remove();
  }

  const scroller = document.querySelector('.piece');

  // ?start=N — resume at a page the reader already reached.
  const start = parseInt(params.get('start'), 10);
  if (Number.isInteger(start) && start > 1) {
    const target = document.querySelector(`.piece-page[data-page="${start}"]`);
    if (target) target.scrollIntoView({ behavior: 'auto' });
  }

  // Report the furthest page reached to the parent, which owns storage.
  function report() {
    const visible = Array.from(document.querySelectorAll('.piece-page')).find((page) => {
      const box = page.getBoundingClientRect();
      return box.top <= window.innerHeight / 2 && box.bottom >= window.innerHeight / 2;
    });
    if (!visible || window.parent === window) return;
    window.parent.postMessage(
      { type: 'storiel:progress', page: Number(visible.dataset.page), total },
      '*'
    );
  }

  if (scroller) {
    let queued = false;
    scroller.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        report();
      });
    });
  }

  report();
})();
