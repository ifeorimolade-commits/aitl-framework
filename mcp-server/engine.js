// AITL detection engine (Node), automated layer of AITL v0.1
// Detects the generative failure pattern taxonomy (P1 to P8) + structural defects.
// © 2026 Ifeoluwa Orimolade · CC BY 4.0
import { parse } from "node-html-parser";

export const PATTERNS = {
  P1: "Placeholder only labeling", P2: "divAsButton",
  P3: "Generic/hallucinated alt text", P4: "Visual only structure",
  P5: "Color only state", P6: "Suppressed focus",
  P7: "Low-contrast default aesthetics", P8: "Decorative ARIA misuse",
};
const GENERIC_ALT = ["image","img","photo","picture","icon","illustration","graphic","logo image","banner"];
const NATIVE = ["a","button","input","select","textarea","summary","label"];

const parseColor = (v) => {
  v = (v || "").trim().toLowerCase();
  let m = v.match(/^#([0-9a-f]{3})$/); if (m) return [0,1,2].map(i => parseInt(m[1][i]+m[1][i],16));
  m = v.match(/^#([0-9a-f]{6})$/); if (m) return [0,2,4].map(i => parseInt(m[1].slice(i,i+2),16));
  m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/); if (m) return [+m[1],+m[2],+m[3]];
  return null;
};
const lum = (c) => { const f = v => { v/=255; return v<=0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4; };
  return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]); };
const ratioVsWhite = (c) => 1.05/(lum(c)+0.05);
const snip = (el) => {
  const s = `<${el.rawTagName}${el.rawAttrs ? " "+el.rawAttrs : ""}>`;
  return s.length > 90 ? s.slice(0,87)+"\u2026" : s;
};

export function scan(html) {
  const findings = [], routed = [];
  const add = (element,pattern,wcag,sev,dim,rationale,fix) =>
    findings.push({ element, pattern, wcag, sev, dim, rationale, fix });
  const root = parse(html, { style: true });
  const css = root.querySelectorAll("style").map(s => s.text).join("\n");
  const isFrag = !/<html[\s>]/i.test(html);
  const labelFors = new Set(root.querySelectorAll("label[for]").map(l => l.getAttribute("for")));

  // P1, placeholder only inputs
  for (const el of root.querySelectorAll("input[placeholder],textarea[placeholder]")) {
    const id = el.getAttribute("id");
    const labeled = (id && labelFors.has(id)) ||
      el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") ||
      el.getAttribute("title") || (el.closest && el.closest("label"));
    if (!labeled) add(snip(el),"P1","1.3.1, 3.3.2","Critical","D3",
      "Input identified only by placeholder text, which is not a programmatic label and disappears on entry, unnamed for screen reader users.",
      "Add a persistent associated <label> or aria-label.");
  }
  // P2, non-semantic click handlers
  for (const el of root.querySelectorAll("[onclick]")) {
    const tag = (el.rawTagName || "").toLowerCase();
    if (NATIVE.includes(tag)) continue;
    if (!(el.getAttribute("role") === "button" && el.hasAttribute("tabindex")))
      add(snip(el),"P2","2.1.1, 4.1.2","Critical","D2",
        `Click handler on a non-semantic <${tag}>, not focusable, not keyboard-activatable, exposes no role.`,
        'Use a native <button>, or add role="button", tabindex="0", and key handling.');
  }
  // P3, missing/generic alt
  for (const el of root.querySelectorAll("img")) {
    if (!el.hasAttribute("alt")) {
      add(snip(el),"P3","1.1.1","High","D1",
        "Image has no alt attribute at all, screen readers may announce the filename.",
        'Add alt="" if decorative, or a purposeful description.');
    } else {
      const a = (el.getAttribute("alt") || "").trim().toLowerCase();
      if (a && GENERIC_ALT.includes(a))
        add(snip(el),"P3","1.1.1","Medium","D1",
          `Generic alt text ("${a}"), a value produced because the attribute exists, conveying nothing.`,
          'alt="" if decorative; a purpose-driven description if informative.');
      else if (a) routed.push(`Verify alt text is meaningful in context for ${snip(el)}.`);
    }
  }
  // P4, heading structure
  const textLen = (root.querySelector("body") || root).text.trim().length;
  if (textLen > 120) {
    const heads = root.querySelectorAll("h1,h2,h3,h4,h5,h6");
    if (heads.length === 0)
      add("(document)","P4","1.3.1, 2.4.6","High","D1",
        "No heading elements exist anywhere, titles are styled containers only; screen reader heading navigation returns an empty list.",
        "Real <h1> to <h3> hierarchy for the title and sections.");
    else if (!root.querySelector("h1"))
      add("(document)","P4","1.3.1, 2.4.6","Medium","D1",
        "Headings exist but no <h1>, the page lacks a programmatic title.",
        "Promote the main title to <h1>.");
  }
  // P6, suppressed focus
  if (/outline\s*:\s*(none|0)/i.test(css) && !/:focus-visible/i.test(css))
    add("(stylesheet)","P6","2.4.7","High","D2",
      "CSS removes focus outlines (outline:none/0) with no :focus-visible replacement, keyboard users cannot see where they are.",
      "Remove the reset or add a visible :focus-visible style.");
  // P8, aria-hidden over focusable
  for (const el of root.querySelectorAll('[aria-hidden="true"]')) {
    if (el.querySelector('a[href],button,input,select,textarea,[tabindex]'))
      add(snip(el),"P8","4.1.2","High","D4",
        'aria-hidden="true" container holds focusable descendants, keyboard focus lands on elements that announce nothing.',
        "Remove aria-hidden from the container; hide only decorative children.");
  }
  // P7, low-contrast colors (vs white; flagged for verification)
  const seen = new Set();
  for (const decl of css.match(/color\s*:\s*([^;{}]+)/gi) || []) {
    const v = decl.split(":")[1]; const c = parseColor(v);
    if (!c) continue; const key = c.join(","); if (seen.has(key)) continue; seen.add(key);
    const r = ratioVsWhite(c);
    if (r < 4.5 && r > 1.2)
      add(`(stylesheet) color ${v.trim()}`,"P7","1.4.3","High","D1",
        `Text color computes to ${r.toFixed(1)}:1 against a white background, below the 4.5:1 minimum for normal text. (Verify against the actual rendered background.)`,
        "Darken to ≥4.5:1, e.g. #4B5563 or darker on white.");
  }
  // P5, active/current heuristic
  for (const el of root.querySelectorAll("a")) {
    const cls = el.getAttribute("class") || "";
    if (/\b(active|selected|current)\b/i.test(cls) && !el.getAttribute("aria-current"))
      add(snip(el),"P5","1.4.1","Medium","D1",
        "Element styled as the active/current item without aria-current, if the distinction is color only, non-color users receive no cue.",
        'Add aria-current="page" and a non-color cue (underline/weight).');
  }
  // structural extras
  if (!isFrag && !(root.querySelector("html")?.getAttribute("lang")))
    add("(document)","","3.1.1","Medium","D3",
      "No lang attribute on <html>, screen readers cannot select the correct speech engine.",
      'Add lang="en" (or the correct language).');
  if (textLen > 120) {
    if (!root.querySelector("main"))
      add("(document)","","1.3.1","Medium","D4","No <main> landmark, landmark navigation unavailable.","Wrap primary content in <main>.");
    if (!root.querySelector("nav")) {
      const navish = root.querySelectorAll("div,ul").find(el =>
        /nav|menu|links/i.test(el.getAttribute("class") || "") && el.querySelectorAll("a").length >= 3);
      if (navish) add(snip(navish),"","1.3.1","Medium","D4",
        "Link group appears to be primary navigation but is not a <nav> landmark.","Use a semantic <nav> element.");
    }
  }
  // always-routed judgments, the non-automatable layer, by design
  routed.push(
    "Screen reader pass (D5): are elements announced sensibly and is the task completable?",
    "Keyboard pass (D5): reachability, visible focus in practice, logical order.",
    "Reading order and label comprehension in context (D3).",
    "Touch/click target sizes ≥ 24×24 px measured as rendered (2.5.8).",
    "Contrast verified against actual rendered backgrounds and images (1.4.3/1.4.11).");

  // suggested scores + gate
  const weight = { Critical: 3, High: 2, Medium: 1 };
  const dims = { D1: 5, D2: 5, D3: 5, D4: 5 };
  for (const f of findings) if (dims[f.dim] != null) dims[f.dim] = Math.max(1, dims[f.dim] - weight[f.sev]);
  const pats = new Set(findings.filter(f => f.pattern).map(f => f.pattern));
  const scores = { ...dims, D5: null, D6: pats.size === 0 ? 5 : Math.max(1, 5 - pats.size) };
  const criticals = findings.filter(f => f.sev === "Critical").length;
  return {
    engine: "AITL Scan v0.1 (automated layer)",
    gate: criticals ? "FAIL" : "PASS (automated layer, human evaluation still required)",
    criticals, findings, routed, suggestedScores: scores,
    note: "Automated detection covers the machine detectable layer of AITL only; contextual judgments are routed to human and assistive-technology-user review by design.",
  };
}
