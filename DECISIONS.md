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

### Bug fix: stale CSS cache showed cover and panel stacked instead of overlaid

- **Reported:** on the founder's iPad, regular (non-Incognito) Safari
  showed both the cover and the panel as separate stacked boxes at all
  times — pressing one just changed the fleuron icon, not an open/close
  reveal. The same page in a private tab worked correctly (cover hidden,
  panel shown, matching the intended overlay behavior).
- **Root cause:** the browser was serving a fresh `index.html` (with the
  `.opening-cover`/`.opening-panel` markup already in it) alongside a
  *stale cached* `css/motion.css` from before that markup existed — so
  none of the new overlay/opacity/positioning rules applied, and the two
  elements just rendered as plain stacked blocks per the inline swatch
  styling in `index.html`. Private/Incognito browsing always fetches
  fresh, which is why only the regular tab showed it. GitHub Pages gives
  no way to set cache-control headers to prevent this.
- **Fix:** added a `?v=2` query string to every `css/`/`js/` asset link in
  `index.html`, forcing browsers to treat them as new URLs and fetch
  fresh copies. Documented the convention in `CLAUDE.md`: bump the
  version on any file that changes, in every HTML file linking to it —
  this will recur on every future phase otherwise.

## Phase 1 addendum — palette and typeface comparison tools

Built alongside Phase 2, at the founder's request, to unblock the two
open questions §9.1 (typeface) and §9.4 (seal colors) without guessing.
Both live on the Phase 1 style page (`index.html`) as review tooling —
not part of the site itself, and nothing they do is saved to the token
files.

- **Palette comparison:** four candidate palettes plus the current
  provisional one, toggled live via buttons that override
  `--color-seal-1..5` on `:root`. Because every existing swatch, the
  opening-ceremony demo card, and a new set of catalogue-thumbnail-style
  preview blocks all already read those custom properties, switching
  palettes recolors all of them at once — nothing bespoke to keep in
  sync. Reverting to "Current" simply removes the inline override, so
  `css/tokens.css` is never touched by this tool.
- **Contrast checking, computed, not eyeballed:** implemented the WCAG
  relative-luminance/contrast-ratio formula in JS and check every
  candidate color against paper (#FAF7F2) at the AA normal-text
  threshold (4.5:1), since colophon size counts as small text. Results,
  verified against an independent Python calculation of the same
  formula:
  - **Palette A — Ink & Pigment:** 1 of 5 colors fails (#A67F2E, gold,
    3.45:1). The other four pass comfortably (5.1–8.3:1).
  - **Palette B — Wax & Thread:** 2 of 5 fail (#D98E5F at 2.46:1 fails
    even AA-large; #5E8A87 at 3.60:1 fails normal text but passes
    AA-large).
  - **Palette C — Faded Celebration:** fails outright — all 5 colors
    fail even the more permissive AA-large threshold (3:1), let alone
    normal text. Every color sits in the 2.0–3.0:1 range against paper.
  - **Palette D — One Color:** passes (#8E2A23, 7.84:1). Only one hue,
    applied to all five seal slots.
  - **Worth flagging independent of any candidate palette:** today's
    *current provisional* seal colors already have two failures —
    seal-2 (#C4572E, 4.14:1) and seal-5 (#C79A3B, 2.42:1) — if either
    is ever used for small text rather than only backgrounds/thumbnails.
    Not a regression, just a pre-existing fact worth having on record
    before final colors are sampled.
- **Typeface comparison:** the three brief candidates (Source Serif 4,
  Fraunces at low optical size, Newsreader) plus "Current," toggled the
  same way — overriding `--font-serif` on `:root`, which cascades to
  the *entire page* (base.css sets it once, on `body`) since it's a
  single shared token, not five like the seal colors. Fraunces is forced
  to its low optical size (`font-variation-settings: 'opsz' 9`) rather
  than letting the browser auto-select a higher optical size at heading
  scale, since that low-opsz character (ink traps, quirkier detailing)
  is specifically what the brief asked to audition. Fonts are loaded
  live from Google Fonts (not self-hosted) — fine for a review tool;
  worth a self-hosting decision once a typeface is actually chosen, to
  keep the "must still feel fast" performance budget (§7) intact
  sitewide.
- **Testing note:** verified the mechanism end-to-end — real font
  binaries fetched from Google Fonts (valid WOFF2, confirmed by
  inspecting the response), `document.fonts.check()` true for all
  three, computed `font-family`/`font-variation-settings` switching
  correctly per click. Could **not** visually confirm the three faces
  paint distinctly from within this environment's headless test
  browser — even basic system-font swaps (Georgia/Arial/Courier)
  rendered fine, but all three downloaded webfonts painted pixel-
  identical to each other, pointing to a font-rasterization limitation
  in this sandbox rather than a page bug. Needs an eyes-on check in a
  real browser before treating the visual comparison as trustworthy.

## Phase 2 — Catalogue (errand zone)

- **Placeholder data, explicitly marked:** all four product names and
  prices below are placeholders supplied by the founder for layout
  purposes only, not final. Displayed with literal brackets in the UI
  (`[Save the Date]`, etc.), matching the brief's own placeholder
  convention (§0) rather than lorem ipsum:
  1. [Save the Date] — wedding — a thirty-second story — €40
  2. [Wedding Invitation] — wedding — a one-minute story — €90
  3. [Anniversary Scroll] — anniversary — a two-minute story — €140
  4. [Birthday Story] — birthday — a two-minute story — €140
- Built `catalogue/index.html` (URL `/catalogue/`), `css/catalogue.css`,
  `js/catalogue.js`. Errand-zone conventions: normal scrolling, no
  scroll-snap, no opening ceremony — the grid is visible immediately.
- Thumbnails are flat placeholder blocks, one seal color per product
  (seal-1 through seal-4), not real preview renders — real live preview
  thumbnails wait on Phase 4 (the first real preview).
- Filter is a set of plain occasion buttons (All/Wedding/Anniversary/
  Birthday); search is a plain-text substring match against each card's
  title/occasion/duration. Both are client-side only, no URL/query-param
  sync yet — small enough at 4 products that it wasn't worth adding.
- Verified locally: filtering by occasion narrows correctly, search
  matches "wedding" and "birthday" correctly, a non-matching search
  shows the empty-state message, no console errors.
- Open questions still outstanding from §9: real typeface (tooling now
  exists above to help decide), real seal colors (tooling now exists
  above to help decide), hosting/permanence model, fleuron artwork,
  launch catalogue size (this phase used 4 as a placeholder count, not
  a decision), preview gate thresholds, Ada & June content, payment
  provider.

## Seal palette: palette C adopted as working set, restructured as tint/text pairs

- **Founder decision:** palette C "Faded Celebration" is the working
  seal palette — still provisional until physical sampling (§9.4), but
  it replaces the original provisional hexes in `css/tokens.css`.
- **Why pairs:** every C tint fails WCAG AA for text against paper
  (2.0–3.0:1, below even the 3:1 large-text bar — measured during the
  palette comparison). Rather than reject the palette or ship failing
  text, each seal token is now a pair:
  - `--seal-N` — the display tint, exactly the founder's C values.
    Backgrounds, thumbnails, blocks only; never text.
  - `--seal-N-text` — the same hue converted to OKLCH, lightness
    reduced (hue/chroma held; binary-searched to the *highest*
    lightness that still passes, so the shade stays as close to the
    tint as the contrast floor allows) until it clears 4.5:1 against
    paper. The only seal form allowed on text at any size.
- **Derived values** (all verified ≥4.5:1 after hex rounding; seal-4
  needed a small chroma clamp, 0.122→0.115, to stay inside sRGB gamut
  when darkened):
  | slot | tint (vs paper) | text shade (vs paper) |
  |---|---|---|
  | seal-1 | #C4838B (2.82:1) | #9E6069 (4.54:1) |
  | seal-2 | #7A96B8 (2.86:1) | #5A7495 (4.50:1) |
  | seal-3 | #A8B58A (2.04:1) | #6B764E (4.54:1) |
  | seal-4 | #D9A94E (2.02:1) | #956A00 (4.53:1) |
  | seal-5 | #9B8AA3 (3.00:1) | #7D6C85 (4.51:1) |
- **Token rename:** `--color-seal-N` → `--seal-N` (+ new
  `--seal-N-text`), per the founder's requested naming. All references
  migrated (style page, catalogue thumbnails); nothing else consumed
  the old names.
- **Consequential change — demo card text:** the card previously set
  paper-colored text on its seal backgrounds. On C's light tints that
  fails badly, and a tint-on-tint or text-shade-on-tint combination
  can't reach 4.5:1 either, so the card now uses **ink** text on tint
  backgrounds (≈5.5:1 on the worst tint). Rule of thumb going forward:
  tints carry ink text, paper carries either ink or `--seal-N-text`
  text, and bare tints never carry text of any color.
- **Style page:** the candidate-palette toggle (A–D) is retired — its
  job was choosing, and a choice has been made; DECISIONS.md records
  the losing candidates. In its place the section shows the five
  adopted pairs: tint block, text shade beneath it at colophon size,
  and both contrast ratios computed live in the browser from the
  actual token values (not a hardcoded copy), so the display can't
  silently disagree with `css/tokens.css`. The typeface comparison
  toggle remains — that question is still open.
- Verified: all five pairs pass in the live audit, demo card opens
  correctly with the new colors, catalogue thumbnails resolve to the C
  tints, no console errors on either page.
