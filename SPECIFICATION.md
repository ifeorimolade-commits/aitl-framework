# Accessibility in the Loop (AITL) Framework
## Specification, Version 0.1 (Working Draft)

**Author:** Ifeoluwa Orimolade · **Date:** July 2026

---

## 1. Purpose

AITL is an evaluation tool for the accessibility of AI-generated user
interfaces. It applies the AI-Generated Interface Accessibility Assurance Framework (AIAAF):
the evaluation framework comprising the six dimension rubric (§4), the
generative failure pattern taxonomy (P1 to P8), the 0 to 5 scoring scale with its
severity driven release gate (§5), and the element level evidence rules. AIAAF
defines what "accessible" means for AI-generated design and how to score
output against that definition; AITL is the tool that applies AIAAF (process in section 6),
manually by evaluators, or automatically in the generation loop, and converts
the results into guidance that design teams and tool-makers can act on before
release. AITL keeps expert and
assistive-technology-user judgment central; it does not treat AI as an
automatic fix.

## 2. Scope and Non-Goals

- **In scope:** user interfaces produced or substantially shaped by AI systems
, generated screens, components, markup, and design specifications,
  evaluated against WCAG 2.2 (A/AA), Section 508, and documented
  assistive-technology behavior.
- **Out of scope (v0.1):** non-UI content generation (long-form text, media),
  native platform apps beyond web-rendered UI, and automated remediation. AITL
  evaluates and guides; it does not claim to auto-fix.
- AITL **complements**, it does not replace, automated checkers (axe, WAVE,
  Lighthouse) and formal conformance audits. Its distinct contribution is the
  layer those tools do not cover: contextual judgment and the failure patterns
  specific to generative systems.

## 3. Inputs

1. **The artifact**, in whatever form is available: rendered interface,
   underlying markup or component structure, design specification, or the
   generative prompt that produced it. More forms yield a deeper evaluation;
   any one form is sufficient to begin.
2. **The context of use:** the user task under evaluation; assistive
   technologies in scope (screen reader, keyboard only, magnification, switch
   access); and the conformance target (e.g., WCAG 2.2 AA).

## 4. The AIAAF Rubric, Six Dimensions

Every evaluation scores the artifact on six dimensions: the four WCAG
principles, extended with the two layers automated tools miss most. Each
finding is recorded at the element level with an evidence-based rationale and
a mapped success criterion. See [`rubric/dimensions.md`](rubric/dimensions.md)
for the full dimension definitions and
[`taxonomy/generative-failure-patterns.md`](taxonomy/generative-failure-patterns.md)
for the D6 taxonomy.

- **D1, Perceivable**
- **D2, Operable**
- **D3, Understandable**
- **D4, Robust**
- **D5, Assistive-Technology Behavior**
- **D6, Resistance to Generative Failure Patterns**

## 5. Scoring

Each dimension is scored 0 to 5 with element level findings recorded beneath it.
Findings carry a severity that drives the release gate.

| Score | Label | Meaning |
|---|---|---|
| 5 | Conformant | No defects found on this dimension for the evaluated task; meets the conformance target. |
| 4 | Minor issues | Defects exist but do not impede task completion with assistive technology; low-severity fixes. |
| 3 | Degraded | Task completable with assistive technology but with significant friction or workarounds. |
| 2 | Barrier | At least one defect prevents some users from completing the task on this dimension. |
| 1 | Blocking | Multiple defects; the task is effectively unavailable to assistive-technology users. |
| 0 | Not evaluable | Artifact insufficient to assess this dimension; noted, not averaged. |

| Severity | Definition | Gate effect |
|---|---|---|
| Critical | Prevents task completion for screen reader or keyboard only users. | Fails the release gate. |
| High | Major friction or exclusion for a user group; task completable with difficulty. | Fails gate unless documented exception. |
| Medium | Conformance failure with available workaround. | Must be scheduled for remediation. |
| Low | Best-practice deviation; no conformance failure. | Advisory. |

## 6. Process

1. **Frame:** define the task, AT in scope, and conformance target.
2. **Sweep:** run automated checks to clear the mechanically detectable layer.
3. **Evaluate:** score D1 to D6 element by element, with keyboard and
   screen reader passes for D5 and the taxonomy for D6; every finding gets a
   rationale grounded in specific evidence and a mapped criterion.
4. **Route:** separate what is decidable from what requires human or AT-user
   judgment, and route the latter explicitly.
5. **Return signals:** produce the score profile, prioritized findings,
   upstream prompt/specification guidance, and the gate determination.

## 7. Outputs

- A six dimension score profile with a conformance determination against the
  stated target.
- A prioritized, element level findings list (criterion, severity, rationale,
  fix).
- Upstream guidance: prompt- and specification-level requirements that steer
  future generation away from the defects found.
- A release-gate result (Critical findings block).
- A documented trace suitable for conformance evidence and research use.

## 8. Validation Roadmap

- **Phase 1 (current):** apply the rubric to synthetic and publicly available
  AI-generated interfaces; refine dimension definitions and the D6 taxonomy.
  A completed worked example accompanies this specification.
- **Phase 2:** inter-rater exercises with accessibility practitioners to test
  that the rubric scores consistently across evaluators.
- **Phase 3:** validation sessions with assistive-technology users to test
  that rubric findings predict real task success and failure.
- **Phase 4:** dissemination through peer reviewed human-computer-interaction
  venues and professional channels; publication of the taxonomy for field
  adoption.
- **Phase 5 (vision): integration by AI tool makers.** The long term aim, once
  the framework is validated, is adoption by the companies that build AI design
  and code generation tools, such as Anthropic, OpenAI, and others, so that
  AIAAF is integrated directly into how their tools produce interfaces. Through
  the MCP server and a published, machine readable version of the taxonomy, a
  generation tool could consult the framework as it works and steer its output
  away from the known failure patterns. This work builds on an active area of
  research and practice in accessibility and AI rather than starting from
  nothing. The practical goal is that AI generated
  UI arrives substantially more accessible by default, so that designers and
  developers spend far less effort retrofitting accessibility after the fact.
  Human and assistive technology user review remains part of the process for
  the contextual judgments automation cannot make; the aim is to shrink that
  burden, not remove it. This work builds on active research and practice across the field rather than starting from nothing; the contribution here is the framework's focus on AI generated user interfaces and its named taxonomy of the failure patterns those tools characteristically produce. No such collaboration exists yet; this describes the
  direction the endeavor is built to enable.


## 9. Relationship to Existing Work

AITL builds on established standards (WCAG 2.2, Section 508, WAI-ARIA) and on
the general "human-in-the-loop" evaluation tradition. Its specific
contribution is narrower and deeper: an element level evaluation rubric
purpose-built for AI-generated user interfaces, and a named, growing taxonomy
of generative accessibility failure patterns, the layer that neither
automated checkers nor generic conformance audits currently address.

## 10. Version History

- **v0.1 (July 2026)**, initial specification: six dimension rubric, 0 to 5
  scale, severity gate, eight-pattern D6 taxonomy, five-step process,
  validation roadmap. Companion artifact: AITL Worked Example (sign-up screen
  evaluation).
