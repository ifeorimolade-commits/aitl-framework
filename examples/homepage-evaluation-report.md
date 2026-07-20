# AITL Evaluation Report, Sample Fitness App Homepage

- **Artifact:** "Pulse" fitness app homepage (synthetic AI-design-tool output)
- **Generation source:** simulated AI design tool; prompt: "Generate a modern homepage for a fitness app called Pulse"
- **Task:** a new visitor understands what the app offers, opens the navigation menu, and subscribes to the newsletter
- **AT in scope:** screen reader, keyboard only
- **Conformance target:** WCAG 2.2 AA
- **Evaluator:** *(draft evaluation, to be verified and signed by the evaluator)*
- **Tool:** AITL v0.1 (applying the AIAAF framework)
- **Companion files:** [`sample-homepage/index.html`](sample-homepage/index.html) (artifact) · [`homepage-evaluation.json`](homepage-evaluation.json) (importable into the AITL Evaluator)

## Score profile

| Dimension | Score | Basis |
|---|---|---|
| D1 Perceivable | 2/5 | Contrast failures on body text; structure not conveyed; generic alt |
| D2 Operable | 2/5 | Keyboard-inoperable menu control; focus invisible; sub-minimum targets |
| D3 Understandable | 2/5 | Newsletter field unlabeled; content otherwise simple and clear |
| D4 Robust | 1/5 | Non-semantic control; aria-hidden over focusable links; no headings or nav landmark |
| D5 AT behavior | 2/5 | Screen reader/keyboard users cannot complete two of the three task steps |
| D6 Generative-pattern resistance | 1/5 | Exhibits all eight taxonomy patterns (P1 to P8) |

## Release gate: **FAIL** (2 Critical)

## Findings (10)

1. **[Critical] Hamburger menu control, D2 · WCAG 2.1.1, 4.1.2 · P2 divAsButton.**
   The mobile menu toggle is a `<div>` with `onclick`, no role, no tabindex, no keyboard activation. A keyboard only user cannot open the navigation at mobile widths; a screen reader announces nothing actionable.
   *Fix:* native `<button aria-expanded>` controlling the menu, with a visible name or `aria-label="Menu"`.

2. **[Critical] Newsletter email field, D3 · WCAG 1.3.1, 3.3.2 · P1 placeholder only labeling.**
   The email input's only identification is `placeholder="Enter your email"`. The placeholder vanishes on input and is not a programmatic label, leaving the field unnamed for screen reader users, blocking the subscribe step of the task.
   *Fix:* a persistent associated `<label>` (visually styled as needed) or `aria-label="Email address"`.

3. **[High] All interactive elements, D2 · WCAG 2.4.7 · P6 suppressed focus.**
   Global `*:focus{outline:none}` removes the focus indicator sitewide with no replacement. Keyboard users cannot see where they are.
   *Fix:* remove the reset; provide a visible `:focus-visible` style.

4. **[High] Footer social links, D4 · WCAG 4.1.2 · P8 decorative ARIA misuse.**
   The social-link container has `aria-hidden="true"` while its three links remain focusable. Keyboard focus lands on elements that announce nothing, a focus trap of silence.
   *Fix:* remove `aria-hidden` from the container; give each link an accessible name (e.g., `aria-label="Pulse on Instagram"`); hide only the decorative SVGs.

5. **[High] Hero subtext and card body text, D1 · WCAG 1.4.3 · P7 low-contrast default aesthetics.**
   Body copy uses `#9CA3AF` on white, roughly 2.5:1 against the 4.5:1 minimum. The product description, central to the "understand the offer" step, is unreadable for many low-vision users.
   *Fix:* darken to ≥ 4.5:1 (e.g., `#4B5563` or darker).

6. **[High] Page structure, D1 · WCAG 1.3.1, 2.4.6 · P4 visual only structure.**
   The page contains no heading elements at all: the hero title, card titles, and newsletter title are styled `<div>`s, and there is no `<h1>`. A screen reader user's heading navigation returns an empty list.
   *Fix:* `<h1>` for the hero title; `<h2>`/`<h3>` for section and card titles in logical order.

7. **[Medium] Navigation container, D4 · WCAG 1.3.1.**
   The primary navigation is a generic `<div>`; there is no `<nav>` landmark (and no `<main>`), so landmark navigation is unavailable.
   *Fix:* semantic `<nav>` and `<main>` regions.

8. **[Medium] Hero image, D1 · WCAG 1.1.1 · P3 generic/hallucinated alt text.**
   `alt="image"` conveys nothing. If decorative, it adds noise; if informative, it fails its purpose.
   *Fix:* `alt=""` if decorative; a purposeful description if informative.

9. **[Medium] Current-page indicator, D1 · WCAG 1.4.1 · P5 color only state.**
   The active nav item is distinguished by color alone (`#7C3AED` vs. gray).
   *Fix:* add a non-color cue (underline/weight) and `aria-current="page"`.

10. **[Medium] Social link targets, D2 · WCAG 2.5.8.**
    18×18 px targets fall below the 24×24 minimum.
    *Fix:* enlarge the interactive area to ≥ 24×24 (44×44 recommended).

## What the generator got right

A fair evaluation records passes as well: the primary CTA and Subscribe controls are native `<button>` elements (keyboard-operable, correctly announced); the document declares `lang="en"`; the DOM order matches the visual order; and the CTA's white-on-violet meets contrast minimums. Generative output is not uniformly broken, which is precisely why element level evaluation, rather than blanket judgment, is the method.

## Signals returned

- **Upstream prompt/specification guidance:** require a programmatic label for every input; native buttons for all controls; ≥ 4.5:1 body-text contrast; visible focus styles; real heading hierarchy with an `<h1>`; `<nav>`/`<main>` landmarks; accessible names on icon links; no `aria-hidden` over focusable content; non-color state cues; ≥ 24 px targets.
- **Release gate:** findings 1 to 2 each independently block a task step for AT users → **fails the gate** until resolved.
- **Routed to human/AT-user review:** whether the hero image is genuinely decorative; whether reading order and announcement of the card sequence make sense under a screen reader; label comprehension in context.

## Determination

Does not meet WCAG 2.2 AA; not ship-ready. All ten findings map to closeable gaps; the two Critical items are one-line semantic fixes, which is characteristic of generative output, where the visual layer is near-complete while the semantic layer is absent.

---

*Generated with AITL v0.1. This report supports, and does not
replace, expert and assistive-technology-user judgment. This is a draft
evaluation of a synthetic artifact; the evaluator should verify each finding
hands-on (keyboard pass, screen reader pass, contrast checks) before signing.*
