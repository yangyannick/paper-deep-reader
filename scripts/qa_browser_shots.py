#!/usr/bin/env python3
"""Cross-platform Headless Chrome / Chromium / Edge visual QA slicer & DOM geometric auditor (v1.4.0).

Checks automatically during the headless DOM pass (inspired by visual-explainer's look.mjs):
  1. Runtime JavaScript errors & unhandled promise rejections
  2. Horizontal page overflow (scrollWidth > innerWidth)
  3. Broken <img> elements (naturalWidth === 0)
  4. KaTeX render count & .katex-error spans
  5. Hand-drawn diagram SVG (.diag-svg) geometry:
     - Overlapping text labels (ink-box trimmed 22% top/bottom to avoid false positives)
     - Clipped text extending outside the SVG bounding box
     - Unreadably tiny rendered text (< 7.8px)

Usage:
  python scripts/qa_browser_shots.py --html output/paper.html --out workdir/qa_shots --width 1440
"""
import argparse
import html as html_lib
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path
from PIL import Image

AUDIT_PROBE_JS = r"""
<script data-pdr-qa-probe>
(function() {
  var errs = [];
  window.addEventListener('error', function(e) {
    errs.push((e && e.message) ? String(e.message) : 'Script error');
  });
  window.addEventListener('unhandledrejection', function(e) {
    errs.push('PromiseRejection: ' + String(e && e.reason || 'unknown'));
  });
  function runAudit() {
    var report = {
      js_errors: errs.slice(0, 8),
      overflow_px: Math.max(0, Math.round(document.documentElement.scrollWidth - window.innerWidth)),
      overflow_culprit: '',
      broken_imgs: [],
      katex_spans: document.querySelectorAll('.katex').length,
      katex_errors: document.querySelectorAll('.katex-error').length,
      scroll_height: Math.max(
        document.documentElement.scrollHeight || 0,
        document.body ? document.body.scrollHeight : 0
      ),
      svg_overlaps: [],
      svg_clipped: [],
      svg_tiny_text: []
    };
    if (report.overflow_px > 2) {
      var vw = window.innerWidth;
      var els = document.querySelectorAll('body *');
      for (var i = 0; i < els.length; i++) {
        var r = els[i].getBoundingClientRect();
        if (r.right > vw + 4 && r.width > 0 && r.height > 0) {
          var tag = els[i].tagName.toLowerCase();
          var cls = (typeof els[i].className === 'string' && els[i].className.trim())
            ? '.' + els[i].className.trim().split(/\s+/).slice(0, 2).join('.')
            : '';
          report.overflow_culprit = tag + (els[i].id ? '#' + els[i].id : '') + cls + ' (+' + Math.round(r.right - vw) + 'px)';
          break;
        }
      }
    }
    var imgs = document.querySelectorAll('img');
    for (var j = 0; j < imgs.length; j++) {
      if (imgs[j].complete && imgs[j].naturalWidth === 0) {
        report.broken_imgs.push(imgs[j].getAttribute('alt') || (imgs[j].getAttribute('src') || '').slice(0, 48));
      }
    }
    // Audit hand-drawn semantic diagrams (.diag-svg) only (Matplotlib SVGs are inspected directly as PNGs)
    var svgs = document.querySelectorAll('main svg.diag-svg, .article-main svg.diag-svg, figure svg.diag-svg');
    var seenSvgs = new Set();
    for (var s = 0; s < svgs.length; s++) {
      var svg = svgs[s];
      if (seenSvgs.has(svg)) continue;
      seenSvgs.add(svg);
      var texts = Array.from(svg.querySelectorAll('text')).filter(function(t) {
        if (!t.textContent || !t.textContent.trim()) return false;
        if (t.closest('defs, clipPath, marker, symbol, .is-view-hidden')) return false;
        var cs = getComputedStyle(t);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
        var b = t.getBoundingClientRect();
        return b.width > 1 && b.height > 1;
      });
      if (!texts.length) continue;

      var fig = svg.closest('figure');
      var figTitle = fig && fig.querySelector('.fig-title')
        ? fig.querySelector('.fig-title').textContent.trim().slice(0, 32)
        : ('SVG#' + (s + 1));
      var sr = svg.getBoundingClientRect();

      var boxes = [];
      for (var k = 0; k < texts.length; k++) {
        var t = texts[k];
        var txt = t.textContent.replace(/\s+/g, ' ').trim().slice(0, 26);
        var cs = getComputedStyle(t);
        var m = t.getScreenCTM ? t.getScreenCTM() : null;
        var scale = m ? Math.hypot(m.a, m.b) : 1;
        var px = parseFloat(cs.fontSize) * (scale > 0 ? scale : 1);
        if (px > 0 && px < 7.8 && report.svg_tiny_text.length < 6) {
          report.svg_tiny_text.push(figTitle + ': "' + txt + '" (' + px.toFixed(1) + 'px)');
        }
        var br = t.getBoundingClientRect();
        if (sr.width > 20 && (br.left < sr.left - 6 || br.right > sr.right + 6 || br.top < sr.top - 6 || br.bottom > sr.bottom + 6)) {
          if (report.svg_clipped.length < 6) {
            report.svg_clipped.push(figTitle + ': "' + txt + '" extends outside SVG box');
          }
        }
        // Trim 22% em-box vertical padding (matches visual-explainer look.mjs) to avoid false overlaps
        var dy = br.height * 0.22;
        boxes.push({
          txt: txt,
          l: br.left + 1,
          r: br.right - 1,
          t: br.top + dy,
          b: br.bottom - dy
        });
      }
      for (var a = 0; a < boxes.length; a++) {
        for (var b = a + 1; b < boxes.length; b++) {
          var A = boxes[a], B = boxes[b];
          var ow = Math.min(A.r, B.r) - Math.max(A.l, B.l);
          var oh = Math.min(A.b, B.b) - Math.max(A.t, B.t);
          if (ow > 2 && oh > 2) {
            if (report.svg_overlaps.length < 6) {
              report.svg_overlaps.push(figTitle + ': "' + A.txt + '" overlaps "' + B.txt + '"');
            }
          }
        }
      }
    }
    document.documentElement.dataset.pdrQaReport = JSON.stringify(report);
  }
  window.addEventListener('load', function() { setTimeout(runAudit, 180); });
})();
</script>
"""


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
    ap = argparse.ArgumentParser(description="Capture 1440px full-page slices & run DOM geometric audit.")
    ap.add_argument("html_pos", nargs="?", help="Optional positional path to standalone HTML file.")
    ap.add_argument("out_pos", nargs="?", help="Optional positional directory to write QA PNG slices.")
    ap.add_argument("--html", dest="html_opt", help="Path to standalone HTML file.")
    ap.add_argument("--out", dest="out_opt", help="Directory to write QA PNG slices.")
    ap.add_argument("--width", type=int, default=1440, help="Viewport width (default: 1440).")
    ap.add_argument(
        "--max-height",
        type=int,
        default=0,
        help="Capture canvas height in px (default: 0 = auto-fit full page scrollHeight up to 28000px).",
    )
    ap.add_argument("--slice-height", type=int, default=2500, help="Per-slice height in px (default: 2500).")
    ap.add_argument("--wait-ms", type=int, default=8000, help="CDN KaTeX warmup budget in ms (default: 8000).")
    ap.add_argument("--skip-katex-check", action="store_true", help="Skip KaTeX CDN render check.")
    ap.add_argument("--skip-audit", action="store_true", help="Skip headless DOM geometric & JS runtime audit.")
    args = ap.parse_args()

    html_arg = args.html_opt or args.html_pos
    out_arg = args.out_opt or args.out_pos
    if not html_arg or not out_arg:
        ap.error("provide --html HTML --out OUT (or positional HTML OUT)")

    browser = find_browser()
    if not browser:
        print("QA_BROWSER_SKIPPED: No local Chrome, Chromium, or Edge executable found.")
        sys.exit(0)

    html_path = Path(html_arg).expanduser().resolve()
    out_dir = Path(out_arg).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    url = html_path.as_uri()
    full_png = out_dir / "full_page.png"
    profile_dir = out_dir / "_chrome_profile"
    profile_dir.mkdir(parents=True, exist_ok=True)
    probe_html = out_dir / "_qa_probe.html"
    base_flags = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-crash-reporter",
        "--disable-background-networking",
        f"--user-data-dir={profile_dir}",
    ]

    try:
        src_txt = html_path.read_text(encoding="utf-8", errors="ignore")
        is_offline_katex = "data-katex-offline" in src_txt
        prose_only = re.sub(
            r"<script\b.*?</script>|<style\b.*?</style>|<svg\b.*?</svg>|<pre\b.*?</pre>|<code\b.*?</code>",
            "",
            src_txt,
            flags=re.S,
        )
        has_math = bool(re.search(r"\$\$[^$]+\$\$|\$[^$\n]+\$", prose_only))

        katex_note = ""
        audit_issues: list[str] = []
        audit_warns: list[str] = []
        detected_height = 0

        # 1. Automated DOM Geometric & Runtime Audit (also warms CDN KaTeX cache before screenshot!)
        if not args.skip_audit:
            base_href = html_path.parent.as_uri().rstrip("/") + "/"
            probe_inject = f'<base href="{html_lib.escape(base_href, quote=True)}">' + AUDIT_PROBE_JS
            if re.search(r"<head\b[^>]*>", src_txt, flags=re.I):
                probed = re.sub(
                    r"(<head\b[^>]*>)",
                    lambda m: m.group(1) + probe_inject,
                    src_txt,
                    count=1,
                    flags=re.I,
                )
            else:
                probed = probe_inject + src_txt
            probe_html.write_text(probed, encoding="utf-8")
            audit_budget = 2200 if (is_offline_katex or not has_math) else args.wait_ms
            dom_cmd = [
                *base_flags,
                f"--window-size={args.width},2600",
                f"--virtual-time-budget={audit_budget}",
                "--dump-dom",
                probe_html.as_uri(),
            ]
            try:
                dom_res = subprocess.run(
                    dom_cmd,
                    capture_output=True,
                    text=True,
                    timeout=50,
                    encoding="utf-8",
                    errors="replace",
                )
                dom_txt = dom_res.stdout or ""
                m = re.search(r'data-pdr-qa-report="([^"]+)"', dom_txt)
                if m:
                    rep = json.loads(html_lib.unescape(m.group(1)))
                    detected_height = int(rep.get("scroll_height") or 0)
                    for je in rep.get("js_errors", []):
                        audit_issues.append(f"JS runtime error: {je}")
                    if rep.get("overflow_px", 0) > 2:
                        audit_issues.append(
                            f"Horizontal overflow +{rep['overflow_px']}px ({rep.get('overflow_culprit', '')})"
                        )
                    for bi in rep.get("broken_imgs", []):
                        audit_issues.append(f"Broken <img> (naturalWidth=0): {bi}")
                    for ov in rep.get("svg_overlaps", []):
                        audit_issues.append(f"SVG text overlap: {ov}")
                    for cl in rep.get("svg_clipped", []):
                        audit_warns.append(f"SVG text clipped: {cl}")
                    for tn in rep.get("svg_tiny_text", []):
                        audit_warns.append(f"SVG tiny label (<7.8px): {tn}")
                    if rep.get("katex_errors", 0) > 0:
                        audit_issues.append(f"KaTeX render errors (.katex-error): {rep['katex_errors']}")
                    k_spans = rep.get("katex_spans", 0)
                    if has_math and not args.skip_katex_check:
                        if k_spans == 0:
                            audit_warns.append(
                                "KATEX_CDN_TIMEOUT (0 rendered spans — check network/proxy, use --offline-katex, or increase --wait-ms)"
                            )
                        else:
                            katex_note = f" | katex_spans={k_spans}" + ("(offline)" if is_offline_katex else "")
                else:
                    audit_warns.append("DOM audit probe did not finish within budget")
            except Exception as exc:
                audit_warns.append(f"DOM audit skipped: {exc}")

        # 2. Capture full-page 1440px screenshot using the same warmed profile
        if args.max_height > 0:
            capture_height = args.max_height
        elif detected_height > 0:
            capture_height = min(max(detected_height + 160, 2500), 28000)
        else:
            capture_height = 22000
        shot_budget = 2200 if (is_offline_katex or not has_math) else (2800 if not args.skip_audit else args.wait_ms)
        cmd = [
            *base_flags,
            f"--virtual-time-budget={shot_budget}",
            "--hide-scrollbars",
            f"--window-size={args.width},{capture_height}",
            f"--screenshot={full_png}",
            url,
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
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

        audit_tag = (
            f" | audit=PASS"
            if (not args.skip_audit and not audit_issues)
            else (f" | audit={len(audit_issues)} issue(s)" if not args.skip_audit else "")
        )
        print(
            f"QA_BROWSER_OK | browser={os.path.basename(browser)} | height={h}px | slices={saved}{katex_note}{audit_tag} -> {out_dir}"
        )
        for wmsg in audit_warns:
            print(f"  WARN: {wmsg}")
        for imsg in audit_issues:
            print(f"  ISSUE: {imsg}")
    finally:
        probe_html.unlink(missing_ok=True)
        for _ in range(4):
            shutil.rmtree(profile_dir, ignore_errors=True)
            if not profile_dir.exists():
                break
            time.sleep(0.3)


if __name__ == "__main__":
    main()
