# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This repository is currently **empty of code** — a greenfield project for the Storiel website. No package manager, build tool, framework, or test runner has been chosen yet. Do not assume a stack; the tech choices are made during Phase 1 (see below) and this file should be updated once they're decided.

There are no build, lint, or test commands to document yet. Once Phase 1 introduces tooling, add the actual commands here (do not invent placeholders).

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
