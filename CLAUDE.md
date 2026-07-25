# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

Phases 1–4 are built (Foundations, Catalogue, one product page, one real preview). The site is **plain static HTML/CSS/JS** — no package manager, build step, framework, or test runner. This was a deliberate choice for a small, ceremony-light site that deploys straight to GitHub Pages; keep using plain HTML/CSS/JS unless a later phase (e.g. checkout in Phase 6) genuinely requires more.

There is no build/lint/test command because there's no toolchain. To preview locally, serve the repo root with any static file server, e.g. `python3 -m http.server` and open `index.html`.

**Cache-busting is required on every CSS/JS edit.** GitHub Pages doesn't let us set cache-control headers, and browsers (Safari in particular) cache `.css`/`.js` aggressively enough that users can get fresh HTML paired with stale CSS/JS — the two silently drift out of sync with no error, just broken-looking behavior. Every `<link>`/`<script>` tag that points at a file under `css/` or `js/` carries a `?v=N` query string; bump `N` on *every* file you reference whenever its content changes, in every HTML file that links to it. Forgetting this is a real, already-hit bug, not a hypothetical.

`index.html` is currently the Phase 1 **living style page** (tokens, type, spacing, motion, both zone physics, the opening-ceremony demo) — it is explicitly not the final homepage. Phase 5 replaces it with the real homepage; until then, treat `index.html` as a foundations reference, not production UI. It also carries founder-facing review tools that are not part of the site itself: a **seal-pair audit** (renders each seal's tint/text pair with contrast ratios computed live from the token values — never hardcode a copy of the palette in that script) and a **typeface comparison** (toggles candidates by overriding `--font-serif` on `:root`, which cascades to the whole page since it's one shared token; it never touches `css/tokens.css`).

**Seal colors are tint/text pairs.** Working palette is C "Faded Celebration" (provisional until physical sampling). `--seal-N` is a display tint — backgrounds, thumbnails, blocks only; every tint fails WCAG contrast for text on paper. `--seal-N-text` is the same OKLCH hue darkened to pass 4.5:1 against paper and is the only seal form allowed on text. Tint backgrounds carry ink text (paper text fails on them). If a tint ever changes, re-derive its `-text` partner (OKLCH, hue/chroma held, highest lightness that passes 4.5:1) — never let the pair drift. If real fonts need visual verification, note that this environment's headless test browser has been observed to render distinct downloaded webfonts pixel-identically (a sandbox font-rasterization limitation, confirmed against working system-font rendering) even when `document.fonts.check()` and computed styles are correct — trust a real browser for the final visual call, not a headless screenshot here.

`catalogue/index.html` (Phase 2) is the Catalogue index, served at `/catalogue/`. Errand zone: normal scrolling, no scroll-snap, no opening ceremony. Products whose names are bracketed (e.g. `[Save the Date]`) are placeholders — don't treat them as real.

`anniversary/index.html` (Phase 3) is the one built product page, served at `/anniversary/` — storytelling zone, five spreads, colophon, `Buy — €140`, and the preview entry point. **Its colophon facts were written by the assistant, not the founder** (the founder delegated), so capacity, delivery time, the ten-year permanence commitment, the price, and the preview gate are all unconfirmed proposals — see `DECISIONS.md` before treating any of them as settled or reusing them for another product. Its preview cover reuses the shared `.opening` mechanism.

`anniversary/piece/` (Phase 4) **is** the Anniversary Scroll — the actual product build, nine pages. It serves both the preview and (eventually) the purchased piece from one codebase, which §7 requires so the two can never drift: `?gate=N` renders the first N pages plus the gate card, and with no parameter it renders all nine with no gate card. Its story text and `[PHOTOGRAPH]` blocks are **assistant-written sample content**, not founder-authored (§9.8 is still open) — replace them wholesale; nothing in the mechanism depends on them.

**The preview iframe is sandboxed without `allow-same-origin`**, so the piece runs on an opaque origin. Two consequences that will bite if forgotten: `localStorage` is unavailable *inside* the piece, so the parent (`js/preview.js`) owns all progress state and passes `?start=N` back in on return; and `event.origin` is the string `"null"` for its messages, so postMessage senders are identified by `event.source === frame.contentWindow`, never by origin. The iframe's `src` stays empty until the cover is opened, so unopened previews cost nothing.

Structure:
- `css/tokens.css` — design tokens (custom properties): color, type scale, spacing scale, motion durations/easing.
- `css/base.css` — resets and base typography.
- `css/layout.css` — the two-zone layout primitives (`.zone-storytelling` / `.zone-errand`).
- `css/motion.css` — fleuron rotation, opening-ceremony hinge animation, and the mandatory `prefers-reduced-motion` crossfade override.
- `css/catalogue.css` — catalogue grid, filter chips, search input.
- `css/product.css` — product-page nav, spread content, cover block, seal-marked personalizable list, buy button.
- `js/motion.js` — the shared opening-ceremony mechanism (see the `.opening`/`.opening-cover`/`.opening-panel` contract documented at the top of `css/motion.css`). Tracks per-card "already opened" state in `localStorage` (key pattern `storiel:opened:<id>`, wrapped in try/catch since Safari can throw if site data/cookies are blocked) so the ceremony compresses from ~700ms to ~200ms after the first open; also handles Enter/Space activation for keyboard users. Reused as-is by any future opening ceremony (Phase 3 product cover, Phase 4 preview cover) — don't fork it per component.
- `js/catalogue.js` — occasion-filter and search-substring logic for the catalogue grid.
- `css/piece.css` / `js/piece.js` — the piece itself: page layout, `?gate=N` gating, `?start=N` resume, and progress reporting up to the parent by postMessage.
- `js/preview.js` — parent-side preview controller: lazy iframe load, progress persistence, resume/restart. Watches `.is-open` via MutationObserver rather than binding its own trigger handler, so `js/motion.js` stays the only owner of open/close.

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
