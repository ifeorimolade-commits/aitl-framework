#!/usr/bin/env python3
"""AITL Corpus Study 1: analysis script (standard library only).

Reads the human coding sheets, the generation log and the automated outputs,
and writes study/results/summary.md plus machine readable tables.
Every number in the study report should come from this script so the
analysis can be rerun by anyone from the published data.

Usage (from the repo root):  python3 study/scripts/summarize.py
Ifeoluwa Orimolade, 2026. CC BY 4.0
"""
import csv, glob, json, os, itertools
from collections import defaultdict

STUDY = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
D = lambda *p: os.path.join(STUDY, *p)
PATTERNS = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"]
NAMES = {"P1": "Placeholder only labeling", "P2": "divAsButton", "P3": "Generic or hallucinated alt text",
         "P4": "Visual only structure", "P5": "Color only state", "P6": "Suppressed focus",
         "P7": "Low contrast default aesthetics", "P8": "Decorative ARIA misuse"}
DIMS = ["D1", "D2", "D3", "D4", "D5", "D6"]
PRIMARY = "ife"

# Pre registered mapping from each pattern to the axe-core rule ids (and the
# Lighthouse audit ids, which share axe ids) that would count as that tool
# "detecting" the pattern at the interface level. Do not edit after data
# collection; record any change as a deviation in PROTOCOL.md.
AXE_MAP = {
    "P1": {"label", "label-title-only", "label-content-name-mismatch", "select-name", "input-button-name"},
    "P2": {"button-name", "nested-interactive", "scrollable-region-focusable"},
    "P3": {"image-alt", "image-redundant-alt", "role-img-alt", "svg-img-alt", "input-image-alt"},
    "P4": {"page-has-heading-one", "heading-order", "empty-heading", "landmark-one-main", "region", "list", "listitem"},
    "P5": {"link-in-text-block"},
    "P6": set(),
    "P7": {"color-contrast", "color-contrast-enhanced"},
    "P8": {"aria-hidden-focus", "presentation-role-conflict", "aria-hidden-body"},
}

def read(path):
    if not os.path.exists(path):
        return []
    with open(path, newline="", encoding="utf-8-sig") as f:
        return [{k.strip(): (v or "").strip() for k, v in r.items()} for r in csv.DictReader(f)]

def yes(v):
    return v.strip().upper() in ("Y", "YES", "1", "TRUE")

def pct(n, d):
    return "n/a" if d == 0 else f"{n}/{d} ({100*n/d:.0f}%)"

def kappa(a, b):
    """Cohen's kappa for two equal length binary lists."""
    n = len(a)
    if n == 0:
        return None
    po = sum(x == y for x, y in zip(a, b)) / n
    pa, pb = sum(a) / n, sum(b) / n
    pe = pa * pb + (1 - pa) * (1 - pb)
    return None if pe == 1 else (po - pe) / (1 - pe)

def fleiss(matrix):
    """Fleiss' kappa. matrix: list of items, each a list of 0/1 ratings."""
    if not matrix:
        return None
    n = len(matrix[0])
    if n < 2 or any(len(r) != n for r in matrix):
        return None
    N = len(matrix)
    P = []
    p1 = 0
    for r in matrix:
        c1 = sum(r); c0 = n - c1; p1 += c1
        P.append((c1 * (c1 - 1) + c0 * (c0 - 1)) / (n * (n - 1)))
    pbar = sum(P) / N
    pj1 = p1 / (N * n)
    pe = pj1 ** 2 + (1 - pj1) ** 2
    return None if pe == 1 else (pbar - pe) / (1 - pe)

fmt = lambda k: "n/a" if k is None else f"{k:.2f}"

# ---------------- load ----------------
gen = {r["interface_id"]: r for r in read(D("data", "generation_log.csv")) if r.get("interface_id")}
# Rater sheets use the neutral labels R1, R2, R3; translate them back.
RKEY = {r["rater_label"]: r["interface_id"] for r in read(D("data", "rater_key.csv")) if r.get("rater_label")}
def rid(v):
    return RKEY.get(v, v)
coding = defaultdict(dict)   # coder -> (iid, P) -> row
scores = defaultdict(dict)   # coder -> iid -> row
for f in glob.glob(D("data", "coding_*.csv")):
    coder = os.path.basename(f)[len("coding_"):-4]
    for r in read(f):
        if r.get("interface_id") and r.get("pattern") in PATTERNS and r.get("present"):
            coding[coder][(rid(r["interface_id"]), r["pattern"])] = r
for f in glob.glob(D("data", "scores_*.csv")):
    coder = os.path.basename(f)[len("scores_"):-4]
    for r in read(f):
        if r.get("interface_id") and r.get("D1"):
            scores[coder][rid(r["interface_id"])] = r
auto = {r["interface_id"]: r for r in read(D("results", "automated_summary.csv"))}
lh = {r["interface_id"]: r for r in read(D("results", "lighthouse_scores.csv"))}
axe_rules = {}
for f in glob.glob(D("results", "axe", "*.json")):
    j = json.load(open(f))
    axe_rules[os.path.basename(f)[:-5]] = {v["id"] for v in j.get("violations", [])}
unclassified = read(D("data", "unclassified_defects.csv"))

prim = coding.get(PRIMARY, {})
ids = sorted({iid for (iid, _) in prim} | set(gen))
ids = [i for i in ids if not i.startswith("PILOT")]
condA = [i for i in ids if gen.get(i, {}).get("condition", "A") == "A"]
condB = [i for i in ids if gen.get(i, {}).get("condition") == "B"]
tools = sorted({gen[i]["tool"] for i in ids if i in gen})

out = []
w = out.append
w("# AITL Corpus Study 1, results summary\n")
w("Generated by `study/scripts/summarize.py` from the files in `study/data` and `study/results`. "
  "Primary coder: the author. Counts are interface level unless stated. This is an exploratory "
  "pilot with a small corpus; percentages describe this corpus only and are not population estimates.\n")

# ---------------- Table 1: corpus ----------------
w("## 1. Corpus\n")
w("| Interface | Tool | Model or version shown | Component | Condition | Generated (local time) |")
w("|---|---|---|---|---|---|")
for i in ids:
    g = gen.get(i, {})
    w(f"| {i} | {g.get('tool','')} | {g.get('model_version','')} | {g.get('component','')} | {g.get('condition','')} | {g.get('generated_at','')} |")
w("")

# ---------------- Table 2: prevalence ----------------
w("## 2. Prevalence of each pattern (Condition A, default prompts)\n")
head = "| Pattern | All tools | " + " | ".join(tools) + " |"
w(head); w("|" + "---|" * (2 + len(tools)))
prev_rows = []
for p in PATTERNS:
    coded = [i for i in condA if (i, p) in prim]
    pres = [i for i in coded if yes(prim[(i, p)]["present"])]
    cells = [pct(len(pres), len(coded))]
    for t in tools:
        ct = [i for i in coded if gen.get(i, {}).get("tool") == t]
        cells.append(pct(len([i for i in ct if i in pres]), len(ct)))
    w(f"| {p} {NAMES[p]} | " + " | ".join(cells) + " |")
    prev_rows.append({"pattern": p, "present": len(pres), "coded": len(coded)})
anyp = [i for i in condA if any((i, p) in prim and yes(prim[(i, p)]["present"]) for p in PATTERNS)]
w(f"\nInterfaces with at least one pattern present: {pct(len(anyp), len(condA))}.")
counts = [sum(1 for p in PATTERNS if (i, p) in prim and yes(prim[(i, p)]["present"])) for i in condA]
if counts:
    w(f"Distinct patterns per interface: min {min(counts)}, median {sorted(counts)[len(counts)//2]}, max {max(counts)}.\n")

# ---------------- Table 3: detection ----------------
w("## 3. Which tool detected the human coded patterns\n")
w("For every interface and pattern the primary coder marked present, did each automated tool flag it? "
  "AITL automated = the frozen v0.1 engine on the rendered DOM. axe and Lighthouse use the pre registered rule mapping in this script. "
  "This measures detection at the interface level, not element level.\n")
w("| Pattern | Coded present | AITL automated | axe-core | Lighthouse |")
w("|---|---|---|---|---|")
det_rows = []
tot = {"n": 0, "aitl": 0, "axe": 0, "lh": 0}
for p in PATTERNS:
    pres = [i for i in ids if (i, p) in prim and yes(prim[(i, p)]["present"])]
    a = sum(1 for i in pres if p in auto.get(i, {}).get("aitl_rendered_patterns", "").split())
    x = sum(1 for i in pres if axe_rules.get(i, set()) & AXE_MAP[p])
    l = sum(1 for i in pres if set(lh.get(i, {}).get("failed_audits", "").split()) & AXE_MAP[p])
    w(f"| {p} {NAMES[p]} | {len(pres)} | {pct(a, len(pres))} | {pct(x, len(pres))} | {pct(l, len(pres))} |")
    det_rows.append({"pattern": p, "coded_present": len(pres), "aitl": a, "axe": x, "lighthouse": l})
    tot["n"] += len(pres); tot["aitl"] += a; tot["axe"] += x; tot["lh"] += l
w(f"| **All patterns** | {tot['n']} | {pct(tot['aitl'], tot['n'])} | {pct(tot['axe'], tot['n'])} | {pct(tot['lh'], tot['n'])} |\n")

fp = [(i, p) for i in ids for p in PATTERNS
      if p in auto.get(i, {}).get("aitl_rendered_patterns", "").split() and (i, p) in prim and not yes(prim[(i, p)]["present"])]
w(f"AITL automated flags the primary coder judged absent (false positives): {len(fp)}" + (": " + ", ".join(f"{i} {p}" for i, p in fp) if fp else "") + ".\n")

# ---------------- Table 4: gate vs Lighthouse ----------------
w("## 4. Human release gate compared with the Lighthouse accessibility score\n")
w("| Interface | Human gate | Critical findings | Keyboard task completable | Screen reader task completable | Lighthouse score |")
w("|---|---|---|---|---|---|")
ps = scores.get(PRIMARY, {})
hi_but_fail = 0
for i in ids:
    s = ps.get(i, {})
    score = lh.get(i, {}).get("a11y_score", "")
    if s.get("gate", "").upper() == "FAIL" and score.isdigit() and int(score) >= 90:
        hi_but_fail += 1
    w(f"| {i} | {s.get('gate','')} | {s.get('criticals','')} | {s.get('kb_task_complete','')} | {s.get('sr_task_complete','')} | {score} |")
nfail = sum(1 for i in ids if ps.get(i, {}).get("gate", "").upper() == "FAIL")
w(f"\nInterfaces that fail the human gate: {pct(nfail, len([i for i in ids if i in ps]))}. "
  f"Of those, scored 90 or higher by Lighthouse: {hi_but_fail}.\n")

# ---------------- Table 5: condition B and condition M ----------------
TITLES = {"B": "Condition B, the same prompt with an accessibility request added",
          "M": "Condition M, Claude generating with the AITL MCP server in the loop"}
for cond in ("B", "M"):
    group = [i for i in ids if gen.get(i, {}).get("condition") == cond]
    if not group:
        continue
    w(f"## 5{'a' if cond == 'B' else 'b'}. {TITLES[cond]}\n")
    w("| Interface | Matched Condition A interface | Patterns present (A) | Patterns present (" + cond + ") | Gate (A) | Gate (" + cond + ") | Lighthouse (A) | Lighthouse (" + cond + ") |")
    w("|---|---|---|---|---|---|---|---|")
    for b in group:
        g = gen[b]
        a = next((i for i in condA if gen.get(i, {}).get("tool") == g["tool"] and gen.get(i, {}).get("component") == g["component"]), "")
        pa = " ".join(p for p in PATTERNS if (a, p) in prim and yes(prim[(a, p)]["present"])) or "none"
        pb = " ".join(p for p in PATTERNS if (b, p) in prim and yes(prim[(b, p)]["present"])) or "none"
        w(f"| {b} | {a} | {pa} | {pb} | {ps.get(a,{}).get('gate','')} | {ps.get(b,{}).get('gate','')} | {lh.get(a,{}).get('a11y_score','')} | {lh.get(b,{}).get('a11y_score','')} |")
    w("")
    if cond == "M":
        ev = [r for r in read(D("data", "mcp_loop_log.csv")) if r.get("interface_id")]
        if ev:
            w("| Interface | Scan calls | First gate | Final gate | Final automated patterns | Fixes that satisfy the scanner but not the pattern definition |")
            w("|---|---|---|---|---|---|")
            for r in ev:
                w(f"| {r['interface_id']} | {r.get('scan_calls','')} | {r.get('first_gate','')} | {r.get('final_gate','')} | {r.get('final_automated_patterns','')} | {r.get('scanner_evasions','')} |")
            w("")

# ---------------- Table 6: agreement ----------------
others = [c for c in coding if c != PRIMARY]
if others:
    w("## 6. Preliminary inter rater agreement\n")
    w("Agreement on pattern presence (Y or N) across the interfaces each pair coded in common. "
      "With this few items the kappa values are unstable and are reported only as a first look.\n")
    w("| Pair | Shared decisions | Percent agreement | Cohen's kappa |")
    w("|---|---|---|---|")
    coders = [PRIMARY] + sorted(others)
    for c1, c2 in itertools.combinations(coders, 2):
        keys = sorted(set(coding[c1]) & set(coding[c2]))
        a = [1 if yes(coding[c1][k]["present"]) else 0 for k in keys]
        b = [1 if yes(coding[c2][k]["present"]) else 0 for k in keys]
        agree = sum(x == y for x, y in zip(a, b))
        w(f"| {c1} and {c2} | {len(keys)} | {pct(agree, len(keys))} | {fmt(kappa(a, b))} |")
    common = set.intersection(*[set(coding[c]) for c in coders]) if len(coders) > 2 else set()
    if common:
        m = [[1 if yes(coding[c][k]["present"]) else 0 for c in coders] for k in sorted(common)]
        w(f"\nFleiss' kappa across all {len(coders)} coders on {len(common)} shared decisions: {fmt(fleiss(m))}.\n")
    w("Dimension scores (0 to 5): exact agreement and agreement within one point.\n")
    w("| Pair | Shared scores | Exact | Within one point |")
    w("|---|---|---|---|")
    for c1, c2 in itertools.combinations(coders, 2):
        pairs = []
        for i in set(scores.get(c1, {})) & set(scores.get(c2, {})):
            for d in DIMS:
                x, y = scores[c1][i].get(d, ""), scores[c2][i].get(d, "")
                if x.isdigit() and y.isdigit() and x != "0" and y != "0":
                    pairs.append((int(x), int(y)))
        ex = sum(1 for x, y in pairs if x == y)
        w1 = sum(1 for x, y in pairs if abs(x - y) <= 1)
        w(f"| {c1} and {c2} | {len(pairs)} | {pct(ex, len(pairs))} | {pct(w1, len(pairs))} |")
    w("")

# ---------------- Table 7: unclassified ----------------
w("## 7. Defects outside the eight patterns\n")
if unclassified:
    w(f"{len(unclassified)} defects were logged that did not fit P1 to P8. These are candidates for taxonomy v0.2, "
      "not additions; a candidate needs to recur across tools before it is proposed.\n")
    w("| Interface | Description | WCAG | Severity | Seen in other interfaces |")
    w("|---|---|---|---|---|")
    for r in unclassified:
        w(f"| {r.get('interface_id','')} | {r.get('description','')} | {r.get('wcag','')} | {r.get('severity','')} | {r.get('also_seen_in','')} |")
else:
    w("None logged.")
w("")

os.makedirs(D("results"), exist_ok=True)
open(D("results", "summary.md"), "w").write("\n".join(out) + "\n")
for name, rows in (("prevalence.csv", prev_rows), ("detection.csv", det_rows)):
    if rows:
        with open(D("results", name), "w", newline="") as f:
            wr = csv.DictWriter(f, fieldnames=list(rows[0])); wr.writeheader(); wr.writerows(rows)
print("Wrote study/results/summary.md, prevalence.csv, detection.csv")
