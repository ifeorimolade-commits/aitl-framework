#!/usr/bin/env node
// Smoke test for the AITL MCP server, run before the in the loop sessions.
// Starts mcp-server/index.js over stdio exactly as Claude Desktop would,
// lists its tools, and calls aitl_scan_html on the repo's synthetic sample.
// If this passes, the server is ready to be connected to Claude Desktop.
//
// Usage (from the repo root):  node study/scripts/mcp_smoke_test.mjs
// Ifeoluwa Orimolade, 2026. CC BY 4.0

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const req = createRequire(path.join(REPO, "mcp-server", "package.json"));
const { Client } = await import(req.resolve("@modelcontextprotocol/sdk/client/index.js"));
const { StdioClientTransport } = await import(req.resolve("@modelcontextprotocol/sdk/client/stdio.js"));

const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(REPO, "mcp-server", "index.js")] });
const client = new Client({ name: "aitl-smoke-test", version: "1.0.0" });
await client.connect(transport);

const { tools } = await client.listTools();
console.log("Tools exposed:", tools.map((t) => t.name).join(", "));

const html = fs.readFileSync(path.join(REPO, "examples", "sample-homepage", "index.html"), "utf8");
const res = await client.callTool({ name: "aitl_scan_html", arguments: { html } });
const out = JSON.parse(res.content[0].text);
const pats = [...new Set(out.findings.map((f) => f.pattern).filter(Boolean))].sort();
console.log(`aitl_scan_html on examples/sample-homepage: gate ${out.gate.split(" ")[0]}, ${out.criticals} critical, patterns ${pats.join(" ")}`);
await client.close();
console.log(tools.length === 3 && out.gate.startsWith("FAIL") ? "SMOKE TEST PASSED" : "SMOKE TEST: unexpected result, check the server");
