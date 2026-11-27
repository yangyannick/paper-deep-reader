#!/usr/bin/env python3
"""Static quality-assurance checks for standalone paper-deep-reader HTML files (v1.3.0).

Checks:
  1. Unreplaced @@TOKEN@@ placeholders
  2. KaTeX math brace balance & unescaped '<' inside $...$ / $$...$$
  3. Duplicate DOM/SVG IDs
  4. Forbidden QA-scaffold noise / AI-cliche strings / render-blocking Google Fonts
  5. Raw markdown backticks in prose
  6. Figure zoom-button integrity, consecutive stacked figures, declarative stepper/view-switch/symbol checks
  7. Inline JavaScript syntax verification via `node --check` (when Node.js is available)
"""
import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from collections import Counter
from pathlib import Path

FORBIDDEN_NOISE = [
    "核验口径",
    "原文核验事实",
    "全量复核",
    "断言复核",
    "校验通过",
    "fonts.googleapis.com",
    "backdrop-filter",
]

AI_CLICHES = [
    "值得注意的是",
    "至关重要",
    "奠定了坚实基础",
    "深入探讨",
    "压了一个很硬的赌注",
    "架构赌注",
    "解剖台",
]


def main() -> None:
    ap = argparse.ArgumentParser(description="Run static QA on a paper-deep-reader HTML output.")
    ap.add_argument("html", help="Path to standalone HTML file.")
    ap.add_argument("--strict-cliches", action="store_true", help="Fail on AI-cliche warnings too.")
    args = ap.parse_args()

    html_path = Path(args.html).expanduser().resolve()
    text = html_path.read_text(encoding="utf-8")
    errors = []
    warnings = []

    # 1. Placeholders
    tokens = re.findall(r"@@[A-Z0-9_]+@@", text)
    if tokens:
        errors.append(f"Unreplaced placeholders: {sorted(set(tokens))}")

    # 2. Forbidden QA noise & performance anti-patterns
    for phrase in FORBIDDEN_NOISE:
        if phrase in text:
            errors.append(f"Forbidden noise or perf anti-pattern found: '{phrase}'")

    # 3. AI cliches
    for phrase in AI_CLICHES:
        if phrase in text:
            msg = f"AI cliche / whiteboard slang found: '{phrase}'"
            (errors if args.strict_cliches else warnings).append(msg)

    # 4. Duplicate IDs across DOM + SVGs (strip <script>/<style> and ignore data-*-id attrs)
    dom_only = re.sub(r"<script\b.*?</script>|<style\b.*?</style>", "", text, flags=re.S)
    all_ids = re.findall(r'(?<![\w-])id="([^"]+)"', dom_only)
    dups = {k: v for k, v in Counter(all_ids).items() if v > 1}
    if dups:
        errors.append(f"Duplicate DOM/SVG IDs ({len(dups)}): {list(dups.items())[:8]}")

    # 5. KaTeX math checks (strip script/style/svg/pre/code first)
    prose = re.sub(
        r"<script\b.*?</script>|<style\b.*?</style>|<svg\b.*?</svg>|<pre\b.*?</pre>|<code\b.*?</code>",
        "",
        text,
        flags=re.S,
    )
    disp = re.findall(r"\$\$(.+?)\$\$", prose, flags=re.S)
    prose_no_disp = re.sub(r"\$\$.+?\$\$", "", prose, flags=re.S)
    inl = re.findall(r"\$([^$\n]+?)\$", prose_no_disp)
    for eq in disp + inl:
        if eq.count("{") != eq.count("}"):
            errors.append(f"Unbalanced KaTeX braces: {eq[:80]}")
        if re.search(r"<[a-zA-Z0-9]", eq):
            errors.append(f"Unescaped '<' inside KaTeX (use &lt;): {eq[:80]}")

    # 6. Raw markdown backticks in visible prose
    visible = re.sub(r"<[^>]+>", " ", prose)
    if "`" in visible:
        warnings.append("Raw backtick (`) found in prose; use <code>...</code> instead.")

    # 6b. Figure integrity, consecutive stacked figures, declarative steppers & view switches
    for idx, fm in enumerate(re.finditer(r"<figure\b[^>]*>.*?</figure>", text, flags=re.S), start=1):
        block = fm.group(0)
        if "data-zoom-btn" in block and not re.search(r"<svg\b|<img\b", block):
            errors.append(f"Figure #{idx} has data-zoom-btn but no zoomable <svg> or <img> inside.")
        if re.search(r'\bfig-steps\b', block):
            has_notes = bool(re.search(r'<ol\b[^>]*class="[^"]*\bsteps-notes\b[^"]*"[^>]*>.*?<li\b', block, flags=re.S))
            has_steps = bool(re.search(r'\bdata-step="[^"]+"', block))
            if not has_notes:
                errors.append(f"Figure #{idx} uses .fig-steps but is missing <ol class=\"steps-notes\"><li>...</li></ol>.")
            if not has_steps:
                warnings.append(f"Figure #{idx} uses .fig-steps but has no [data-step] elements inside.")
        view_btns = set(re.findall(r'data-set-view="([^"]+)"', block))
        if view_btns:
            view_panels = set()
            for vp in re.findall(r'data-view-panel="([^"]+)"', block):
                view_panels.update(vp.strip().split())
            missing = sorted(view_btns - view_panels)
            if missing:
                errors.append(f"Figure #{idx} has data-set-view button(s) {missing} with no matching data-view-panel.")
            for ptag in re.findall(r'<[^>]*\bdata-view-panel="[^"]+"[^>]*>', block):
                has_inline_none = bool(
                    re.search(r'(?<![\w-])style=(["\'])(?:(?!\1).)*?\bdisplay\s*:\s*none\b', ptag, flags=re.I | re.S)
                )
                has_hidden_attr = bool(
                    re.search(r'(?<![\w-])hidden(?:\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+))?(?=[\s/>])', ptag, flags=re.I)
                )
                if has_inline_none or has_hidden_attr:
                    warnings.append(
                        f"Figure #{idx} [data-view-panel] has inline display:none or hidden; omit it and let widgets.js manage visibility."
                    )
                    break

    fig_parts = re.split(r"(<figure\b.*?</figure>)", text, flags=re.S)
    consec_figs = 0
    for i in range(1, len(fig_parts) - 2, 2):
        between = fig_parts[i + 1]
        if "<p" not in between and "<h" not in between and len(re.sub(r"\s+", "", between)) < 40:
            consec_figs += 1
    if consec_figs:
        warnings.append(
            f"Found {consec_figs} back-to-back <figure> transition(s) with no bridging prose; add transition/analysis paragraphs."
        )

    # 6c. Symbol hover integrity (data-sym should resolve to data-sym-def / data-sym-table or data-sym-tip)
    sym_refs = set(re.findall(r'\bdata-sym="([^"]+)"', prose))
    if sym_refs:
        has_sym_table = bool(re.search(r'\bdata-sym-table\b|\bdata-sym-def=', text))
        for tag_m in re.finditer(r'<[^>]*\bdata-sym="([^"]+)"[^>]*>', prose):
            tag = tag_m.group(0)
            if not has_sym_table and "data-sym-tip=" not in tag:
                warnings.append(f"Symbol ref data-sym=\"{tag_m.group(1)}\" has no data-sym-table/data-sym-def or data-sym-tip.")
                break

    # 6d. Sidebar TOC link integrity
    if re.search(r'class="[^"]*\bsidebar\b[^"]*"', dom_only) and not re.search(r'id="toc-list"|class="[^"]*\btoc-list\b[^"]*"', dom_only):
        warnings.append("Sidebar found without #toc-list / .toc-list; collapsible figure/equation drawers will not attach.")

    # 7. Inline JS syntax via node --check
    scripts = re.findall(r"<script(?:\s+[^>]*)?>(.*?)</script>", text, flags=re.S)
    inline_js = [s for s in scripts if s.strip()]
    node_bin = shutil.which("node")
    js_status = "none" if not inline_js else "skipped (node not found)"
    if inline_js and node_bin:
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as tf:
            tf.write("\n;\n".join(inline_js))
            tmp_js = Path(tf.name)
        try:
            res = subprocess.run([node_bin, "--check", str(tmp_js)], capture_output=True, text=True)
            if res.returncode != 0:
                errors.append(f"Inline JS syntax error: {res.stderr.strip()}")
                js_status = "FAIL"
            else:
                js_status = f"OK ({len(inline_js)} blocks)"
        finally:
            tmp_js.unlink(missing_ok=True)

    print(
        f"FILE: {html_path.name} ({len(text.encode('utf-8')):,} B) | "
        f"Math: {len(disp)} display + {len(inl)} inline | IDs: {len(all_ids)} | JS: {js_status}"
    )
    for w in warnings:
        print(f"  WARN: {w}")
    for e in errors:
        print(f"  FAIL: {e}")

    if errors:
        sys.exit(1)
    print("QA_STATIC_PASSED")


if __name__ == "__main__":
    main()
