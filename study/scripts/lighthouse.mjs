#!/usr/bin/env node
// AITL Corpus Study 1: Lighthouse accessibility runner.
// Serves study/ over a local HTTP server (Lighthouse does not audit file:// pages),
// runs the Lighthouse accessibility category for every row in corpus.csv
// (published URLs are audited directly), and writes:
//   study/results/lighthouse/<id>.json     full Lighthouse report
//   study/results/lighthouse_scores.csv    one row per interface
//
// Usage (from the repo root):  node study/scripts/lighthouse.mjs [interface_id]
// Requires Chrome or Chromium. If Lighthouse cannot find it, set CHROME_PATH.
// Ifeoluwa Orimolade, 2026. CC BY 4.0

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const STUDY = path.resolve(HERE, "..");
const OUTDIR = path.join(STUDY, "results", "lighthouse");
fs.mkdirSync(OUTDIR, { recursive: true });

const { default: lighthouse } = await import("lighthouse");
const chromeLauncher = await import("chrome-launcher");
if (!process.env.CHROME_PATH) {
  try { process.env.CHROME_PATH = require("playwright").chromium.executablePath(); } catch {}
}

const rows = fs.readFileSync(path.join(STUDY, "data", "corpus.csv"), "utf8").trim().split(/\r?\n/).slice(1)
  .map((l) => { const [interface_id, source_path, url] = l.split(","); return { interface_id, source_path, url }; })
  .filter((r) => r.interface_id && (!process.argv[2] || r.interface_id === process.argv[2]))
  .filter((r) => {
    if (r.url || (r.source_path && fs.existsSync(path.join(STUDY, r.source_path)))) return true;
    console.warn(`[skip] ${r.interface_id}: no url and no source file yet`);
    return false;
  });

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const p = path.join(STUDY, decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(STUDY) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
const out = [];
for (const r of rows) {
  const target = r.url || `http://localhost:${port}/${r.source_path}`;
  process.stdout.write(`[lighthouse] ${r.interface_id} ... `);
  try {
    const result = await lighthouse(target, { port: chrome.port, onlyCategories: ["accessibility"], output: "json", logLevel: "error", formFactor: "desktop", screenEmulation: { disabled: true } });
    fs.writeFileSync(path.join(OUTDIR, `${r.interface_id}.json`), result.report);
    const lhr = result.lhr;
    const failed = Object.values(lhr.audits).filter((a) => a.score === 0 && a.scoreDisplayMode === "binary").map((a) => a.id).sort();
    const manual = Object.values(lhr.audits).filter((a) => a.scoreDisplayMode === "manual").length;
    out.push({ interface_id: r.interface_id, lighthouse_version: lhr.lighthouseVersion, a11y_score: Math.round(lhr.categories.accessibility.score * 100), failed_audits: failed.join(" "), manual_checks_listed: manual });
    console.log(Math.round(lhr.categories.accessibility.score * 100));
  } catch (e) {
    out.push({ interface_id: r.interface_id, lighthouse_version: "", a11y_score: "", failed_audits: "ERROR " + e.message.replace(/,/g, ";"), manual_checks_listed: "" });
    console.log("error: " + e.message);
  }
}
await chrome.kill();
server.close();

const cols = ["interface_id", "lighthouse_version", "a11y_score", "failed_audits", "manual_checks_listed"];
const csv = path.join(STUDY, "results", "lighthouse_scores.csv");
fs.writeFileSync(csv, [cols.join(","), ...out.map((o) => cols.map((c) => `"${String(o[c]).replace(/"/g, '""')}"`).join(","))].join("\n") + "\n");
console.log(`Wrote ${path.relative(process.cwd(), csv)}`);
