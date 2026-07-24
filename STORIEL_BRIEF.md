# STORIEL — Creative Brief & Build Instructions

This file is the governing document for building the Storiel website.
Read it fully before writing any code. When a decision is not covered here,
ask the founder — do not invent brand-level decisions.

---

## 0. HOW TO WORK (checkpoint protocol — non-negotiable)

The site is built in phases (see §8). You must work **one phase at a time**.

At the end of every phase:

1. **STOP.** Do not begin the next phase.
2. Summarize in plain language what you built, what decisions you made,
   and anything you had to interpret or assume.
3. Show the founder how to view/run the result.
4. Ask for feedback and **wait**.
5. Apply requested changes, confirm them, and only then ask:
   "Ready to move to Phase N+1?"
6. Proceed only on explicit approval.

Additional working rules:

- If anything in this brief conflicts with a technical constraint, pause and
  raise it — do not silently resolve it.
- If a phase requires content that does not exist yet (e.g. Ada & June
  preview content, final prices, final fonts), pause and ask rather than
  filling with placeholder sentiment. **Lorem ipsum is forbidden anywhere
  a user could see it.** Clearly-labeled structural placeholders
  (e.g. "[PREVIEW CONTENT PENDING]") are acceptable only mid-phase and must
  be flagged in the checkpoint summary.
- Keep a running `DECISIONS.md` log: every choice made, every assumption,
  every open question. Update it each phase.

---

## 1. THE CONCEPT (one paragraph)

Storiel ("a little story") is a maker of **small worlds**. It sells
interactive HTML keepsakes and invitations for meaningful moments —
weddings, birthdays, anniversaries, memorials, and more. The brand's single
governing verb is **opening**: everything meaningful on the site is closed
until the user opens it — covers lift, seals break, pages turn. Smallness
is the point of view: the locket, the music box, the pop-up book. Quiet,
precise, secretly wondrous. Never syrupy.

## 2. THE TWO TESTS (apply to every element)

1. **Motion test:** Does this movement open something? If it moves without
   opening, cut it.
2. **Receipt test:** Could this sentence appear on a receipt without
   embarrassment? If a line is too perfumed to sit next to a price, rewrite
   it plainly.

## 3. THE TWO-ZONE ARCHITECTURE

The site has two zones with **two different physics**. Never mix them.

- **Storytelling zone** (homepage, product pages, previews): paginated
  spreads, hard settle, center spine, one object per view. Use CSS
  scroll-snap, not JS scroll hijacking.
- **Errand zone** (Catalogue index, search, cart, checkout, personalization
  flow): normal scrolling, fast loading, conventional patterns, zero
  ceremony. This zone is a first-class path, reachable in one tap from
  anywhere — not an escape hatch.

**The user's second visit outranks the founder's first impression.**
Every opening ceremony plays in full on first encounter only; afterwards it
compresses to a fast settle (~200ms). Track "already opened" state in
localStorage. No account required for this.

## 4. VOICE & COPY RULES

- Transactional layer uses ordinary words: **Buy**, Your order, Paid,
  Delivered. The buy button shows the price on it: `Buy — [PRICE]`.
- Forbidden words: bespoke, luxury, elevate, unforgettable, journey,
  magical, curated.
- Navigation sentences ("Someone is getting married.") must be verifiable
  plain statements. No adjectives. Hard cases stay flat: "Someone has
  died." — never softened.
- Preview end: the cover simply closes. No closing sentence. If orientation
  is needed, the maximum is: "Preview: pages 1–3 of 9."
- Every product carries a **colophon**: a small factual paragraph (capacity,
  duration, delivery, permanence, price) in the same serif, smaller size.

## 5. VISUAL SYSTEM (design tokens — provisional where marked)

Create these as a single tokens file (CSS custom properties). Mark
provisional values with a comment so they can be swapped without hunting.

- **Paper:** warm paper-white, not cream. Provisional: `#FAF7F2`
- **Story ink:** deep warm near-black. Provisional: `#26211C`
- **Seal colors** (one per product; marks everything personalizable).
  ALL PROVISIONAL — will be replaced by physically sampled hues:
  - seal-1: `#5B6EA5`
  - seal-2: `#C4572E`
  - seal-3: `#5C6B4F`
  - seal-4: `#6E4A6B`
  - seal-5: `#C79A3B`
- **Typography:** ONE serif family, three sizes only (body, small/colophon,
  modest heading). Real italics required. FONT NOT YET CHOSEN — pause and
  ask before Phase 1 is considered complete. Candidates to audition:
  Source Serif 4, Fraunces (low optical sizes), Newsreader.
- **Spacing:** generous; margins that feel like held breath. Define a small
  scale (e.g. 8 / 16 / 32 / 64 / 128) and stick to it.
- **The fleuron:** the brand mark; appears wherever something can be
  opened; rotates a quarter-turn on openable hover/focus; serves as the
  loading state. If final artwork doesn't exist at build time, use a simple
  placeholder glyph and flag it at checkpoint.
- No drop shadows as decoration, no gradients, no dark mode.

## 6. MOTION SPEC

- One shared easing curve for everything (define once as a token;
  start with `cubic-bezier(0.22, 1, 0.36, 1)` and tune with founder).
- Opening ceremony: 600–800ms first time; 200ms compressed on repeat.
- Physics vocabulary: hinge and paper — lift, turn, settle. Slight weight.
  No bounce, no parallax, no particles.
- `prefers-reduced-motion`: every opening becomes a simple crossfade.
  This is mandatory, not optional.
- Keyboard and screen-reader users must never be trapped by pagination.
  Test tab order and focus visibility in every phase.

## 7. STRUCTURE & SEO

- Nav: fleuron (→ home), Catalogue, Studio, Cart. Four items. Nothing else.
- Plain-word URLs: `/wedding`, `/baby-shower`, `/anniversary`, etc.
  Sentence-nav is the visible layer; ordinary category names live in URLs,
  filters, search, and metadata.
- Search accepts plain words ("baby shower") and lands correctly.
- Real titles/descriptions per page; the poetic layer must not be
  SEO-invisible.
- Previews: the actual product build running in a **sandboxed iframe** with
  a page-gate at an editorially chosen threshold (per product, chosen by
  the founder — never a default percentage). One codebase; previews can
  never drift from the real product.
- Performance budget: the storytelling zone must still feel fast. If a
  poetic element costs seconds of load, the poetry is a tax — raise it at
  checkpoint.

## 8. BUILD ORDER (one phase = one checkpoint)

**Phase 1 — Foundations.** Design tokens file, base styles, the two-physics
rule implemented as layout primitives, fleuron placeholder, motion tokens,
reduced-motion handling. Deliverable: a living style page showing tokens,
type sizes, both scroll physics, and the opening animation on a demo card.
→ STOP. Checkpoint.

**Phase 2 — Catalogue (errand zone).** The index: title, occasion,
duration, price, postage-stamp live preview thumbnail, plain filters,
search. Conventional, fast, scannable. → STOP. Checkpoint.

**Phase 3 — One product page.** Spread layout, colophon, `Buy — [PRICE]`
button, seal-color rule demonstrated, link into preview. Use ONE real
product; ask founder which, and for its real colophon facts and price
before building. → STOP. Checkpoint.

**Phase 4 — One real preview.** Cover-lift opening, sandboxed iframe,
page-gate, "Preview: pages X–Y of Z" marker, resume/restart on return,
compressed re-open, reduced-motion variant. Requires authored Ada & June
content from the founder — pause and request it at phase start if missing.
→ STOP. Checkpoint.

**Phase 5 — Homepage.** Built last, assembled from proven components:
opening statement, the self-opening product demonstration (plays once;
respects reduced motion), Table of Contents sentences, path to Catalogue.
→ STOP. Checkpoint.

**Phase 6 — Commerce & personalization flow.** Cart, checkout, and the
post-purchase flow: uploads, letter-writing, proofing, approval, delivery.
This is deliberately the **plainest room in the house**: conventional
patterns, visible progress steps, editable proof before sending. Receipt-
test voice throughout. → STOP. Checkpoint.

## 9. OPEN QUESTIONS (founder must answer; do not assume)

1. Final typeface choice.
2. Real prices and currency; per-piece variation.
3. What "yours permanently" means concretely (hosting duration, offline
   download option — recommended).
4. Final seal colors (physical sampling process — provisional hexes until
   then).
5. Fleuron artwork.
6. Launch catalogue size (design the index honestly for the real number).
7. Preview gate thresholds per product.
8. Ada & June content: names, images, letters, narrative arcs per preview.
9. Payment provider / checkout stack.

---

*Governing reminder: the structure does the feeling; the words do the
facts. When in doubt, ask the founder. When not in doubt, ask anyway at
the checkpoint.*
