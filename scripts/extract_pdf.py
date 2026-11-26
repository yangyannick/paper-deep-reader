#!/usr/bin/env python3
"""Extract full text, build a smart page index, and render targeted PDF PNGs for visual verification.

Usage:
  python scripts/extract_pdf.py --pdf path/to/paper.pdf --out workdir
  python scripts/extract_pdf.py --pdf path/to/paper.pdf --out workdir --pages all --dpi 160
  python scripts/extract_pdf.py --pdf path/to/paper.pdf --out workdir --crop 5:0.06,0.08,0.94,0.45:fig3.png
"""
import argparse
import json
import re
from pathlib import Path

try:
    import pymupdf as fitz
except ImportError:
    import fitz

TABLE_RE = re.compile(r"\b(?:Table|TABLE|Tab\.)\s+[IVX\d]+|\b(?:表)\s*\d+")
FIG_RE = re.compile(r"\b(?:Figure|FIGURE|Fig\.)\s+[IVX\d]+|\b(?:图)\s*\d+")
MATH_RE = re.compile(r"\(\d+\)\s*$|∑|∫|≈|≤|≥|±|√|λ|α|β|γ|σ|θ|ω|∇|∂", re.M)
REF_HEAD_RE = re.compile(r"^\s*(?:\d+\.?\s*)?(?:REFERENCES|References|BIBLIOGRAPHY|Bibliography|参考文献)\s*$", re.M)


def parse_pages(spec: str, total: int, recommended: list[int]) -> list[int]:
    norm = spec.strip().lower()
    if norm == "auto":
        return recommended
    if norm == "all":
        return list(range(1, total + 1))
    if norm == "none":
        return []
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


def analyze_pages(doc: "fitz.Document") -> tuple[list[dict], list[str], list[int]]:
    total = len(doc)
    index: list[dict] = []
    text_chunks: list[str] = []
    in_refs = False

    for idx in range(total):
        page_no = idx + 1
        page = doc[idx]
        txt = page.get_text("text")
        text_chunks.append(f"=== PAGE {page_no} / {total} ===\n{txt}")

        images = len(page.get_images(full=False))
        drawings = len(page.get_drawings())
        has_table = bool(TABLE_RE.search(txt))
        has_fig = bool(FIG_RE.search(txt))
        has_math = bool(MATH_RE.search(txt))

        # Detect pure bibliography tail pages (skip rendering unless they also contain figures/tables)
        if page_no > max(2, total // 2) and REF_HEAD_RE.search(txt):
            in_refs = True
        starts_with_ref_entry = bool(re.match(r"^\s*(?:\[\d+\]|\d+\.\s+[A-Z][a-z]+,)", txt.strip()))
        is_pure_refs = in_refs and (page_no > 1) and not has_table and not has_fig and images == 0 and (
            starts_with_ref_entry or not REF_HEAD_RE.search(txt)
        )

        # Smart recommendation:
        # - Short papers (<=6 pages): render every non-pure-reference page
        # - Longer papers (>6 pages): render page 1 + pages containing figures, tables, images, dense vector plots, or equations
        if total <= 6:
            rec = not is_pure_refs
        else:
            rec = (
                page_no == 1
                or has_table
                or has_fig
                or images > 0
                or drawings >= 35
                or (has_math and not is_pure_refs)
            ) and not is_pure_refs

        index.append({
            "page": page_no,
            "chars": len(txt),
            "images": images,
            "drawings": drawings,
            "has_table": has_table,
            "has_fig": has_fig,
            "has_math": has_math,
            "is_pure_refs": is_pure_refs,
            "recommended": rec,
        })

    recommended = [row["page"] for row in index if row["recommended"]]
    if not recommended and total > 0:
        recommended = [1]
    return index, text_chunks, recommended


def run_crops(doc: "fitz.Document", crops: list[str], out_dir: Path, crop_dpi: int) -> list[str]:
    saved = []
    crop_dir = out_dir / "crops"
    crop_dir.mkdir(parents=True, exist_ok=True)
    for spec in crops:
        parts = spec.split(":")
        if len(parts) < 2:
            raise ValueError(f"--crop expects PAGE:x0,y0,x1,y1[:filename], got: {spec}")
        page_no = int(parts[0])
        x0, y0, x1, y1 = [float(v) for v in parts[1].split(",")]
        fname = parts[2] if len(parts) >= 3 and parts[2] else f"crop_p{page_no:02d}.png"
        page = doc[page_no - 1]
        r = page.rect
        clip = fitz.Rect(r.x0 + x0 * r.width, r.y0 + y0 * r.height, r.x0 + x1 * r.width, r.y0 + y1 * r.height)
        pix = page.get_pixmap(dpi=crop_dpi, clip=clip)
        dst = crop_dir / fname
        pix.save(str(dst))
        saved.append(str(dst))
    return saved


def main() -> None:
    ap = argparse.ArgumentParser(description="Extract PDF text, smart page index, and verification PNGs.")
    ap.add_argument("--pdf", required=True, help="Path to source PDF file.")
    ap.add_argument("--out", required=True, help="Output directory for text, index, and page PNGs.")
    ap.add_argument(
        "--pages",
        default="auto",
        help="Pages to render: 'auto' (default, skips pure reference pages & non-visual walls), 'all', 'none', or e.g. '1,2,4-6'.",
    )
    ap.add_argument("--dpi", type=int, default=150, help="Render DPI for verification page PNGs (default: 150).")
    ap.add_argument(
        "--crop",
        action="append",
        default=[],
        help="High-DPI normalized crop: PAGE:x0,y0,x1,y1[:filename] (fractions 0..1, rendered at --crop-dpi).",
    )
    ap.add_argument("--crop-dpi", type=int, default=240, help="DPI for --crop original figure exports (default: 240).")
    args = ap.parse_args()

    pdf_path = Path(args.pdf).expanduser().resolve()
    out_dir = Path(args.out).expanduser().resolve()
    png_dir = out_dir / "pdf_pages"
    png_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(str(pdf_path))
    total = len(doc)
    index, text_chunks, recommended = analyze_pages(doc)
    render_list = parse_pages(args.pages, total, recommended)

    for page_no in render_list:
        pix = doc[page_no - 1].get_pixmap(dpi=args.dpi)
        pix.save(str(png_dir / f"page_{page_no:02d}.png"))

    cropped = run_crops(doc, args.crop, out_dir, args.crop_dpi) if args.crop else []

    (out_dir / "pdf_text.txt").write_text("\n\n".join(text_chunks), encoding="utf-8")
    (out_dir / "page_index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    meta = {
        "pdf": str(pdf_path),
        "page_count": total,
        "recommended_pages": recommended,
        "rendered_pages": render_list,
        "dpi": args.dpi,
        "crops": cropped,
        "metadata": doc.metadata,
    }
    (out_dir / "pdf_meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    # Compact per-page summary so the agent knows immediately which PNGs to inspect in one parallel batch
    flags_summary = []
    for row in index:
        tags = []
        if row["has_fig"] or row["images"] > 0 or row["drawings"] >= 35:
            tags.append("fig")
        if row["has_table"]:
            tags.append("tab")
        if row["has_math"]:
            tags.append("eq")
        if row["is_pure_refs"]:
            tags.append("refs-skip")
        if row["page"] in render_list:
            tags.append("PNG")
        flags_summary.append(f"p{row['page']}({'/'.join(tags) or 'txt'})")

    print(
        f"EXTRACTED_OK | pages={total} | rendered={len(render_list)} @ {args.dpi}dpi -> {png_dir}\n"
        f"PAGE_MAP: {' '.join(flags_summary)}"
    )
    if cropped:
        print(f"CROPPED_OK | {len(cropped)} file(s): {', '.join(cropped)}")


if __name__ == "__main__":
    main()
