#!/usr/bin/env node
// AITL Corpus Study 1: automated audit runner.
//
// For every row in study/data/corpus.csv this script:
//   1. loads the interface in Chromium (local file or published URL),
//   2. saves the rendered DOM and a full page screenshot,
//   3. runs axe-core on the rendered page,
//   4. runs the AITL automated scan (frozen v0.1 engine) on the source file
//      and on the rendered DOM,
//   5. records evidence aids for the human coder: a keyboard Tab walk with
//      the computed focus styles at each stop, and the non native elements
//      that carry click listeners (via the Chrome DevTools Protocol).
//
// None of this replaces the human evaluation. The evidence aids exist so the
// coder can point to concrete elements; the coding decision stays human.
//
// Usage (from the repo root):
//   node study/scripts/audit.mjs            audits every row in corpus.csv
//   node study/scripts/audit.mjs C1-CL-A    audits one interface id
//
// Ifeoluwa Orimolade, 2026. CC BY 4.0

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { scan } from "../../mcp-server/engine.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const AXE_PATH = require.resolve("axe-core/axe.min.js");
const AXE_VERSION = require("axe-core/package.json").version;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STUDY = path.resolve(HERE, "..");
const OUT = {
  rendered: path.join(STUDY, "corpus", "rendered"),
  shots: path.join(STUDY, "results", "screenshots"),
  axe: path.join(STUDY, "results", "axe"),
  aitl: path.join(STUDY, "results", "aitl"),
  aids: path.join(STUDY, "results", "evidence-aids"),
};
Object.values(OUT).forEach((d) => fs.mkdirSync(d, { recursive: true }));

// ---------- tiny CSV reader (no quoting edge cases beyond double quotes) ----
function readCsv(file) {
  const text = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); if (row.some((c) => c.trim() !== "")) rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

// ---------- evidence aid: keyboard Tab walk ----------
async function tabWalk(page, maxStops = 40) {
  const stops = [];
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
  await page.mouse.click(1, 1).catch(() => {});
  for (let i = 0; i < maxStops; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return null;
      const cs = getComputedStyle(el);
      const tag = el.tagName.toLowerCase();
      const name = (el.getAttribute("aria-label") || el.innerText || el.value || el.getAttribute("placeholder") || "").trim().slice(0, 60);
      const r = el.getBoundingClientRect();
      return {
        tag,
        id: el.id || "",
        cls: (el.getAttribute("class") || "").slice(0, 60),
        role: el.getAttribute("role") || "",
        name,
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        outlineColor: cs.outlineColor,
        boxShadow: cs.boxShadow,
        width: Math.round(r.width),
        height: Math.round(r.height),
        key: tag + "#" + (el.id || "") + "." + (el.getAttribute("class") || "") + "|" + Math.round(r.x) + "," + Math.round(r.y),
      };
    });
    if (!info) { stops.push({ stop: i + 1, note: "focus left the page content or returned to body" }); break; }
    if (stops.length && stops.some((s) => s.key === info.key)) { stops.push({ stop: i + 1, note: "focus cycled back to an earlier element", ...info }); break; }
    const visible = !(info.outlineStyle === "none" || info.outlineWidth === "0px") || (info.boxShadow && info.boxShadow !== "none");
    stops.push({ stop: i + 1, ...info, visibleIndicatorHint: visible });
  }
  return stops;
}

// ---------- evidence aid: non native elements with click listeners ----------
async function clickListeners(page) {
  const client = await page.context().newCDPSession(page);
  const { result } = await client.send("Runtime.evaluate", {
    expression: "Array.from(document.querySelectorAll('body *'))", returnByValue: false,
  });
  const { result: props } = await client.send("Runtime.getProperties", { objectId: result.objectId, ownProperties: true });
  const native = new Set(["a", "button", "input", "select", "textarea", "summary", "label", "option", "details"]);
  const hits = [];
  for (const p of props) {
    if (!/^\d+$/.test(p.name) || !p.value?.objectId) continue;
    const { listeners } = await client.send("DOMDebugger.getEventListeners", { objectId: p.value.objectId });
    const types = [...new Set(listeners.map((l) => l.type))].filter((t) => ["click", "mousedown", "mouseup", "pointerdown", "keydown"].includes(t));
    if (!types.length) continue;
    const { result: d } = await client.send("Runtime.callFunctionOn", {
      objectId: p.value.objectId, returnByValue: true,
      functionDeclaration: "function(){const t=this.tagName.toLowerCase();return {tag:t,id:this.id||'',cls:(this.getAttribute('class')||'').slice(0,60),role:this.getAttribute('role')||'',tabindex:this.getAttribute('tabindex'),text:(this.innerText||'').trim().slice(0,50)}}",
    });
    const v = d.value;
    if (native.has(v.tag)) continue;
    hits.push({ ...v, listenerTypes: types, hasKeyHandler: types.includes("keydown") });
  }
  await client.detach();
  return hits;
}

// ---------- main ----------
const rows = readCsv(path.join(STUDY, "data", "corpus.csv"));
const only = process.argv[2];
const todo = rows.filter((r) => r.interface_id && (!only || r.interface_id === only));
if (!todo.length) { console.error("No matching rows in study/data/corpus.csv"); process.exit(1); }

const browser = await chromium.launch();
const summary = [];
for (const r of todo) {
  const id = r.interface_id;
  const src = r.source_path ? path.join(STUDY, r.source_path) : "";
  const target = r.url ? r.url : pathToFileURL(src).href;
  if (!r.url && !fs.existsSync(src)) { console.warn(`[skip] ${id}: source file not found at ${r.source_path}`); continue; }
  process.stdout.write(`[audit] ${id} ... `);

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  page.on("dialog", (d) => d.dismiss().catch(() => {}));
  await page.goto(target, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => consoleErrors.push("goto: " + e.message));
  await page.waitForTimeout(1500);

  const rendered = await page.content();
  fs.writeFileSync(path.join(OUT.rendered, `${id}.html`), rendered);
  await page.screenshot({ path: path.join(OUT.shots, `${id}.png`), fullPage: true });

  // axe-core, all rules including best practices, WCAG 2.2 AA tags recorded per violation
  await page.addScriptTag({ path: AXE_PATH });
  const axe = await page.evaluate(async () => await window.axe.run(document, { resultTypes: ["violations", "incomplete"] }));
  fs.writeFileSync(path.join(OUT.axe, `${id}.json`), JSON.stringify({ axeVersion: axe.testEngine?.version, url: axe.url, timestamp: axe.timestamp, violations: axe.violations, incomplete: axe.incomplete }, null, 2));

  // AITL automated layer on source and rendered markup
  const sourceHtml = src && fs.existsSync(src) ? fs.readFileSync(src, "utf8") : null;
  const aitlSource = sourceHtml ? scan(sourceHtml) : null;
  const aitlRendered = scan(rendered);
  fs.writeFileSync(path.join(OUT.aitl, `${id}.json`), JSON.stringify({ engineCommit: process.env.AITL_ENGINE_COMMIT || "record in protocol", source: aitlSource, rendered: aitlRendered }, null, 2));

  // evidence aids
  let walk = [], listeners = [];
  try { walk = await tabWalk(page); } catch (e) { walk = [{ error: e.message }]; }
  try { listeners = await clickListeners(page); } catch (e) { listeners = [{ error: e.message }]; }
  fs.writeFileSync(path.join(OUT.aids, `${id}.json`), JSON.stringify({ tabWalk: walk, nonNativeClickTargets: listeners, consoleErrors }, null, 2));

  const pats = (res) => res ? [...new Set(res.findings.map((f) => f.pattern).filter(Boolean))].sort().join(" ") : "";
  summary.push({
    interface_id: id,
    axe_version: axe.testEngine?.version || AXE_VERSION,
    axe_violation_rules: axe.violations.length,
    axe_violation_nodes: axe.violations.reduce((n, v) => n + v.nodes.length, 0),
    axe_rules: axe.violations.map((v) => v.id).sort().join(" "),
    aitl_source_gate: aitlSource ? aitlSource.gate.split(" ")[0] : "",
    aitl_source_patterns: pats(aitlSource),
    aitl_rendered_gate: aitlRendered.gate.split(" ")[0],
    aitl_rendered_patterns: pats(aitlRendered),
    tab_stops: walk.filter((s) => s.tag).length,
    tab_stops_no_visible_indicator: walk.filter((s) => s.tag && s.visibleIndicatorHint === false).length,
    non_native_click_targets: listeners.filter((l) => l.tag).length,
    page_errors: consoleErrors.length,
  });
  console.log("done");
  await ctx.close();
}
await browser.close();

const cols = Object.keys(summary[0] || { interface_id: "" });
const esc = (v) => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
const outCsv = path.join(STUDY, "results", "automated_summary.csv");
let existing = fs.existsSync(outCsv) && only ? readCsv(outCsv).filter((r) => r.interface_id !== only) : [];
const all = [...existing, ...summary].sort((a, b) => a.interface_id.localeCompare(b.interface_id));
fs.writeFileSync(outCsv, [cols.join(","), ...all.map((s) => cols.map((c) => esc(s[c] ?? "")).join(","))].join("\n") + "\n");
console.log(`\nWrote ${path.relative(process.cwd(), outCsv)} (${all.length} rows). Per interface outputs are in study/results/.`);
