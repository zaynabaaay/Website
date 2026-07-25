// Preview controller (parent side) — Storiel.
//
// The preview is the real product build running in a sandboxed iframe
// (STORIEL_BRIEF.md §7), gated at a threshold chosen per product. The
// iframe is sandboxed WITHOUT allow-same-origin, so it has an opaque
// origin and cannot reach localStorage itself — all persistence lives
// here, in the parent. The piece reports progress by postMessage; this
// file stores it and hands back a starting page on return.
//
// Opening/closing is not handled here: that is js/motion.js and the
// shared .opening contract. This file only watches for the open state.

(function () {
  const opening = document.querySelector('.opening.preview');
  const frame = document.getElementById('preview-frame');
  if (!opening || !frame) return;

  const productId = opening.dataset.previewId;
  const gate = parseInt(opening.dataset.previewGate, 10);
  const key = `storiel:progress:${productId}`;

  const resumeBox = document.getElementById('preview-resume');
  const resumeText = document.getElementById('preview-resume-text');
  const resumeBtn = document.getElementById('preview-resume-btn');
  const restartBtn = document.getElementById('preview-restart-btn');

  function readProgress() {
    try {
      return parseInt(localStorage.getItem(key), 10) || 0;
    } catch (err) {
      return 0; // storage blocked — preview still works, just never resumes
    }
  }

  function writeProgress(page) {
    try {
      localStorage.setItem(key, String(page));
    } catch (err) {
      // ignore — see js/motion.js
    }
  }

  function load(startPage) {
    let src = `piece/?gate=${gate}`;
    if (startPage > 1) src += `&start=${startPage}`;
    frame.src = src;
  }

  let loaded = false;

  function openPreview() {
    if (loaded) return;
    loaded = true;

    const reached = readProgress();
    if (reached > 1) {
      // Offer both, per the brief: resume or restart on return.
      resumeText.textContent = `You reached page ${reached}.`;
      resumeBox.hidden = false;
      resumeBtn.addEventListener('click', () => {
        resumeBox.hidden = true;
        load(reached);
      });
      restartBtn.addEventListener('click', () => {
        resumeBox.hidden = true;
        writeProgress(1);
        load(1);
      });
    } else {
      load(1);
    }
  }

  // The shared mechanism owns .is-open; watch for it rather than binding
  // a second click handler to the same trigger.
  new MutationObserver(() => {
    if (opening.classList.contains('is-open')) openPreview();
  }).observe(opening, { attributes: true, attributeFilter: ['class'] });

  // The sandboxed iframe has an opaque origin, so event.origin is "null".
  // Identify it by window reference instead.
  window.addEventListener('message', (event) => {
    if (event.source !== frame.contentWindow) return;
    const data = event.data;
    if (!data || data.type !== 'storiel:progress') return;
    const page = Number(data.page);
    if (!Number.isInteger(page) || page < 1) return;
    if (page > readProgress()) writeProgress(page);
  });
})();
