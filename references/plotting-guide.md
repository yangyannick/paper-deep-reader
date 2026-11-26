# Publication-Grade Matplotlib Plotting Guide

Every quantitative figure in `paper-deep-reader` is a **visual argument**, not a mechanical copy of an author's raw plot. Before writing a single plotting line, state the one-sentence empirical claim the figure defends, pick the chart family that makes that comparison effortless, and align typography and color hierarchy with `assets/morandi-academic.mplstyle`.

## 1. Visual Argument First — When to Redraw vs. Crop Originals

- **One dominant message per figure**: If an original paper figure crams competing claims into one crowded panel (e.g., lossless and lossy curves mixed together) or obscures differences with a poor scale (e.g., a linear y-axis flattening baselines that span >10×), **split or redesign the figure** (e.g., separate panels or switch to a log scale) instead of faithfully copying a suboptimal layout.
- **Redraw in Matplotlib vector SVG (default)**:
  - Always redraw when numbers appear in tables or prose.
  - Also prefer redrawing small-N discrete plots (e.g., 4–10 bar ablations, small sweep curves) when the original figure uses jarring default colors, clipped/misleading axes, or low-contrast typography—even if exact points must be read carefully from axis ticks or prose.
- **Crop high-DPI original figure (`220–300 DPI` PNG via PyMuPDF)**:
  - Use original crops **only** for genuinely un-redrawable visual evidence: photographs, micrographs, observational/medical imagery, dense high-frequency raw waveforms (thousands of samples), or dense 100+ point curves with no numeric table whose original rendering is already clean and legible.
  - Always place cropped images inside `<figure class="fig-frame">` with `<img class="fig-img fig-zoomable" ...>` so full-screen Lightbox pan/zoom works automatically.
- **Single-script batch execution**: Put all Matplotlib figures for a paper into **one plotting script**, generate all `.png` + `.svg` pairs in one run, and visually inspect every preview PNG in parallel via `read_file`.

## 2. Chart Family Selection Playbook

Choose the visual encoding that directly exposes the paper's mechanism rather than defaulting to generic bars or rainbow lines:

| Analytical Question | Recommended Chart Family | Key Visual Craft Details |
| :--- | :--- | :--- |
| **Baseline vs. method end-point gains** | **Paired-delta grouped bar** | Highlight primary method in Scholarly Teal; mute baselines; add direct `+X%` / `+X pp` delta pills or arrows above paired bars. |
| **Signed divergence across 10–30 items** | **Horizontal signed dumbbell / lollipop** | Full-width single figure; vertical zero reference line; subtle alternating group shading; horizontal connectors showing paired gap. |
| **Two-variable trade-off / paired drop** | **Connected paired scatter** | Vertical or arrow connectors linking the same item under two methods; direct callout boxes for key outliers and regimes. |
| **Ordered sweep / scaling / >10× span** | **Multi-series line (log scale / regime bands)** | Switch to log scale whenever series span ≥10×; shade distinct dataset/regime zones lightly; add dashed reference/mean lines with direct end labels. |
| **Multi-seed / experimental uncertainty** | **Point-range / CI dot plot** | Show central tendency + explicit error bars or shaded confidence bands; state exact interval meaning (SD, 95% CI, IQR) in caption. |
| **Small-N dual-metric trade-off (≤8 pts)** | **Compact dual-axis bar + line** | Direct value labels on bars/endpoints; if an axis starts above zero to show a subtle slope, state the truncation explicitly in the caption. |
| **Raw waveforms / photos / micrographs** | **High-DPI original crop (`220–300 DPI`)** | Preserve exact fidelity without fabrication; pair with crisp Chinese/target-language title, callout summary, and working zoom lightbox. |

## 3. Styling, Palette Hierarchy & Colorblind-Safe Encoding

Load `assets/morandi-academic.mplstyle` at the top of the plotting script:

```python
import matplotlib.pyplot as plt
from pathlib import Path

STYLE = Path(__file__).resolve().parent.parent / "assets" / "morandi-academic.mplstyle"
plt.style.use(str(STYLE))
```

Keep **one unified method-to-color+marker identity across the entire page**:
- Primary proposed method (visually dominant): `#265867` (Scholarly Teal, solid line / filled circle)
- Key contrasting competitor or negative regression: `#C85A3F` (Muted Terracotta, diamond / dashed)
- Positive improvement / verified gain: `#2A7A68` (Muted Sage, triangle / accent bar)
- Secondary highlight / outlier / threshold: `#A66E38` (Warm Ochre)
- Neutral baselines (visually subordinate): `#9BA8B4` (Cool Slate, hollow square) and `#C9BEB4` (Warm Stone)
- Hairlines & subtle grids: `#D2CBC0` spines, `#ECE8E0` gridlines, `#FFFFFF` plot background

Always pair **color with shape or line style** (solid vs. dashed, circle vs. diamond vs. hollow square) so every chart stays legible in grayscale and for color-vision-deficient readers. Prefer **direct labels** (endpoint values, delta pills, dashed reference annotations) over bulky legends whenever space allows.

## 4. Web Reading Density & Export Safety

HTML pages have free vertical space and a fixed `~800px` usable figure width inside the `860px` reading column:
- **Dual-panel horizontal (`figsize=(10.6, 4.6)`)**: Use ONLY when both subplots are concise and low-density (≤8 categories per panel).
- **Single full-width figure (`figsize=(9.2, 5.0)` to `(9.2, 7.0)`)**: **MANDATORY** whenever a chart displays **≥15 rows/samples** or a **dense annotated scatter/line plot**. Split dense A+B comparisons into separate full-width figures with bridging prose between them.
- Always keep `svg.fonttype = "none"` (crisp selectable text), export BOTH `.png` (`dpi=220`) and `.svg`, and pass `.svg` files through `scripts/assemble_html.py --svg TOKEN=path.svg` (strips `<metadata>`, normalizes width to `100%`, and isolates internal `clipPath` IDs).

## 5. Mandatory Render–Inspect–Revise Checklist

Never embed a Matplotlib SVG without inspecting its `.png` preview via `read_file` against these 8 checks:
1. Main takeaway is obvious in 3 seconds; no competing claims fighting inside one panel;
2. Zero overlapping tick labels, bar-value labels, callout boxes, or legend collisions with data;
3. Main method is visually dominant; neutral baselines recede cleanly;
4. Explicit units, baselines, zero/reference lines, and honest disclosure of any non-zero axis start;
5. Generous x/y margins so extreme points or negative labels never kiss axis spines;
6. Top and right spines removed (except clean dual-y charts); subtle or no gridlines; zero chartjunk;
7. Still distinguishable in grayscale / colorblind view via marker shape or line-style dual encoding;
8. Title and subtitle stay purely scholarly (never meta-QA notes like "断言复核").
