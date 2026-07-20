# AIAAF Rubric, The Six Dimensions (v0.1)

Part of the AI-Generated Interface Accessibility Assurance Framework (AIAAF),
applied by the AITL tool.

Each dimension is scored 0 to 5 (see SPECIFICATION.md §5) with element level
findings, each carrying an evidence-based rationale and a mapped WCAG success
criterion.

## D1, Perceivable

Text alternatives are meaningful, not merely present; contrast meets minimums
(4.5:1 normal text, 3:1 large text and UI components); structure and
relationships are programmatically conveyed; media has alternatives.

## D2, Operable

Full keyboard operability without traps; visible focus with logical order;
touch/click targets ≥ 24×24 CSS px; user control over motion, timing, and
auto-updating content.

## D3, Understandable

Persistent, programmatically associated labels; predictable behavior; errors
identified in text, programmatically associated to their field, with recovery
guidance; logical reading order.

## D4, Robust

Valid, semantic markup; correct name, role, and value on all interactive
elements; correct ARIA usage (no `aria-hidden` on focusable content);
compatibility with assistive-technology parsing.

## D5, Assistive-Technology Behavior

How the output actually performs under a screen reader and keyboard against
the defined task: are elements announced sensibly, is the task completable,
does the experience match the visual one? This is the contextual layer
conventional checkers cannot assess, verified by hands-on AT testing,
ultimately including testing with assistive-technology users.

## D6, Resistance to Generative Failure Patterns

The dimension specific to AI-generated design: the artifact is checked
against a named, versioned taxonomy of the defect classes generative systems
characteristically produce. See
[`../taxonomy/generative-failure-patterns.md`](../taxonomy/generative-failure-patterns.md).
