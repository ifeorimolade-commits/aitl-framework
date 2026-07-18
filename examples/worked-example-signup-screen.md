# AITL Worked Example — AI-Generated Sign-Up Screen

Application of the AITL rubric (v0.1) to a **synthetic** AI-generated
interface created solely for demonstration; it contains no proprietary or
client material.

## The artifact under evaluation

A "Create your account" screen of the kind commonly produced by AI design
tools:

```html
<div class="card">
  <p class="title">Create your account</p>

  <input type="text"     placeholder="Full name" />
  <input type="email"    placeholder="Email" />
  <input type="password" placeholder="Password" />
  <span class="hint">Use 8+ characters</span>      <!-- color: #9CA3AF -->

  <div class="icon-btn" onclick="toggle()">        <!-- eye icon, no name -->
    <svg>...</svg>
  </div>

  <div class="btn-primary" onclick="submit()">Continue</div>
  <img src="hero.png" alt="illustration" />
</div>
```

```css
input:focus { outline: none; }              /* focus suppressed */
.field-error { border: 1px solid #ef4444; } /* color signals error */
```

## Evaluation context

- **Task:** a new user completes the form and submits to create an account.
- **AT in scope:** screen reader (NVDA/VoiceOver) and keyboard-only.
- **Conformance target:** WCAG 2.2 AA / Section 508.

## Findings summary

| # | Finding | Dimension | WCAG | Severity | Taxonomy |
|---|---|---|---|---|---|
| 1 | Placeholder text as only label | D1/D3 | 1.3.1, 3.3.2 | **Critical** | P1 |
| 2 | Hint/placeholder text ≈2.5:1 contrast | D1 | 1.4.3 | **Critical** | P7 |
| 3 | Icon-only toggle has no accessible name | D4 | 4.1.2, 1.1.1 | **Critical** | — |
| 4 | Primary action is a `<div>` with a click handler | D2/D4 | 2.1.1, 4.1.2 | **Critical** | P2 |
| 5 | Errors signaled by red border only | D3/D1 | 3.3.1, 1.4.1 | High | P5 |
| 6 | Focus indicator suppressed, no replacement | D2 | 2.4.7 | High | P6 |
| 7 | Generic alt text on decorative illustration | D1 | 1.1.1 | Medium | P3 |
| 8 | Title styled visually, not a heading | D1/D4 | 1.3.1, 2.4.6 | Medium | P4 |
| 9 | Toggle target ≈16px, below 24px minimum | D2 | 2.5.8 | Medium | — |

## Selected findings in detail

**1. Placeholder-only labeling (Critical · P1).** The three inputs convey
purpose only through `placeholder`. Placeholders are not programmatic labels:
they disappear on input and are not reliably announced, leaving the field
unlabeled for a screen-reader user once typing begins. *Fix:* persistent
associated `<label>` per field. *Generative pattern:* the rendered design
"looks" labeled, so the visual objective is met without the semantic one.

**4. divAsButton (Critical · P2).** "Continue" is a `<div>` with a click
handler — not in the tab order, not keyboard-activatable, no button role. A
keyboard-only user is entirely blocked from submitting. *Fix:* native
`<button type="submit">`.

**7. Hallucinated alt text (Medium · P3).** The decorative hero image carries
`alt="illustration"` — no information, added screen-reader noise. *Fix:*
`alt=""` for decorative images. *Generative pattern:* the model fills the
attribute because it exists, not from the image's purpose.

(Full element-level rationales for all nine findings follow the same
structure: evidence, mapped criterion, fix, and — where applicable — the
generative pattern explaining why AI tools characteristically produce the
defect.)

## Signals returned

- **Prompt/specification guidance:** require persistent programmatic labels;
  native `<button>` for actions; ≥4.5:1 text contrast; visible focus; error
  text paired with color; real headings; accessible names on icon controls;
  empty alt on decorative images; ≥24px targets.
- **Release gate:** findings 1–4 are Critical — each independently blocks a
  screen-reader or keyboard user from completing the task — so the artifact
  **fails the gate** until resolved.
- **Routed to human/AT-user review:** whether labels and error messages are
  genuinely understandable in context; whether focus and reading order are
  logical; whether the illustration is truly decorative.

## Score profile

| Dimension | Score | Basis |
|---|---|---|
| D1 Perceivable | 2/5 | Contrast and non-text failures; labels not conveyed |
| D2 Operable | 2/5 | Keyboard-inoperable primary action; focus invisible; small target |
| D3 Understandable | 2/5 | Labels absent; errors not identified in text |
| D4 Robust | 1/5 | Non-semantic controls; name/role/value unavailable to AT |
| D5 AT behavior | 2/5 | SR/keyboard users cannot reliably complete the task |
| D6 Generative-pattern resistance | 1/5 | Exhibits the characteristic cluster (P1, P2, P3, P4, P5, P6, P7) |

**Determination:** does not meet WCAG 2.2 AA; not ship-ready. With the
remediations applied, each finding maps to a closeable conformance gap.
