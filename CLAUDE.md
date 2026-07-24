# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

Phase 1 (Foundations) is built. The site is **plain static HTML/CSS/JS** — no package manager, build step, framework, or test runner. This was a deliberate choice for a small, ceremony-light site that deploys straight to GitHub Pages; keep using plain HTML/CSS/JS unless a later phase (e.g. checkout in Phase 6) genuinely requires more.

There is no build/lint/test command because there's no toolchain. To preview locally, serve the repo root with any static file server, e.g. `python3 -m http.server` and open `index.html`.

**Cache-busting is required on every CSS/JS edit.** GitHub Pages doesn't let us set cache-control headers, and browsers (Safari in particular) cache `.css`/`.js` aggressively enough that users can get fresh HTML paired with stale CSS/JS — the two silently drift out of sync with no error, just broken-looking behavior. Every `<link>`/`<script>` tag that points at a file under `css/` or `js/` carries a `?v=N` query string; bump `N` on *every* file you reference whenever its content changes, in every HTML file that links to it. Forgetting this is a real, already-hit bug, not a hypothetical.

`index.html` is currently the Phase 1 **living style page** (tokens, type, spacing, motion, both zone physics, the opening-ceremony demo) — it is explicitly not the final homepage. Phase 5 replaces it with the real homepage; until then, treat `index.html` as a foundations reference, not production UI. It also carries two founder-facing review tools that are not part of the site itself: a **palette comparison** (toggles candidate seal-color sets live by overriding `--color-seal-1..5` on `:root`, with computed WCAG contrast checks against paper) and a **typeface comparison** (same pattern, overriding `--font-serif`, which cascades to the whole page since it's one shared token). Both are pure runtime overrides — they never touch `css/tokens.css` — so "current tokens stay in place until a palette/typeface is actually chosen" holds by construction. If real fonts need visual verification, note that this environment's headless test browser has been observed to render distinct downloaded webfonts pixel-identically (a sandbox font-rasterization limitation, confirmed against working system-font rendering) even when `document.fonts.check()` and computed styles are correct — trust a real browser for the final visual call, not a headless screenshot here.

`catalogue/index.html` (Phase 2) is the Catalogue index, served at `/catalogue/`. Errand zone: normal scrolling, no scroll-snap, no opening ceremony. Its four products are placeholder names/prices (bracketed, e.g. `[Save the Date]`) — see `DECISIONS.md` for the full list; don't treat them as real.

Structure:
- `css/tokens.css` — design tokens (custom properties): color, type scale, spacing scale, motion durations/easing.
- `css/base.css` — resets and base typography.
- `css/layout.css` — the two-zone layout primitives (`.zone-storytelling` / `.zone-errand`).
- `css/motion.css` — fleuron rotation, opening-ceremony hinge animation, and the mandatory `prefers-reduced-motion` crossfade override.
- `css/catalogue.css` — catalogue grid, filter chips, search input.
- `js/motion.js` — the shared opening-ceremony mechanism (see the `.opening`/`.opening-cover`/`.opening-panel` contract documented at the top of `css/motion.css`). Tracks per-card "already opened" state in `localStorage` (key pattern `storiel:opened:<id>`, wrapped in try/catch since Safari can throw if site data/cookies are blocked) so the ceremony compresses from ~700ms to ~200ms after the first open; also handles Enter/Space activation for keyboard users. Reused as-is by any future opening ceremony (Phase 3 product cover, Phase 4 preview cover) — don't fork it per component.
- `js/catalogue.js` — occasion-filter and search-substring logic for the catalogue grid.

## The governing document

`STORIEL_BRIEF.md` is the authoritative creative and technical brief for this project. **Read it in full before writing any code** — this file only summarizes the operating rules that most affect how you should behave as an assistant; the brief itself contains the full design system, voice rules, and rationale.

## Non-negotiable workflow: the checkpoint protocol

The site is built in the ordered phases listed below, **one phase at a time**. This overrides your normal instinct to keep going once tests pass:

1. **STOP** at the end of every phase. Do not begin the next phase.
2. Summarize in plain language what was built, what decisions were made, and anything interpreted or assumed.
3. Show the founder how to view/run the result.
4. Ask for feedback and **wait** — do not proceed speculatively.
5. Apply requested changes, confirm them, then ask "Ready to move to Phase N+1?"
6. Proceed only on explicit approval.

Other hard rules:
- If the brief conflicts with a technical constraint, pause and raise it — don't silently resolve it.
- If a phase needs content that doesn't exist yet (final copy, prices, fonts, images), pause and ask. **Never use lorem ipsum anywhere a user could see it.** A clearly labeled placeholder like `[PREVIEW CONTENT PENDING]` is acceptable mid-phase only, and must be flagged in the checkpoint summary.
- Update `DECISIONS.md` at the end of every phase with choices, assumptions, and open questions. Check the open-questions list in `STORIEL_BRIEF.md` §9 before assuming an answer to any of those.

## Build order (phases)

1. **Foundations** — design tokens (CSS custom properties), base styles, the two-physics layout primitives, fleuron placeholder, motion tokens, reduced-motion handling.
2. **Catalogue (errand zone)** — index page: title, occasion, duration, price, live preview thumbnail, filters, search.
3. **One product page** — spread layout, colophon, `Buy — [PRICE]` button, seal-color demo, link into preview. Needs one real product's facts/price from the founder first.
4. **One real preview** — cover-lift opening, sandboxed iframe, page-gate, resume/restart, compressed re-open, reduced-motion variant. Needs authored preview content from the founder first.
5. **Homepage** — assembled last from already-proven components.
6. **Commerce & personalization flow** — cart, checkout, post-purchase (uploads, letter-writing, proofing, approval, delivery). Deliberately the plainest, most conventional part of the site.

Full detail for each phase is in `STORIEL_BRIEF.md` §8.

## Architecture: the two-zone rule

The site has two zones with genuinely different physics — **never blend them**:

- **Storytelling zone** (homepage, product pages, previews): paginated spreads, hard settle, center spine, one object per view. Implement with CSS scroll-snap — not JS scroll hijacking.
- **Errand zone** (Catalogue, search, cart, checkout, personalization): normal scrolling, fast, conventional, zero ceremony. Reachable in one tap from anywhere, not a hidden escape hatch.

Opening ceremonies (cover lifts, seal breaks, page turns) play in full only on a visitor's first encounter with a piece; track "already opened" in `localStorage` and compress subsequent opens to ~200ms. No account/login required for this.

Previews are the real product build running in a sandboxed iframe, gated at a page threshold chosen per-product by the founder (never a hardcoded default) — one codebase serves both the preview and the purchased product, so they can never drift apart.

## Design system constraints

- One serif type family only, three sizes (body / small-colophon / modest heading). **No typeface has been chosen yet** — do not pick one unilaterally; this must be resolved with the founder before Phase 1 is considered done.
- Provisional colors only (paper `#FAF7F2`, ink `#26211C`, five seal colors) — mark them clearly as provisional in the tokens file since they'll be replaced by physically sampled hues.
- One shared easing curve, defined once as a token (`cubic-bezier(0.22, 1, 0.36, 1)` to start). No bounce, no parallax, no particles, no drop shadows as decoration, no gradients, no dark mode.
- `prefers-reduced-motion` must turn every opening into a simple crossfade — this is mandatory, verify it every phase, along with tab order and focus visibility.
- Nav is exactly four items: fleuron (→ home), Catalogue, Studio, Cart.
- URLs use plain words (`/wedding`, `/baby-shower`), even though the visible nav uses full sentences.

## Voice & copy rules

- Transactional UI uses ordinary words: Buy, Your order, Paid, Delivered. The buy button reads `Buy — [PRICE]`.
- Forbidden words anywhere in copy: bespoke, luxury, elevate, unforgettable, journey, magical, curated.
- Navigation sentences must be plain, verifiable statements with no adjectives — including hard cases ("Someone has died." — never softened).
- A preview simply ends when the cover closes; no closing sentence. At most: "Preview: pages 1–3 of 9."
- Every product needs a colophon: a small factual paragraph (capacity, duration, delivery, permanence, price).

When judging any copy or motion decision, apply the brief's two tests: **does this movement open something** (cut it if not), and **could this sentence sit on a receipt without embarrassment** (rewrite plainly if not).

## Open questions blocking full implementation

See `STORIEL_BRIEF.md` §9 for the complete list (typeface, real prices, hosting/permanence model, final seal colors, fleuron artwork, launch catalogue size, preview gate thresholds, Ada & June preview content, payment provider). Do not guess at these — ask the founder at the relevant checkpoint.
