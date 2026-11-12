# Pipeline dry run, November 4, 2026

Before the study, the audit and Lighthouse scripts were run on the repository's existing synthetic sample, `examples/sample-homepage/index.html` (here called PILOT-00). That page was written for the v0.1 worked example and deliberately contains all eight patterns, so this run only shows that the pipeline works. It is not evidence about what real AI tools produce, and it is not part of the study corpus.

What the run recorded:

* Lighthouse 12.6.1 accessibility score: 86. Failing audits: `aria-hidden-focus` and `color-contrast` only.
* axe-core 4.10.3 violations: `aria-hidden-focus`, `color-contrast`, `landmark-one-main`, `page-has-heading-one`, `region`.
* AITL v0.1 automated layer: gate FAIL, all eight patterns flagged.
* Tab walk: 10 focus stops, none with a visible focus indicator.

So on a page with all eight patterns, the conventional checkers flagged P7 and P8 and structural parts of P4, and did not flag the placeholder only field (P1), the div used as a button (P2), the alt text "image" (P3), the color only current page link (P5) or the removed focus outline (P6). This is the basis for prediction H2 in the protocol; the study tests whether it holds on real tool output.
