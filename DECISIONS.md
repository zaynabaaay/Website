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
