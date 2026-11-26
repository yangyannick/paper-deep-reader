#!/usr/bin/env python3
"""Cross-platform Headless Chrome / Chromium / Edge visual QA screenshot slicer.

Usage:
  python scripts/qa_browser_shots.py --html output/paper.html --out workdir/qa_shots --width 1440
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from PIL import Image


def find_browser() -> str | None:
    candidates = [
        shutil.which("google-chrome"),
        shutil.which("chromium"),
        shutil.which("chromium-browser"),
        shutil.which("chrome"),
        shutil.which("msedge"),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ]
    for c in candidates:
        if c and Path(c).exists():
            return c
    return None


def main() -> None:
    ap = argparse.ArgumentParser(description="Capture 1440px full-page slices via headless browser.")
    ap.add_argument("--html", required=True, help="Path to standalone HTML file.")
    ap.add_argument("--out", required=True, help="Directory to write QA PNG slices.")
    ap.add_argument("--width", type=int, default=1440, help="Viewport width (default: 1440).")
    ap.add_argument("--max-height", type=int, default=14500, help="Capture canvas height (default: 14500).")
    ap.add_argument("--slice-height", type=int, default=1600, help="Per-slice height in px (default: 1600).")
    ap.add_argument("--wait-ms", type=int, default=15000, help="Virtual time budget in ms (default: 15000).")
    ap.add_argument(
        "--skip-katex-check",
        action="store_true",
        help="Skip headless DOM check for KaTeX CDN load status.",
    )
    args = ap.parse_args()

    browser = find_browser()
    if not browser:
        print("QA_BROWSER_SKIPPED: No local Chrome, Chromium, or Edge executable found.")
        sys.exit(0)

    html_path = Path(args.html).expanduser().resolve()
    out_dir = Path(args.out).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    url = html_path.as_uri()
    full_png = out_dir / "full_page.png"
    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--virtual-time-budget={args.wait_ms}",
        f"--window-size={args.width},{args.max_height}",
        f"--screenshot={full_png}",
        url,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=75)
    if res.returncode != 0 or not full_png.exists():
        print(f"QA_BROWSER_FAILED (exit={res.returncode}): {res.stderr[:400]}")
        sys.exit(1)

    img = Image.open(full_png)
    w, h = img.size
    saved = 0
    for idx, y0 in enumerate(range(0, h, args.slice_height), start=1):
        y1 = min(y0 + args.slice_height, h)
        crop = img.crop((0, y0, w, y1))
        lo, hi = crop.convert("L").getextrema()
        if lo == hi and idx > 1:
            break
        out_p = out_dir / f"panel_{idx:02d}.png"
        crop.save(out_p)
        saved += 1

    katex_note = ""
    if not args.skip_katex_check:
        src_txt = html_path.read_text(encoding="utf-8", errors="ignore")
        prose_only = re.sub(
            r"<script\b.*?</script>|<style\b.*?</style>|<svg\b.*?</svg>|<pre\b.*?</pre>|<code\b.*?</code>",
            "",
            src_txt,
            flags=re.S,
        )
        has_math = bool(re.search(r"\$\$[^$]+\$\$|\$[^$\n]+\$", prose_only))
        if has_math:
            dom_cmd = [
                browser,
                "--headless=new",
                "--disable-gpu",
                f"--virtual-time-budget={args.wait_ms}",
                "--dump-dom",
                url,
            ]
            try:
                dom_res = subprocess.run(dom_cmd, capture_output=True, text=True, timeout=45, encoding="utf-8", errors="replace")
                dom_txt = dom_res.stdout or ""
                katex_spans = len(re.findall(r'class="katex"', dom_txt))
                if katex_spans == 0:
                    katex_note = " | WARN: KATEX_CDN_TIMEOUT (0 rendered spans — CDN likely stalled in headless mode; check network/proxy or increase --wait-ms before editing LaTeX)"
                else:
                    katex_note = f" | katex_spans={katex_spans}"
            except Exception:
                katex_note = " | katex_check=skipped"

    print(f"QA_BROWSER_OK | browser={os.path.basename(browser)} | slices={saved}{katex_note} -> {out_dir}")


if __name__ == "__main__":
    main()
