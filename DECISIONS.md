# DECISIONS.md

Running log of choices, assumptions, and open questions made while building
Storiel, per the checkpoint protocol in `STORIEL_BRIEF.md` §0. Updated at
the end of every phase.

---

## Pre-Phase 1

- Repository initialized. `STORIEL_BRIEF.md` committed as the governing
  document. `CLAUDE.md` added to orient AI assistants working in this repo.
- No code has been written yet. All open questions in `STORIEL_BRIEF.md` §9
  remain unanswered by the founder.

## Phase 1 — Foundations

- **Stack decision:** plain static HTML/CSS/JS, no build tool or framework.
  Chosen for a small, ceremony-light site deploying directly to GitHub
  Pages with no build step. Not one of the brief's open questions, but
  worth recording since it shapes every later phase.
- **Typeface (open question §9.1):** still unresolved. Founder chose to
  defer and use a provisional placeholder (Source Serif 4) rather than
  pick from the candidate list now. `--font-serif` in `css/tokens.css` is
  the single place to swap it later.
- Built: design tokens file (color, type scale, spacing scale, motion
  tokens), base styles, the two-zone layout primitives implemented with
  CSS scroll-snap for the storytelling zone and plain scroll for the
  errand zone, a placeholder fleuron (Unicode glyph, since final artwork
  per §9.5 doesn't exist yet), and an opening-ceremony demo card that
  plays a full hinge animation on first open and compresses to ~200ms on
  repeat (state in `localStorage`), with a mandatory crossfade under
  `prefers-reduced-motion`.
- Verified locally: color/type/spacing tokens render, fleuron rotates on
  hover/focus, demo card opens via mouse and keyboard (Enter/Space),
  reduced-motion crossfade confirmed, both scroll physics work
  independently, no console errors.
- Deliverable is `index.html` at the repo root — a living style page, not
  the homepage. Homepage is built last, in Phase 5.
- Open questions still outstanding from §9: real typeface, real prices,
  hosting/permanence model, final seal colors, fleuron artwork, launch
  catalogue size, preview gate thresholds, Ada & June content, payment
  provider.

### Bug fix: reduced motion made the opening ceremony disappear

- **Reported:** with OS Reduce Motion on (Safari/iPad), tapping the demo
  card made it vanish instead of crossfading to an opened state. Violated
  §6: reduced motion must fade the closed state out and the opened state
  in, landing on the same end state as the full ceremony.
- **Root cause:** the demo card never had a real "opened" state. Under
  full motion the cover just rotated away in 3D with nothing behind it;
  under reduced motion it faded straight to `opacity: 0` with no content
  to fade in. There was nothing to reveal in either mode — reduced motion
  just made the gap obvious.
- **Fix:** introduced a shared `.opening` / `.opening-cover` /
  `.opening-panel` contract (`css/motion.css`, `js/motion.js`,
  `index.html`). The cover is always in flow; the panel is absolutely
  positioned underneath it and holds the actual opened content. Both
  motion modes now toggle the same `is-open` state to the same end
  values (cover `opacity: 0`, panel `opacity: 1`); only the transition
  differs — full motion adds a `rotateY` hinge on the cover, reduced
  motion is opacity-only. Verified with Playwright across all four
  combinations (first-open/repeat-open × full-motion/reduced-motion):
  end-state opacity, pointer-events, and ARIA (`aria-expanded`,
  `aria-hidden`) all match between motion modes.
- **Generalized on purpose:** renamed from card-specific classes
  (`.demo-card`, `.demo-card-cover`) to a reusable component
  (`.opening`, `.opening-cover`, `.opening-panel`, `.opening-trigger`)
  so this is the one opening/closing mechanism every future ceremony
  reuses — the product cover in Phase 3 and the preview cover in Phase 4
  — rather than each one growing its own animation code and risking the
  same bug again. The contract is documented directly above the rules in
  `css/motion.css`.

### Bug fix: demo card unresponsive on iOS Safari (independent of the reduced-motion fix above)

- **Reported:** on iPhone/iPad Safari, tapping the demo card did nothing —
  not fixed by turning Reduce Motion off, so a separate issue from the
  crossfade bug above.
- **Root cause, confirmed:** `js/motion.js` called `localStorage.getItem`/
  `.setItem` with no error handling. Safari throws a `SecurityError` from
  `localStorage` when the user has site data/cookies blocked (a real,
  reachable Safari privacy setting, not a hypothetical). That exception
  fired during setup, before `trigger.addEventListener('click', toggle)`
  ever ran — so the tap handler was simply never attached. Everything
  else on the page kept working because it's pure CSS (fleuron hover) or
  native browser behavior (scrolling), which is why only the card seemed
  broken. Reproduced directly: re-ran the pre-fix `motion.js` with
  `localStorage` forced to throw and confirmed the click handler never
  attaches (`is-open` never gets applied); confirmed the new code attaches
  it correctly under the same condition.
- **Fix:** wrapped both `localStorage` calls in `try/catch`. The opening
  ceremony's open/close behavior no longer depends on storage succeeding
  — if it throws, the ceremony still opens and closes, it just can't
  remember "already opened" on that device (falls back to full-duration
  animation every time instead of compressing to the repeat duration).
