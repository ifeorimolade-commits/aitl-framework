# AITL Corpus Study 1: Codebook

This codebook turns the AIAAF v0.1 rubric and taxonomy into decisions an evaluator can make the same way every time. It is used by the primary coder and by the independent evaluators. Where this codebook and your instinct disagree, follow the codebook and write your disagreement in the notes column; disagreements are useful data.

## 1. Setup for every interface

* Browser for the keyboard pass: Chrome, window at least 1280 pixels wide, zoom 100%.
* Screen reader pass: VoiceOver on macOS with Safari. In Safari, turn on Settings, Advanced, "Press Tab to highlight each item on a webpage".
* Open the interface by double clicking its file in `corpus/source/` (or from the local server if you run one), or from the published link for Figma Make.
* Use the task for the component (section 2). The task is what "completable" means in D5 and in the severity rules.

## 2. Tasks

**C1, sign up form.** Fill in every field with valid data except one (enter an email without an @), submit, find out what went wrong, fix it, submit again, and reach the success message.

**C2, city homepage.** From the top of the page, (a) reach "Report a pothole", (b) use the service search, (c) open the first news story link, and (d) at a narrow window (resize Chrome to about 400 pixels wide) open the hamburger menu and reach "Parks and recreation" or the nearest equivalent menu item.

**C3, booking dialog.** Open the booking dialog, choose a visit type, choose an available date, choose an available time, enter a reason, confirm, read the confirmation, close the dialog, and confirm where focus lands afterwards.

## 3. Coding a pattern

For each of P1 to P8 record:

* `present`: Y if at least one instance meets the rule below, N if none does, NA only if the interface has no element the rule could apply to (for example P1 on a page with no form fields). NA is rare; most patterns can be absent rather than not applicable.
* `instances`: how many elements meet the rule. Count distinct elements, not repeated CSS rules.
* `highest_severity`: the most severe instance, using section 5.
* `evidence`: a selector, element text, or short description precise enough that someone else can find it (for example `input#email placeholder="Email address", no label`).

### P1, Placeholder only labeling
**Present** when a form field's only text identifying its purpose is its `placeholder`, and it has no programmatically associated name: no `<label for>` matching its id, no wrapping `<label>`, no `aria-label`, no `aria-labelledby`.
**Not present** when a visible label exists and is associated. A visible label that is not associated (a `<div>` or `<p>` above the field) is **not P1**; code it under D3 and log it in unclassified defects as "visible but unassociated label".
**How to check:** inspect each input; in VoiceOver, move to the field and listen. If VoiceOver reads only the placeholder or nothing, and there is no associated label in the markup, it is P1.

### P2, divAsButton
**Present** when a non native element (`div`, `span`, `li`, `img`, `svg`, `p`) acts as a control (it does something when clicked) and at least one of these is true: it cannot be reached with Tab, it cannot be activated with Enter or Space, or it exposes no role a screen reader announces as a control.
**Not present** when the control is a native `button`, `a href`, `input`, `select`, `summary`, or a non native element that has `role`, `tabindex="0"` and works with Enter and Space.
**How to check:** use the evidence aid list of non native click targets (`results/evidence-aids/<id>.json`, `nonNativeClickTargets`). For each one, try Tab and Enter and Space. Click handlers added in script count the same as `onclick` attributes.

### P3, Generic or hallucinated alternative text
**Present** when any of these is true:
* an informative image has `alt` that is generic ("image", "photo", "picture", "icon", "illustration", "banner", "placeholder", a filename), or
* an image's `alt` describes something the image does not show (compare the alt with the screenshot), or
* an informative image has no `alt` attribute at all, or
* a decorative image has non empty alt that a screen reader would read as content.
**Not present** when informative images have purposeful text and decorative images have `alt=""` or are CSS backgrounds or hidden SVG.
**Placeholder images:** many generated pages use stock or placeholder photos. Judge alt against what the image is meant to be in the design (for example "Road crew repaving Main Street" for a news photo). Alt that names the placeholder service or says "Placeholder image" is generic.
**Icons inside controls:** an icon only button whose icon has no name and whose button has no `aria-label` is coded as P3 only if the icon is an `img`; if it is inline SVG, code the missing name under D4 and note it.

### P4, Visual only structure
**Present** when any of these is true:
* text that looks like a page title or section heading (larger or bolder than body text, introducing a section) is not a heading element and has no `role="heading"`, or
* there is no `h1` at all on a full page (C2), or
* the heading levels skip in a way that breaks the outline (an `h4` directly under an `h1` with nothing between), or
* a group that is visually a list (nav links, service cards, news stories, time slots) has no list or grouping semantics and no landmark, so its count and grouping are not available to a screen reader.
**Not present** when the VoiceOver headings rotor gives a sensible outline that matches the visual one, and the main page regions are landmarks.
**C1 and C3 note:** a single form or dialog needs a heading for its title (or the dialog needs an accessible name), not a full outline.

### P5, Color only state
**Present** when a state is shown only by color, border color, or background color with no text, icon with a name, or programmatic state. States to check: field errors (C1), current page in navigation (C2), selected date and selected time (C3), unavailable time slots (C3), required fields.
Programmatic state means `aria-invalid`, `aria-describedby` pointing at the error text, `aria-current`, `aria-selected`, `aria-pressed`, `aria-checked`, `disabled`, or a native checked state.
**Not present** when the state has both a non color visual cue (text, icon, underline, weight, pattern) and a programmatic state.
**Partial:** if there is a visible text cue but no programmatic state, code P5 as present with severity Medium and say so in the notes.

### P6, Suppressed focus
**Present** when at least one interactive element shows no visible change when it receives keyboard focus, and the cause is the page's own CSS (for example `outline: none` or `outline: 0` with no `:focus-visible` replacement and no box shadow or border change).
**How to check:** Tab through the whole page and look at every stop. The evidence aid tab walk (`tabWalk`, `visibleIndicatorHint`) is a hint only; confirm by eye, because a background or border change can be a valid indicator the hint does not detect.
**Not present** when every focus stop has a visible indicator you can see without hunting for it.

### P7, Low contrast default aesthetics
**Present** when any text that carries meaning (body text, labels, helper text, placeholder text used as the only instruction, links, button text, error text) has a contrast ratio below 4.5 to 1 against its actual background, or below 3 to 1 for large text (24 px regular or 18.66 px bold and above). Also present when a control's boundary that is needed to identify it (an input border on a white form) is below 3 to 1.
**How to check:** use the Chrome DevTools color picker on the element (it shows the ratio), or the WebAIM contrast checker. Measure against the background the text actually sits on.
**Not present** when every meaningful text meets the ratios. Disabled controls and pure decoration are exempt.

### P8, Decorative ARIA misuse
**Present** when ARIA hides or misdescribes something that works: `aria-hidden="true"` on an element that is or contains something focusable or interactive; `role="presentation"` or `role="none"` on a functional element; a `role` that contradicts behavior (a `role="button"` that navigates, a `role="link"` that submits, `role="dialog"` without a name or without moving focus in); `aria-label` that contradicts the visible label so voice users cannot activate the control by what they see.
**Not present** when ARIA is absent or used correctly. Missing ARIA is not P8; misused ARIA is.

## 4. Dimension scores (0 to 5)

Score each dimension for this interface and its task, using the scale in `SPECIFICATION.md` section 5:

| Score | Meaning |
|---|---|
| 5 | No defects on this dimension for the task. |
| 4 | Defects that do not stop the task with assistive technology. |
| 3 | Task completable with assistive technology, with significant friction or workarounds. |
| 2 | At least one defect stops some users from completing the task. |
| 1 | Several defects; the task is effectively unavailable to assistive technology users. |
| 0 | Not evaluable. Say why in the notes. |

Anchors that keep scores consistent:

* **D1 Perceivable:** text alternatives, contrast, structure conveyed in markup. Any P3 or P7 instance on content the task depends on means D1 is 3 or lower.
* **D2 Operable:** keyboard reach and activation, visible focus, focus order, no traps, target size. Any control in the task path that cannot be reached or activated by keyboard means D2 is 2 or lower. P6 across the task path means D2 is 3 or lower.
* **D3 Understandable:** labels, instructions, errors identified in text and tied to the field, predictable behavior. P1 on a field in the task means D3 is 2 or lower.
* **D4 Robust:** name, role and value correct on every control; valid structure; correct ARIA. P8 on a control in the task path means D4 is 2 or lower.
* **D5 Assistive technology behavior:** what actually happened in the VoiceOver and keyboard passes. Score 5 only if you completed the task with VoiceOver and with keyboard alone with no confusion. Score 2 or lower if you could not complete it with either.
* **D6 Resistance to generative failure patterns:** 5 if no pattern is present; then subtract one point for each distinct pattern present, with a floor of 1. This is mechanical so that it is consistent across coders.

## 5. Severity and the release gate

| Severity | Rule for this study |
|---|---|
| Critical | The instance stops a keyboard only user or a VoiceOver user from completing the task. |
| High | The task can be completed, but only with major difficulty or by guessing, or one user group is excluded from part of the content. |
| Medium | A conformance failure with a workaround that does not threaten the task. |
| Low | Best practice deviation, no conformance failure. |

**Gate:** FAIL if there is at least one Critical finding, or at least one High finding with no documented exception. Otherwise PASS. Record the number of Critical and High findings.

## 6. Unclassified defects

Anything you find that is a real accessibility defect and does not fit P1 to P8 goes in `data/unclassified_defects.csv` (or the rater sheet's second tab) with the element, a description, the WCAG success criterion if you know it, and a severity. Do not stretch a pattern definition to fit a defect; log it here instead. These are how the taxonomy grows.

## 7. Time

Record the minutes you spent on each interface. Aim for about 25 minutes. If an interface takes much longer, note why.
