# Independent Evaluator Instructions

Thank you for agreeing to evaluate three interfaces for AITL Corpus Study 1. Your evaluation is independent: please do not look at anyone else's evaluation, at the study's results, or at the `study/` folder of the public repository until you have returned your sheets, and please do not discuss the interfaces with other evaluators until then.

**Time:** about 25 to 30 minutes per interface, so around 90 minutes in total, plus 10 minutes for the short feedback questions at the end.

**What you have:**
* `CODEBOOK.md`: the rules for every decision. Please read sections 1 to 6 before you start.
* Three interfaces labeled R1, R2 and R3. R1 and R3 are HTML files; R2 is a link.
* Three sheets to fill in: `rater_patterns.csv`, `rater_scores.csv`, `rater_unclassified.csv`. They open in Excel, Numbers or Google Sheets. When you save, keep them as CSV.

## How to open the interfaces

* For R1 and R3, double click the HTML file to open it in your browser. If anything looks broken, open Terminal in the folder and run `python3 -m http.server 8000`, then visit `http://localhost:8000/R1.html`.
* For R2, open the link.

## For each interface

1. Read the task for its component in `CODEBOOK.md` section 2. R1 is a city homepage (task C2), R2 is a booking dialog (task C3), R3 is a sign up form (task C1).
2. Do a keyboard only pass in Chrome against the task.
3. Do a screen reader pass against the task. On a Mac use VoiceOver with Safari (turn on Safari, Settings, Advanced, "Press Tab to highlight each item on a webpage"). On Windows use NVDA with Chrome or Firefox. Write which one you used in the notes column of `rater_scores.csv`.
4. Inspect the markup with the browser's developer tools for the pattern rules, and check contrast with the developer tools color picker or the WebAIM contrast checker.
5. Fill in the eight pattern rows for that interface in `rater_patterns.csv`, its row in `rater_scores.csv`, and any defects that fit none of the eight patterns in `rater_unclassified.csv`.

Please do **not** run axe, WAVE, Lighthouse, the AITL Scan, or any other automated checker on these interfaces before you finish. The study compares human evaluation against automated tools, so the human evaluation has to be done without them. Browser developer tools and a contrast checker are fine.

## When you are done

Email the three CSV files back, with answers to these questions in the body of the email. Short answers are fine. Honest criticism is the most useful thing you can give.

1. Which pattern definitions were clear enough to decide quickly, and which were hard to apply? Why?
2. Did the 0 to 5 dimension scale and the release gate rules let you express what you found? What was missing?
3. Compared with how you normally evaluate an interface, what did this framework help you notice, and what did it get in the way of?
4. Did you find defects in these AI generated interfaces that you would expect a conventional automated checker to miss? Which?
5. Would you use this framework, or the AITL tool that applies it, in your own work? Under what conditions?
6. May your name, role and organization be listed in the published study as an independent evaluator? (Yes, or no and use an anonymous label.) May your answers to these questions be quoted with your name?

Your evaluation and answers will be published as part of the open study data, under your name only if you agree in question 6. The study results may also be cited by the author in academic work and in [author to state any other use before sending]. Your participation is voluntary and you can withdraw your data before publication by telling the author.
