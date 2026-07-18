#!/usr/bin/env node
// AITL MCP Server v0.1 — exposes the AITL automated layer to AI assistants
// (Claude Desktop, Claude Code, and other MCP-compatible clients) so that
// accessibility evaluation runs IN THE LOOP while UI is being generated.
// © 2026 Ifeoluwa Orimolade · CC BY 4.0
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { scan, PATTERNS } from "./engine.js";

const server = new McpServer({ name: "aitl", version: "0.1.0" });

server.registerTool("aitl_scan_html", {
  title: "AITL: scan generated UI markup",
  description:
    "Run the AITL (Accessibility-in-the-Loop) automated scan — applying the AI-Generated "+
    "Interface Accessibility Assurance Framework (AIAAF) — on HTML/CSS markup: " +
    "typically UI you have just generated. Detects the generative accessibility " +
    "failure-pattern taxonomy (P1–P8) and structural defects, returns element-level " +
    "findings with WCAG mappings and fixes, a release-gate result, suggested dimension " +
    "scores, and the list of judgments routed to human/AT-user review. Call this after " +
    "generating any UI, apply the fixes, and re-scan until the gate passes.",
  inputSchema: { html: z.string().describe("The HTML (with CSS in <style>) to evaluate") },
}, async ({ html }) => ({
  content: [{ type: "text", text: JSON.stringify(scan(html), null, 2) }],
}));

server.registerTool("aitl_scan_url", {
  title: "AITL: scan a live prototype URL",
  description:
    "Fetch a publicly reachable prototype or page URL and run the AITL automated scan " +
    "on its markup. Use for deployed previews and prototype links.",
  inputSchema: { url: z.string().url().describe("Publicly reachable http(s) URL") },
}, async ({ url }) => {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return { content: [{ type: "text", text: `Fetch failed: HTTP ${res.status}` }], isError: true };
  const html = await res.text();
  return { content: [{ type: "text", text: JSON.stringify({ scannedUrl: url, ...scan(html) }, null, 2) }] };
});

server.registerTool("aitl_taxonomy", {
  title: "AITL: generative failure-pattern taxonomy",
  description:
    "Return the AIAAF taxonomy of accessibility failure patterns specific to AI-generated " +
    "design (P1–P8). Use it as generation-time guidance: avoid these patterns while " +
    "producing UI, before scanning.",
  inputSchema: {},
}, async () => ({
  content: [{ type: "text", text: JSON.stringify({
    version: "0.1", patterns: PATTERNS,
    guidance: [
      "Give every input a persistent programmatic label (never placeholder-only).",
      "Use native <button>/<a> for every action (never div/span with onclick).",
      "Empty alt for decorative images; purposeful alt for informative ones — never generic.",
      "Use a real heading hierarchy (<h1>–<h3>) and <nav>/<main> landmarks.",
      "Pair every color-coded state with text and aria-current/aria-* semantics.",
      "Never remove focus outlines without a visible :focus-visible replacement.",
      "Keep text contrast ≥ 4.5:1 (3:1 for large text and UI components).",
      "Never place aria-hidden over focusable content.",
    ],
  }, null, 2) }],
}));

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("AITL MCP server running (stdio).");
