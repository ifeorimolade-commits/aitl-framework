# Study Runbook (November 12 to 13, 2026)

Nine interfaces: three components from each of Claude, ChatGPT and Figma Make. The automated checks run in the cloud from the committed files, so nothing needs installing on the author's Mac.

## 1. Preregister (before generating anything)

1. Make sure this `study/` folder is on the main branch of the repository.
2. On GitHub, open Releases, then Draft a new release. Tag `study1-prereg`, title `Corpus Study 1 preregistration`, description `Protocol, codebook, prompts and analysis scripts for AITL Corpus Study 1 (9 interfaces), published before data collection. AITL engine frozen at commit 9f36b57.` Publish, and screenshot the page with its date.

## 2. Generate the nine interfaces

For each row, open a fresh session, paste the whole prompt file, send it once, and keep the first complete answer. No regenerating and no edits. If the answer is cut off or will not run, send `prompts/FOLLOWUP.txt` once.

| Order | ID | Where | Prompt file |
|---|---|---|---|
| 1 | C1-CL-A | claude.ai, new incognito chat | prompts/C1.txt |
| 2 | C1-GP-A | chatgpt.com, new Temporary Chat | prompts/C1.txt |
| 3 | C1-FM-A | Figma Make, new Make file | prompts/C1_figma_make.txt |
| 4 | C2-CL-A | claude.ai, new incognito chat | prompts/C2.txt |
| 5 | C2-GP-A | chatgpt.com, new Temporary Chat | prompts/C2.txt |
| 6 | C2-FM-A | Figma Make, new Make file | prompts/C2_figma_make.txt |
| 7 | C3-CL-A | claude.ai, new incognito chat | prompts/C3.txt |
| 8 | C3-GP-A | chatgpt.com, new Temporary Chat | prompts/C3.txt |
| 9 | C3-FM-A | Figma Make, new Make file | prompts/C3_figma_make.txt |

* Claude and ChatGPT: copy the code with the copy button into a plain text file named `<ID>.html`.
* Figma Make: Publish, and record the published link for that ID.
* Every interface: a screenshot of the chat saved as `<ID>.png`, and the model name shown, plan and time noted.

## 3. Freeze the corpus

Upload the nine files to `study/corpus/source/` and the screenshots to `study/corpus/chat-evidence/` on GitHub, with the Figma Make links and generation notes. Commit message: `Corpus Study 1: raw corpus, unedited`. The SHA-256 hashes are computed from this commit and added in the next one.

## 4. Automated checks (cloud)

`audit.mjs` and `lighthouse.mjs` are run on the committed corpus in a cloud environment and their outputs committed to `results/`. The coder receives only the screenshots and the evidence aids (tab walk, click targets) until the lock commit.

## 5. Primary coding

Code the nine interfaces in the order in `PROTOCOL.md` 3.5, applying `CODEBOOK.md`: keyboard pass in Chrome, VoiceOver pass in Safari, markup and contrast checks. Record the results in the coding sheets (patterns, scores, unclassified defects).

## 6. Lock, then summarize

Commit the coding sheets with the message `Corpus Study 1: lock primary coding (before viewing automated results)`. Then run `summarize.py` and commit `results/summary.md`.

## 7. Independent evaluators

Send the rater packet as described in `rater-packet/SEND_TO_RATERS.md`, any time after step 3. Sheets are requested back by November 15, 2026.
