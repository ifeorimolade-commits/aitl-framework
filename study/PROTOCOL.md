# AITL Corpus Study 1: Preregistered Protocol

**Title:** How often do widely used AI tools produce the AIAAF generative failure patterns, and how much of it do conventional automated checkers miss? An exploratory corpus study.

**Author and primary coder:** Ifeoluwa Orimolade
**Framework under test:** AI-Generated Interface Accessibility Assurance Framework (AIAAF) v0.1, applied with the AITL tool
**Repository:** https://github.com/ifeorimolade-commits/aitl-framework
**Framework DOI (v0.1):** 10.5281/zenodo.21431753
**Protocol version:** 1.1. Written November 4, 2026 and reduced to a smaller design on November 12, 2026, in both cases before any study interface was generated.

This file is committed and tagged (`study1-prereg`) before data collection begins. Anything done differently from what is written here is recorded in the Deviations log at the end of this file, with the date and the reason. Nothing in this file is edited after the tag except that log.

---

## 1. Why this study

AIAAF v0.1 names eight failure patterns (P1 to P8) that AI systems characteristically produce when they generate user interfaces, and it claims that a large part of that layer is invisible to conventional automated checkers. Version 0.1 supported those claims with a worked example on a synthetic interface. This study is the first test of both claims on interfaces that real, widely used AI tools generate from ordinary prompts. It is Phase 1 and the start of Phase 2 of the validation roadmap in `SPECIFICATION.md` section 8.

The study is deliberately small and exploratory. Its purpose is to find out whether the patterns occur in practice, which ones a conventional checker catches, what the AITL automated layer catches and misses, and whether the rubric is usable by evaluators other than its author. It is not designed to estimate population rates or rank AI vendors.

## 2. Research questions and predictions

Predictions are stated before data collection so they can be shown to be wrong.

**RQ1, prevalence.** How often do P1 to P8 appear in interfaces generated from prompts that do not mention accessibility?
*Prediction H1:* at least one pattern will be present in a majority of Condition A interfaces.

**RQ2, the automation gap.** Of the patterns a human evaluator codes as present, how many do axe-core and Lighthouse flag?
*Prediction H2:* under the rule mapping fixed in `scripts/summarize.py`, axe-core and Lighthouse will flag P7 (low contrast) and P8 (aria-hidden over focusable content) when present, and will not flag P1 (placeholder only labels), P2 (non semantic click targets), P5 (color only state) or P6 (suppressed focus). P3 and P4 will be flagged only partly.
*Basis:* a pipeline dry run on November 4, 2026 on the repository's existing synthetic sample (`examples/sample-homepage`, which contains all eight patterns) gave a Lighthouse accessibility score of 86 with only `aria-hidden-focus` and `color-contrast` failing. That sample was built to contain the patterns, so it shows the pipeline works; it is not evidence about real tool output.

**RQ3, score versus gate.** Do interfaces that fail the AIAAF release gate still receive high Lighthouse scores?
*Prediction H3:* at least one interface that fails the gate will score 90 or higher on Lighthouse.

**RQ4, prompting.** Deferred to a later study. (The November 4 draft included a condition that added "Make sure it is accessible." to the prompt; it was removed on November 12 for time, before data collection.)

**RQ5, AITL automated layer.** What share of human coded patterns does the frozen AITL v0.1 engine detect, and where does it produce false positives? No prediction. The answer sets the priorities for engine v0.2.

**RQ6, in the loop.** Deferred to a later study. (The November 4 draft included Claude Desktop sessions with the AITL MCP server connected; removed on November 12 for time, before data collection.)

**RQ7, agreement.** Do two independent evaluators, applying the codebook, reach similar pattern and score decisions to the author's? Reported as preliminary only.

## 3. Design

### 3.1 Tools

| Code | Tool | How the session is opened |
|---|---|---|
| CL | Claude, claude.ai web app | A new incognito chat, so no memory, project, or custom instructions apply |
| GP | ChatGPT, chatgpt.com web app | A new Temporary Chat, so memory and custom instructions do not apply |
| FM | Figma Make | A new Make file, no attached design system or library |

Each tool is used with whatever default model it presents to a signed in user on the day. The exact model or version name shown in the interface, the plan, and the time are recorded in `data/generation_log.csv`. No settings are changed from their defaults (no extended reasoning toggled on or off, no style presets).

*Pre registered fallback:* if Figma Make cannot produce a published preview that the audit script can load, Gemini (gemini.google.com, a new chat with no saved info applied) replaces it with the code GM, using the same prompt files as CL and GP. The switch is logged as a deviation.

### 3.2 Components and prompts

Three components, chosen because each represents a high stakes service area and each exercises different patterns.

| Code | Component | Sector | Exercises mostly |
|---|---|---|---|
| C1 | Patient portal sign up form with inline validation | Healthcare | P1, P5, P6, D3 |
| C2 | City government homepage with navigation, search, service grid, news, footer | Government services | P2, P3, P4, P7, P8 |
| C3 | Appointment booking dialog with date and time selection | Healthcare | P2, P5, P6, D2 and D5 focus management |

The exact prompt text is in `prompts/`. Its SHA-256 hashes are in `data/prompt_sha256.txt`. None of the Condition A prompts mention accessibility, disabilities, screen readers, keyboards, WCAG, or contrast. The CL and GP prompts end with one sentence asking for a single self contained HTML file; the FM prompts omit that sentence because Figma Make produces its own project format.

### 3.3 Conditions

| Condition | What changes | Interfaces |
|---|---|---|
| A, default | The prompt as written | 3 components x 3 tools = 9 |

Total: 9 interfaces. Two further conditions in the November 4 draft (an accessibility request added to the prompt, and generation with the AITL MCP server in the loop) are deferred to a later study. Their prompt files are kept in `prompts/deferred/` for that study and are not used here.

### 3.4 Generation rules

1. One generation per interface. The first complete response is the one studied. No regenerating, no cherry picking, no edits to the output.
2. If the response is cut off or is not a runnable page, the follow up in `prompts/FOLLOWUP.txt` is sent once, word for word. If that also fails, the interface is recorded as a generation failure and reported, not replaced.
3. The code is copied exactly as given into `corpus/source/<interface_id>.html`. For Figma Make the published preview URL is recorded in `data/corpus.csv` and the audit script saves the rendered DOM.
4. A screenshot or share link of each chat is saved (`corpus/chat-evidence/`) so the prompt and output can be verified.
5. Immediately after generation, before any evaluation, the SHA-256 hash of every source file is written to `data/corpus_sha256.txt` and the raw corpus is committed. Any later change to a source file would show in the hash.

### 3.5 Measurement

**Automated layer.** `scripts/audit.mjs` loads each interface in Chromium and saves: the rendered DOM, a full page screenshot, axe-core 4.10.3 results (all rules, violations and incomplete), the AITL v0.1 automated scan of both the source and the rendered DOM, and two evidence aids for the human coder (a keyboard Tab walk recording focus styles at each stop, and the list of non native elements that carry click listeners). `scripts/lighthouse.mjs` records the Lighthouse 12.6.1 accessibility score and failing audits. The scripts are run on the committed files in a cloud environment with Chromium, and their outputs are committed to `results/`.

The AITL engine is frozen for this study at commit `9f36b5799a63e8dccd7f27bed292098df82eb61e` (`mcp-server/engine.js`, SHA-256 `6ed63b5ec31bac17844228a58194f3578870d5a4d296841154663daed53f0320`). No change is made to the engine until all study data is collected. Improvements the study suggests go into v0.2 afterwards, and the v0.1 results stay as recorded.

**Human evaluation.** The primary coder applies `CODEBOOK.md` to each interface: a keyboard only pass in Chrome, a VoiceOver pass in Safari on macOS, inspection of the markup, a present or absent decision for each of P1 to P8 with element level evidence, a 0 to 5 score on D1 to D6, severity for each finding, and the release gate decision. Defects that do not fit P1 to P8 are logged in `data/unclassified_defects.csv`.

**Blinding and order.** The primary coder generated the interfaces and cannot be blind to the tool. To limit the influence of the automated results on the human coding, the coder does not open `results/axe/`, `results/aitl/`, `results/automated_summary.csv` or any Lighthouse output until the human coding of all interfaces is complete and committed ("Lock primary coding"). The evidence aids may be used during coding because they are observations, not verdicts. Interfaces are coded in this fixed order, which interleaves tools and components:

C2-GP-A, C1-FM-A, C3-CL-A, C1-GP-A, C2-CL-A, C3-FM-A, C1-CL-A, C3-GP-A, C2-FM-A

### 3.6 Independent evaluators (inter rater subset)

Two evaluators with professional accessibility or UX experience who did not take part in building AIAAF each code three interfaces independently: C1-CL-A, C2-GP-A and C3-FM-A (one per tool and one per component). They receive the interfaces under neutral names (R1 = C2-GP-A, R2 = C3-FM-A, R3 = C1-CL-A; the key is kept in `data/rater_key.csv`, not in the packet) with no tool names, the codebook, and the rater sheets in `rater-packet/`. The two HTML interfaces are sent as files. The Figma Make interface can only be sent as its published preview link, so its tool may be recognizable from the address; this partial unblinding is accepted and reported. They do not see the author's coding or the automated results. They are asked not to discuss their decisions with each other or with the author until they have returned their sheets. Their names, roles and the date they completed the work are recorded with their consent. If fewer than two evaluators return sheets by November 15, 2026, agreement is reported only for the sheets returned, and the report says so.

## 4. Analysis plan

All numbers in the report come from `scripts/summarize.py`, which uses only the Python standard library and can be rerun by anyone from the published files.

1. Prevalence of each pattern in Condition A, overall and by tool, as counts out of the number of interfaces coded (Table 2).
2. Detection: for each pattern coded present, whether the AITL automated layer, axe-core and Lighthouse flagged it, using the pattern to rule mapping fixed in the script before data collection (Table 3). AITL automated flags that the coder judged absent are reported as false positives.
3. The human gate result beside the Lighthouse score for every interface (Table 4).
4. Agreement on the inter rater subset: percent agreement and Cohen's kappa for each pair on pattern presence, Fleiss' kappa across all three coders, and exact and within one point agreement on dimension scores (Table 6). With 24 shared pattern decisions per pair these are reported as a first look only.
5. Unclassified defects, as candidates for taxonomy v0.2 (Table 7). A candidate is proposed for the taxonomy only if it recurs across more than one tool.

Descriptive statistics only. No significance tests are run; the corpus is too small for them to mean anything.

## 5. What would count against the framework

These outcomes would be reported plainly and would change the framework:

* Patterns that never occur in the corpus. They stay in the taxonomy only if other evidence supports them, and the report says they were not observed.
* Conventional checkers detecting most of what the human coder found. That would weaken the claim that AIAAF covers a layer automated tools miss.
* Low agreement between evaluators on a pattern or dimension. That definition is rewritten before any wider use.

## 6. Limitations stated in advance

* Nine interfaces from three tools on one day. AI tools change often and give different output on each run, so the results describe this corpus, not the tools in general.
* The primary coder is the framework's author. The independent evaluator subset and the published data exist to check that, but they do not remove it.
* Screen reader testing uses one screen reader (VoiceOver) and is done by a sighted evaluator. Testing with assistive technology users is Phase 3 and is not part of this study.
* Detection is matched at the interface level, not element by element, which can overstate a tool's detection when it flags a different instance of the same pattern.
* The AITL automated layer is static analysis. It cannot see click handlers added in script or color only states that appear only after interaction. Those are routed to the human layer by design.

## 7. Data and publication

Everything is published in this repository under CC BY 4.0: prompts, chat evidence, raw source files with hashes, rendered DOMs, screenshots, all automated outputs, the coding sheets, the scripts, and the report. The study release is archived as a new version of the Zenodo record for this repository. Independent evaluators' sheets are published with their names only if they agree; otherwise under R1 and R2 labels.

## 8. Schedule

* November 4, 2026: protocol, codebook, prompts and scripts written; pipeline dry run on the synthetic sample.
* November 12, 2026: design reduced to Condition A; preregistration tag pushed; interfaces generated; raw corpus committed; automated audit run and withheld from the coder.
* November 12 to 13, 2026: primary coding, coding locked, first summary.
* Rater sheets requested back by November 15, 2026.
* Report and v0.2 release after the rater sheets are in.

## 9. Deviations log

Record every departure from this protocol here, with the date and time, what changed, and why. Do not edit anything above this line after the `study1-prereg` tag.

| Date and time | What changed | Why |
|---|---|---|
| | | |
