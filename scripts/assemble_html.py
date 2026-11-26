#!/usr/bin/env python3
"""Assemble a self-contained single-file HTML monograph from body HTML, SVGs, and skill assets.

Usage:
  python scripts/assemble_html.py \
    --title "Paper Title — Deep Reading" \
    --body workdir/body.html \
    --out output/paper-deep-read.html \
    --svg SVG_PLOT1=workdir/plot1.svg \
    --svg SVG_PLOT2=workdir/plot2.svg \
    --extra-js workdir/custom_widgets.js
"""
import argparse
import re
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = SKILL_ROOT / "assets"


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

    svg_text = re.sub(
        r'<svg([^>]*?)\s+width="[^"]+"\s+height="[^"]+"',
        r'<svg\1 width="100%"',
        svg_text,
        count=1,
    )
    return svg_text.strip()


def main() -> None:
    ap = argparse.ArgumentParser(description="Assemble standalone Warm Paper Morandi HTML monograph.")
    ap.add_argument("--title", required=True, help="HTML document <title>.")
    ap.add_argument("--lang", default="zh-CN", help="HTML lang attribute (default: zh-CN).")
    ap.add_argument("--body", required=True, help="Path to HTML body fragment (content inside <body>).")
    ap.add_argument("--out", required=True, help="Output standalone HTML path.")
    ap.add_argument("--svg", action="append", default=[], help="Token replacement as TOKEN=path/to/file.svg")
    ap.add_argument("--extra-css", help="Optional path to page-specific incremental CSS.")
    ap.add_argument("--extra-js", help="Optional path to page-specific JS (e.g. stepper/sandbox/table).")
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

    katex_head = (
        '  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">\n'
        '  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>\n'
        '  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"\n'
        "    onload=\"renderMathInElement(document.body, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],ignoredTags:['script','noscript','style','textarea','pre','code','svg'],throwOnError:false});\"></script>"
    )

    page = (
        f"<!DOCTYPE html>\n"
        f'<html lang="{args.lang}">\n'
        f"<head>\n"
        f'  <meta charset="UTF-8" />\n'
        f'  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
        f"  <title>{args.title}</title>\n"
        f"{katex_head}\n"
        f"  <style>\n{theme_css}\n{extra_css}\n  </style>\n"
        f"</head>\n"
        f"<body>\n"
        f"{body_html}\n"
        f"  <script>\n{widgets_js}\n  </script>\n"
        + (f"  <script>\n{extra_js}\n  </script>\n" if extra_js.strip() else "")
        + "</body>\n</html>\n"
    )

    out_path = Path(args.out).expanduser().resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(page, encoding="utf-8")
    print(f"ASSEMBLED_OK | {out_path} ({len(page.encode('utf-8')):,} bytes)")


if __name__ == "__main__":
    main()
