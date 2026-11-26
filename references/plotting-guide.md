# Publication-Grade Matplotlib Plotting Guide

Use Matplotlib (exporting vector `.svg` + preview `.png`) whenever empirical data is backed by explicit numbers in paper tables or prose—such as signed divergences, multi-sample comparisons, paired scatter distributions, ablations, or scaling trends.

## 0. When to Redraw in Matplotlib vs. Crop Original Figures

- **Redraw as Matplotlib vector SVG (default for numerical data)**: Whenever the paper provides explicit numbers in tables or prose, redraw them in one consolidated plotting script using `assets/morandi-academic.mplstyle` so typography, palette, and vector zoom harmonize across the whole page.
- **Crop high-DPI original figure (`220–300 DPI` PNG via PyMuPDF)**: For photographs, micrographs, observational imagery, or dense multi-curve plots that have **no raw numeric table** in the paper, crop the original figure cleanly into `.fig-frame` (which still supports full-screen Lightbox zoom) instead of spending multiple rounds reverse-engineering PDF vector paths.
- **Batch execution**: Put all Matplotlib figures for a paper into **one plotting script**, generate all `.png` + `.svg` pairs in a single run, and inspect all preview PNGs in parallel via `read_file`.

## 1. Styling & Palette Alignment

Load `assets/morandi-academic.mplstyle` at the top of every plotting script:

```python
import matplotlib.pyplot as plt
from pathlib import Path

STYLE = Path(__file__).resolve().parent.parent / "assets" / "morandi-academic.mplstyle"
plt.style.use(str(STYLE))
```

Use the exact Warm Paper Morandi palette:
- Primary proposed method / main series: `#265867` (Scholarly Teal)
- Secondary / contrasting baseline or regression: `#C85A3F` (Muted Terracotta)
- Positive highlight / improvement delta: `#2A7A68` (Muted Sage)
- Caution / special outlier: `#A66E38` (Warm Ochre)
- Neutral comparison baselines: `#9BA8B4` (Cool Slate) and `#C9BEB4` (Warm Stone)
- Hairlines & grid: `#D2CBC0` spines, `#ECE8E0` subtle gridlines, `#FFFFFF` plot background

## 2. Web Reading Density Rule (When to Split vs Pair)

Unlike print-journal double-column PDFs, HTML pages have free vertical space and a fixed `~800px` usable figure width inside the `860px` article column:

- **Dual-panel horizontal (`figsize=(10.6, 4.6)`)**: Use ONLY when both subplots are concise and low-density (e.g., 3–6 grouped bars per panel) so labels stay ≥8–9pt equivalent on screen.
- **Single full-width figure (`figsize=(9.2, 5.2)` to `(9.2, 7.0)`)**: **MANDATORY** whenever a chart displays **≥15 rows/samples** (e.g., 23-image dumbbell/lollipop chart) or a **dense annotated scatter plot**. Split dense A+B comparisons into two full-width figures (`图 5` and `图 6`) so every tick label, callout box, and legend is comfortably readable without squinting—while the page Lightbox remains available for 500% inspection.

## 3. Export & ID Safety

- Always set `svg.fonttype = "none"` so text remains crisp, selectable vector typography (never bloated path outlines).
- Export BOTH `.png` (`dpi=220`) for visual inspection and `.svg` for embedding.
- Pass `.svg` files through `scripts/assemble_html.py --svg TOKEN=path.svg` (which strips Matplotlib `<metadata>`, removes fixed `pt` width/height while preserving `viewBox`, and prefixes all internal `clipPath` IDs `s1_`, `s2_`, ... so multiple embedded Matplotlib SVGs never collide in the DOM).

## 4. Mandatory Render–Inspect–Revise Loop

Never embed a Matplotlib SVG without first opening its `.png` preview via `read_file` and checking:
1. Main takeaway is immediately clear in 3 seconds;
2. Zero overlapping tick labels, data values, callout boxes, or legend collisions with bars/points;
3. Generous margins on negative extremes (e.g., leftmost labels never kiss the y-axis spine);
4. Top and right spines removed; zero chartjunk or heavy borders;
5. Subtitle stays purely scholarly (data source and metric definition—never QA meta-notes like "严格断言复核").
