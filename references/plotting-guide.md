# Publication-Grade Matplotlib Plotting Guide (v2.0.0)

Every quantitative chart in `paper-deep-reader` is a **visual argument**, not a mechanical copy of a raw plot. State the one-sentence empirical claim the figure defends, pick the chart family that exposes that comparison cleanly, and align styling with `assets/morandi-academic.mplstyle`.

## 1. Visual Argument First — Redrawing vs. Cropping Originals

Follow the **Source Figure Forms** table in `references/diagram-and-layout-guide.md` §2 so every source figure is visibly accounted for (zero silent omissions) and tagged with `data-src`:

- **Redraw in Matplotlib vector SVG (for data-backed quantitative plots)**:
  - Redraw whenever exact data appear in tables or prose, or when a small-N original chart suffers from poor scaling (e.g., linear axis flattening >10× baselines), cramped panels, or jarring colors.
  - Keep the source paper's original figure number (`原文图 N（重绘）` / `Figure N (redrawn)`) and attach `data-src="figN"` on the `<figure>`. If a crowded original mixes competing claims, split into `a`/`b` panels or separate full-width figures sharing the source reference.
  - **Table-to-chart retrievability**: Whenever a source table is turned into a chart, keep its exact numbers retrievable—either via direct labels on the chart or by preserving the full source table inside `<details class="deep-dive">` tagged with `data-src="tabN"`.
- **Use High-DPI Original Crops (`220–300 DPI`)** for complex architecture/mechanism diagrams, simple schematics (`.fig-frame.is-compact`), photographs/micrographs, dense raw waveforms, 100+ point un-tabulated curves, and appendix visual evidence (`references/diagram-and-layout-guide.md` §2).
- **Single-script batch execution**: Put all Matplotlib figures into **one plotting script**, export `.png` + `.svg` pairs together, and inspect all preview PNGs in one parallel `read_file` batch (at most 1 targeted `edit_file` polish pass).

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
| **Raw waveforms / photos / micrographs / complex architectures** | **High-DPI original crop (`220–300 DPI`)** | Preserve exact fidelity without fabrication; pair with target-language title, `data-src`, structured breakdown beneath, and Lightbox zoom. |

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
- Always keep `svg.fonttype = "none"` (crisp selectable text), export BOTH `.png` (`dpi=200`) and `.svg`, and pass `.svg` files through `scripts/assemble_html.py --svg TOKEN=path.svg` (strips `<metadata>`, rounds excessive float decimals to cut SVG size 30–50%, normalizes width to `100%`, and isolates internal `clipPath` IDs).
- **Dense-data browser performance (`rasterized=True`)**: Whenever a single Matplotlib chart plots **>500 scatter markers or >2,000 dense polyline vertices**, set `rasterized=True` on that dense data artist (`ax.scatter(..., rasterized=True)`) while leaving axes, ticks, annotations, and legends as crisp vector SVG.

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
