#!/usr/bin/env python3
"""Extract full text and render PDF pages to PNGs for visual fidelity verification.

Usage:
  python scripts/extract_pdf.py --pdf path/to/paper.pdf --out workdir --pages all --dpi 200
  python scripts/extract_pdf.py --pdf path/to/paper.pdf --out workdir --pages 1,2,4-6 --dpi 220
"""
import argparse
import json
from pathlib import Path

try:
    import pymupdf as fitz
except ImportError:
    import fitz


def parse_pages(spec: str, total: int) -> list[int]:
    if spec.strip().lower() == "all":
        return list(range(1, total + 1))
    pages = set()
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-", 1)
            for p in range(max(1, int(a)), min(total, int(b)) + 1):
                pages.add(p)
        else:
            p = int(part)
            if 1 <= p <= total:
                pages.add(p)
    return sorted(pages)


def main() -> None:
    ap = argparse.ArgumentParser(description="Extract PDF text and render verification PNGs.")
    ap.add_argument("--pdf", required=True, help="Path to source PDF file.")
    ap.add_argument("--out", required=True, help="Output directory for text and page PNGs.")
    ap.add_argument("--pages", default="all", help="Pages to render: 'all' or e.g. '1,2,4-6'.")
    ap.add_argument("--dpi", type=int, default=200, help="Render DPI for page PNGs (default: 200).")
    args = ap.parse_args()

    pdf_path = Path(args.pdf).expanduser().resolve()
    out_dir = Path(args.out).expanduser().resolve()
    png_dir = out_dir / "pdf_pages"
    png_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(str(pdf_path))
    total = len(doc)
    render_list = parse_pages(args.pages, total)

    text_chunks = []
    for idx in range(total):
        page_no = idx + 1
        page = doc[idx]
        text_chunks.append(f"=== PAGE {page_no} / {total} ===\n{page.get_text('text')}")
        if page_no in render_list:
            pix = page.get_pixmap(dpi=args.dpi)
            png_path = png_dir / f"page_{page_no:02d}.png"
            pix.save(str(png_path))

    (out_dir / "pdf_text.txt").write_text("\n\n".join(text_chunks), encoding="utf-8")
    meta = {
        "pdf": str(pdf_path),
        "page_count": total,
        "rendered_pages": render_list,
        "dpi": args.dpi,
        "metadata": doc.metadata,
    }
    (out_dir / "pdf_meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"EXTRACTED_OK | pages={total} | rendered={len(render_list)} -> {png_dir}")


if __name__ == "__main__":
    main()
