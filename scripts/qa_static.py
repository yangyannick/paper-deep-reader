#!/usr/bin/env python3
"""Static quality-assurance checks for standalone paper-deep-reader HTML files.

Checks:
  1. Unreplaced @@TOKEN@@ placeholders
  2. KaTeX math brace balance & unescaped '<' inside $...$ / $$...$$
  3. Duplicate DOM/SVG IDs
  4. Forbidden QA-scaffold noise / AI-cliche strings / render-blocking Google Fonts
  5. Raw markdown backticks in prose
  6. Inline JavaScript syntax verification via `node --check` (when Node.js is available)
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

    # 4. Duplicate IDs across DOM + SVGs
    all_ids = re.findall(r'\bid="([^"]+)"', text)
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

    # 7. Inline JS syntax via node --check
    scripts = re.findall(r"<script(?:\s+[^>]*)?>(.*?)</script>", text, flags=re.S)
    inline_js = [s for s in scripts if s.strip()]
    node_bin = shutil.which("node")
    js_status = "skipped (node not found)"
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
