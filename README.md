# Accessibility-in-the-Loop (AITL) 

**An evaluation methodology for the accessibility of AI-generated user interfaces, applying the AI-Generated Interface Accessibility Assurance Framework (AIAAF).**

Version 0.1 (Working Draft) · July 2026 · Author: Ifeoluwa Orimolade

---

## What is AITL?

AI systems now generate user interfaces at scale, but accessibility is not a
measured property of that output. Generative tools optimize for visual
plausibility; whether a screen-reader user can actually operate the result is
neither measured nor improved as the interface is produced. Automated checkers
close only part of the gap, many requirements demand contextual judgment, and
those tools were built for static, hand-authored pages rather than dynamic,
AI-generated output.

AITL is a structured evaluation methodology that addresses this layer. It applies the AI-Generated Interface Accessibility Assurance Framework (AIAAF) — the evaluation framework comprising the six-dimension rubric, the
generative failure-pattern taxonomy (P1–P8), the 0–5 scoring scale, and the
severity-driven release gate. Concretely, AITL:

1. **Defines** an assistive-technology-grounded rubric for what "accessible"
   means in AI-generated interfaces (six dimensions: the four WCAG principles,
   extended with assistive-technology behavior and generative failure patterns);
2. **Scores** AI output against that rubric at the level of individual
   elements, with evidence-based rationales mapped to WCAG success criteria;
3. **Returns** the results as actionable signals,prompt/specification
   guidance, release gates, and routed human review, that design teams and
   tool-makers can apply before release.

AITL keeps expert and assistive-technology-user judgment central. It does not
treat AI as an automatic fix, and it complements (rather than replaces)
automated checkers and formal conformance audits.

## Repository contents

| Path | Contents |
|---|---|
| [`SPECIFICATION.md`](SPECIFICATION.md) | The full specification (v0.1): the AIAAF framework and the AITL methodology that applies it |
| [`rubric/dimensions.md`](rubric/dimensions.md) | AIAAF: the six evaluation dimensions and scoring scale |
| [`taxonomy/generative-failure-patterns.md`](taxonomy/generative-failure-patterns.md) | AIAAF: named taxonomy of accessibility failure patterns specific to AI-generated design |
| [`examples/worked-example-signup-screen.md`](examples/worked-example-signup-screen.md) | Complete worked example: the rubric applied to a synthetic AI-generated sign-up screen |
| `AITL_Methodology_Specification_v0.1.pdf` | The specification as a formatted PDF |

## Status

This is an early-stage, actively developed methodology. Current phase:
applying the rubric to synthetic and publicly available AI-generated
interfaces and refining the failure-pattern taxonomy. Planned phases include
inter-rater exercises with accessibility practitioners, validation with
assistive-technology users, and dissemination through peer-reviewed
human-computer-interaction venues.

Feedback, issues, and discussion are welcome — please open an issue.

## Citation

If you reference this work, please cite it (see [`CITATION.cff`](CITATION.cff)).
DOI: [10.5281/zenodo.21431753](https://doi.org/10.5281/zenodo.21431753)

## License

Released under [CC BY 4.0](LICENSE) — you are free to share and adapt the
methodology with attribution.
