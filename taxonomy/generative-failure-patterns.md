# Generative Accessibility Failure Patterns, Taxonomy v0.1

Part of the AI-Generated Interface Accessibility Assurance Framework (AIAAF).
The defect classes that AI systems characteristically produce when generating
user interfaces. Each entry records the pattern, why generative systems
produce it, its detection cue, and its remediation. The taxonomy is versioned
and intended to grow through application; contributions and counter-examples
are welcome via issues.

---

## P1, Placeholder only labeling

- **Pattern:** form fields convey their purpose only through `placeholder`
  text; no persistent, programmatically associated label exists.
- **Why generators produce it:** the rendered design *looks* labeled, so the
  visual objective is satisfied without the semantic one.
- **Detection cue:** inputs with `placeholder` but no `<label>`,
  `aria-label`, or `aria-labelledby`.
- **Remediation:** persistent programmatic label per field; placeholder only
  as a supplementary example.
- **Maps to:** WCAG 1.3.1, 3.3.2.

## P2, divAsButton

- **Pattern:** non-semantic containers (`<div>`, `<span>`) with click
  handlers standing in for real controls.
- **Why:** click handlers on styled containers render identically to native
  buttons; semantics carry no visual reward.
- **Detection cue:** `onclick` on elements with no role, no tabindex, no
  native interactivity.
- **Remediation:** native `<button>` / `<a>`; native semantics restore
  keyboard operability, role, and focusability.
- **Maps to:** WCAG 2.1.1, 4.1.2.

## P3, Generic or hallucinated alternative text

- **Pattern:** `alt` values produced because the attribute exists ("image",
  "illustration"), or confidently describing content the image does not
  contain.
- **Why:** the model fills the slot without analyzing the image's purpose in
  context.
- **Detection cue:** generic nouns in `alt`; informative images with
  boilerplate text; decorative images with non-empty `alt`.
- **Remediation:** empty `alt=""` for decorative images; purpose-driven
  descriptions for informative ones.
- **Maps to:** WCAG 1.1.1.

## P4, Visual only structure

- **Pattern:** hierarchy implied by styling but absent from markup, styled
  paragraphs instead of headings, spacing instead of lists or landmarks.
- **Why:** the visual outcome is achievable entirely in CSS; structural
  semantics are invisible in a screenshot.
- **Detection cue:** large/bold text that is not a heading element; no
  heading outline; missing landmarks.
- **Remediation:** real headings in logical order; semantic lists and
  landmarks.
- **Maps to:** WCAG 1.3.1, 2.4.6.

## P5, Color only state

- **Pattern:** errors, selection, or status conveyed by color alone (e.g., a
  red border) with no text equivalent.
- **Why:** the visual styling is generated without the accompanying text
  semantics.
- **Detection cue:** state changes that alter only color/border; no
  associated message or `aria-describedby`.
- **Remediation:** pair every color cue with text, programmatically
  associated to the affected element.
- **Maps to:** WCAG 1.4.1, 3.3.1.

## P6, Suppressed focus

- **Pattern:** `outline: none` (or equivalent) removes the visible focus
  indicator with no replacement.
- **Why:** focus rings are treated as visual noise by "clean" default
  aesthetics.
- **Detection cue:** global outline resets; no `:focus-visible` styles.
- **Remediation:** visible focus style on all interactive elements.
- **Maps to:** WCAG 2.4.7.

## P7, Low-contrast default aesthetics

- **Pattern:** light-gray secondary text (hints, placeholders, captions)
  below contrast minimums.
- **Why:** low-contrast gray is a pervasive default in generated styling and
  utility-class output; it "looks clean."
- **Detection cue:** text colors in the `#9CA3AF`-and-lighter band on white;
  contrast < 4.5:1 for normal text.
- **Remediation:** meet 4.5:1 (normal) / 3:1 (large text, UI components).
- **Maps to:** WCAG 1.4.3, 1.4.11.

## P8, Decorative ARIA misuse

- **Pattern:** ARIA applied in ways that hide or misrepresent interactive
  content, e.g., `aria-hidden="true"` on containers with focusable
  descendants, or decorative roles on functional elements.
- **Why:** ARIA attributes are generated as boilerplate without modeling
  their effect on the accessibility tree.
- **Detection cue:** `aria-hidden` ancestors of focusable elements;
  role/behavior mismatches.
- **Remediation:** remove or scope the ARIA correctly; ensure name, role,
  value reflect actual behavior.
- **Maps to:** WCAG 4.1.2, 1.3.1.

---

*v0.1, July 2026. Initial eight patterns, drawn from recurring defects
observed in AI-generated interface output and demonstrated in the companion
worked example.*
