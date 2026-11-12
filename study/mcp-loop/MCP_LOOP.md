# Condition M: AITL in the Generation Loop

**Deferred.** This procedure is not part of Corpus Study 1 as preregistered on November 12, 2026. It is kept for a later study.

This is the first recorded use of the AITL MCP server inside a real generation session. The question is narrow: when Claude can call the AITL scan while it generates, does it reach an automated gate pass, and do the changes it makes actually fix the patterns when a human checks them?

Do these sessions only after the primary coding of Conditions A and B is locked (Runbook Step 5).

## Before the first session

1. Claude Desktop is configured with the AITL server (`mcp-server/README.md`), restarted, and the three AITL tools appear in the tools menu.
2. Start a screen recording (QuickTime, File, New Screen Recording) before you send each prompt and stop it after you have copied the final code. The recording is the evidence that the loop ran, so record the whole session, including the tool calls being expanded.
3. Use a new chat for each component. Do not use a project, custom instructions or style.

## Each session (about 15 to 20 minutes)

1. Open a new chat in Claude Desktop. Record the model name shown.
2. Paste the full text of `prompts/C1_M.txt` (then `C2_M.txt`, then `C3_M.txt` in later sessions) and send.
3. Let Claude run. If Claude asks for permission to use a tool, allow it. Do not give any other instruction. If Claude stops before the gate passes and asks whether to continue, reply exactly `Continue.` and count that in the notes.
4. When Claude finishes, expand each `aitl_scan_html` tool call and, for the first and the last call, copy the gate result and the pattern list into `data/mcp_loop_log.csv` (`first_gate`, `first_automated_patterns`, `final_gate`, `final_automated_patterns`). Count all scan calls in `scan_calls`.
5. Copy the final code unchanged into `corpus/source/<C1|C2|C3>-CL-M.html`.
6. Write in `routed_items_listed` whether Claude listed the items the scan routed to human review (Y or N).
7. Save the recording as `corpus/chat-evidence/<interface_id>-session.mov` and a screenshot of the end of the chat as `corpus/chat-evidence/<interface_id>.png`.

## After the session

1. Run the audit on the new file (Runbook Step 6).
2. Code it with the codebook exactly as for any other interface. Do not go easier on it because the scanner passed it.
3. **Scanner evasion check.** For every pattern the scanner reported as fixed, check whether the pattern is really gone under the codebook definition. The v0.1 engine only sees `onclick` attributes and static CSS, so look especially for:
   * a `div` with `onclick` changed into a `div` with `addEventListener` (the scanner no longer sees it; the codebook still codes P2),
   * `outline: none` moved from CSS into an inline style or a script,
   * generic alt text replaced with other generic text the engine's word list does not contain,
   * `aria-label` added to every element in a way that contradicts the visible label (P8),
   * contrast "fixed" in one CSS rule while another rule still applies the old color.
   Write anything you find in `scanner_evasions` with the element. If you find none, write `none found`.

## Reporting honestly

All three possible results are worth reporting: the loop works and the fixes hold; the loop passes the automated gate but the human layer still finds critical problems; or the loop does not reach a pass. The second result in particular is not a failure of the study. It is direct evidence for the framework's central design choice, that the automated layer must route to human evaluation, and it gives the exact list of what engine v0.2 has to learn to see.
