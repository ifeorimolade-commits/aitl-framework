# AITL MCP Server (v0.1)

Connects the AITL automated accessibility scan, applying the AI-Generated Interface Accessibility Assurance Framework (AIAAF), to AI assistants via the
**Model Context Protocol (MCP)**, the open standard that lets AI models call
external tools. With this server connected, an assistant that generates UI can
**scan its own output for accessibility in the loop**: generate → scan →
apply fixes → re-scan until the release gate passes.

## Tools exposed

| Tool | What it does |
|---|---|
| `aitl_scan_html` | Scans generated HTML/CSS: taxonomy patterns (P1 to P8), structural defects, WCAG mappings, fixes, release gate, suggested scores, routed human-review items |
| `aitl_scan_url` | Fetches a publicly reachable prototype/page URL and scans it |
| `aitl_taxonomy` | Returns the failure pattern taxonomy + generation time guidance (use *before* generating) |

## Setup

```bash
cd mcp-server
npm install
```

### Claude Desktop
Add to `claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "aitl": {
      "command": "node",
      "args": ["/absolute/path/to/aitl-framework/mcp-server/index.js"]
    }
  }
}
```

### Claude Code
```bash
claude mcp add aitl -- node /absolute/path/to/aitl-framework/mcp-server/index.js
```

### ChatGPT and other MCP clients
ChatGPT and a growing set of clients support MCP connectors for remote
(HTTP/SSE) servers. This v0.1 server runs locally over stdio; a **hosted MCP
endpoint** for remote clients is on the near-term roadmap (see the project
one-pager). Any MCP client that supports local stdio servers can use the
configuration pattern above.

## The intended loop

1. Assistant calls `aitl_taxonomy` before generating (avoid the patterns up front).
2. Assistant generates the UI.
3. Assistant calls `aitl_scan_html` on its own output.
4. Gate FAIL → apply the returned fixes → re-scan.
5. Gate PASS (automated layer) → route the returned human-review items to a
   person, screen reader behavior, alt-text meaningfulness, rendered
   contrast. **The automated layer never replaces human and
   assistive-technology-user judgment; it clears the machine detectable layer
   so human review is spent where it matters.**

## Example prompt (Claude with AITL connected)

> Generate a sign-up form component. Before you finish, run aitl_scan_html on
> your output and fix everything it finds until the gate passes; then list the
> items it routed to human review.

Part of the [Accessibility in the Loop (AITL) Framework](../README.md).
© 2026 Ifeoluwa Orimolade · CC BY 4.0
