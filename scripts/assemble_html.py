#!/usr/bin/env python3
"""Assemble a self-contained single-file HTML monograph from body HTML, SVGs, and skill assets.

Usage:
  python scripts/assemble_html.py \
    --title "Paper Title — Deep Reading" \
    --body workdir/body.html \
    --out output/paper-deep-read.html \
    --svg SVG_PLOT1=workdir/plot1.svg \
    --svg SVG_PLOT2=workdir/plot2.svg \
    --extra-js workdir/custom_widgets.js \
    [--offline-katex]
"""
import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
import html
import re
import time
import urllib.request
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = SKILL_ROOT / "assets"
KATEX_VERSION = "0.16.11"
KATEX_CDN = f"https://cdn.jsdelivr.net/npm/katex@{KATEX_VERSION}/dist"
KATEX_MIRRORS = [
    f"https://cdn.jsdelivr.net/npm/katex@{KATEX_VERSION}/dist",
    f"https://unpkg.com/katex@{KATEX_VERSION}/dist",
    f"https://cdnjs.cloudflare.com/ajax/libs/KaTeX/{KATEX_VERSION}",
]
DEFAULT_KATEX_CACHE = Path.home() / ".cache" / "paper-deep-reader" / f"katex-{KATEX_VERSION}"

AUTO_RENDER_CALL = (
    "renderMathInElement(document.body, {"
    "delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],"
    "ignoredTags:['script','noscript','style','textarea','pre','code','svg'],"
    "throwOnError:false});"
)


def clean_and_prefix_svg(svg_text: str, prefix: str) -> str:
    if "<svg" in svg_text:
        svg_text = svg_text[svg_text.find("<svg"):]
    svg_text = re.sub(r"<metadata>.*?</metadata>", "", svg_text, flags=re.S)
    svg_text = re.sub(r"<!--.*?-->", "", svg_text, flags=re.S)

    ids = set(re.findall(r'\bid="([^"]+)"', svg_text))
    for old_id in sorted(ids, key=len, reverse=True):
        if old_id.startswith(prefix):
            continue
        new_id = f"{prefix}{old_id}"
        svg_text = svg_text.replace(f'id="{old_id}"', f'id="{new_id}"')
        svg_text = svg_text.replace(f"url(#{old_id})", f"url(#{new_id})")
        svg_text = svg_text.replace(f'href="#{old_id}"', f'href="#{new_id}"')
        svg_text = svg_text.replace(f'xlink:href="#{old_id}"', f'xlink:href="#{new_id}"')

    def _normalize_svg_open(m: re.Match) -> str:
        attrs = re.sub(r'\s+(?:width|height)="[^"]*"', "", m.group(1))
        return f'<svg{attrs} width="100%">'

    svg_text = re.sub(r"<svg([^>]*)>", _normalize_svg_open, svg_text, count=1)
    return svg_text.strip()


_PREFERRED_MIRROR: list[str] = []


def _download_if_missing(rel_path: str, dest: Path) -> bytes:
    if dest.exists() and dest.stat().st_size > 0:
        return dest.read_bytes()
    dest.parent.mkdir(parents=True, exist_ok=True)
    ordered = list(_PREFERRED_MIRROR) + [m for m in KATEX_MIRRORS if m not in _PREFERRED_MIRROR]
    last_err = None
    for base in ordered:
        url = f"{base}/{rel_path}"
        for attempt in range(2):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "paper-deep-reader/1.3.0"})
                with urllib.request.urlopen(req, timeout=12) as resp:
                    data = resp.read()
                if data:
                    dest.write_bytes(data)
                    if not _PREFERRED_MIRROR or _PREFERRED_MIRROR[0] != base:
                        _PREFERRED_MIRROR[:] = [base]
                    return data
            except Exception as exc:
                last_err = exc
                time.sleep(0.3 * (attempt + 1))
    raise RuntimeError(
        f"Failed to download KaTeX asset '{rel_path}' from all mirrors ({last_err}). "
        f"Provide a pre-populated directory via --katex-cache or omit --offline-katex."
    )


def build_offline_katex_bundle(cache_dir: Path) -> tuple[str, str]:
    """Download/cache KaTeX once and inline WOFF2-only CSS + JS for compact 100% air-gapped HTML."""
    css_bytes = _download_if_missing("katex.min.css", cache_dir / "katex.min.css")
    js_bytes = _download_if_missing("katex.min.js", cache_dir / "katex.min.js")
    ar_bytes = _download_if_missing("contrib/auto-render.min.js", cache_dir / "contrib" / "auto-render.min.js")

    css_text = css_bytes.decode("utf-8")
    # Strip legacy .woff / .ttf fallback entries so only compact modern .woff2 fonts are inlined
    css_text = re.sub(
        r",url\(fonts/[^)]+\.(?:woff|ttf)\)format\([^)]+\)",
        "",
        css_text,
    )

    woff2_names = sorted(set(re.findall(r"url\(fonts/([^)]+\.woff2)\)", css_text)))
    with ThreadPoolExecutor(max_workers=6) as pool:
        font_data = list(pool.map(lambda fn: (fn, _download_if_missing(f"fonts/{fn}", cache_dir / "fonts" / fn)), woff2_names))
    for fname, fbytes in font_data:
        b64 = base64.b64encode(fbytes).decode("ascii")
        css_text = css_text.replace(f"url(fonts/{fname})", f"url(data:font/woff2;base64,{b64})")

    head_block = f"  <style data-katex-offline>\n{css_text}\n  </style>"
    js_block = (
        f"  <script data-katex-offline>\n{js_bytes.decode('utf-8')}\n"
        f"{ar_bytes.decode('utf-8')}\n"
        f"document.addEventListener('DOMContentLoaded', function() {{ {AUTO_RENDER_CALL} }});\n"
        f"  </script>"
    )
    return head_block, js_block


def main() -> None:
    ap = argparse.ArgumentParser(description="Assemble standalone Warm Paper Morandi HTML monograph.")
    ap.add_argument("--title", required=True, help="HTML document <title>.")
    ap.add_argument("--lang", default="zh-CN", help="HTML lang attribute (default: zh-CN).")
    ap.add_argument("--body", required=True, help="Path to HTML body fragment (content inside <body>).")
    ap.add_argument("--out", required=True, help="Output standalone HTML path.")
    ap.add_argument("--svg", action="append", default=[], help="Token replacement as TOKEN=path/to/file.svg")
    ap.add_argument("--extra-css", help="Optional path to page-specific incremental CSS.")
    ap.add_argument("--extra-js", help="Optional path to page-specific JS (e.g. live formula slider).")
    ap.add_argument(
        "--offline-katex",
        action="store_true",
        help="Inline KaTeX JS/CSS and WOFF2 fonts (cached locally once) for 100%% air-gapped viewing.",
    )
    ap.add_argument(
        "--katex-cache",
        help=f"Optional KaTeX cache directory (default: {DEFAULT_KATEX_CACHE}).",
    )
    args = ap.parse_args()

    theme_css = (ASSETS_DIR / "theme-morandi.css").read_text(encoding="utf-8")
    widgets_js = (ASSETS_DIR / "widgets.js").read_text(encoding="utf-8")
    body_html = Path(args.body).read_text(encoding="utf-8")

    extra_css = Path(args.extra_css).read_text(encoding="utf-8") if args.extra_css else ""
    extra_js = Path(args.extra_js).read_text(encoding="utf-8") if args.extra_js else ""

    for idx, spec in enumerate(args.svg, start=1):
        if "=" not in spec:
            raise ValueError(f"--svg must be TOKEN=PATH, got: {spec}")
        token, svg_path = spec.split("=", 1)
        prefix = f"s{idx}_"
        cleaned = clean_and_prefix_svg(Path(svg_path).read_text(encoding="utf-8"), prefix)
        placeholder = token if token.startswith("@@") else f"@@{token}@@"
        body_html = body_html.replace(placeholder, cleaned)

    katex_body_js = ""
    if args.offline_katex:
        cache_dir = Path(args.katex_cache).expanduser().resolve() if args.katex_cache else DEFAULT_KATEX_CACHE
        katex_head, katex_body_js = build_offline_katex_bundle(cache_dir)
    else:
        katex_head = (
            f'  <link rel="stylesheet" href="{KATEX_CDN}/katex.min.css">\n'
            f'  <script defer src="{KATEX_CDN}/katex.min.js"></script>\n'
            f'  <script defer src="{KATEX_CDN}/contrib/auto-render.min.js"\n'
            f'    onload="{AUTO_RENDER_CALL}"></script>'
        )

    page = (
        f"<!DOCTYPE html>\n"
        f'<html lang="{args.lang}">\n'
        f"<head>\n"
        f'  <meta charset="UTF-8" />\n'
        f'  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
        f"  <title>{html.escape(args.title)}</title>\n"
        f"{katex_head}\n"
        f"  <style>\n{theme_css}\n{extra_css}\n  </style>\n"
        f"</head>\n"
        f"<body>\n"
        f"{body_html}\n"
        + (f"{katex_body_js}\n" if katex_body_js else "")
        + f"  <script>\n{widgets_js}\n  </script>\n"
        + (f"  <script>\n{extra_js}\n  </script>\n" if extra_js.strip() else "")
        + "</body>\n</html>\n"
    )

    out_path = Path(args.out).expanduser().resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(page, encoding="utf-8")
    mode = "offline-katex" if args.offline_katex else "cdn-katex"
    print(f"ASSEMBLED_OK | {out_path} ({len(page.encode('utf-8')):,} bytes, {mode})")


if __name__ == "__main__":
    main()
