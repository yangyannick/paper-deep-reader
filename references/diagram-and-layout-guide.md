# Visual Design System, Structured Flowcharts & Declarative Interactive Components (v1.3.0)

All visuals must harmonize with `assets/theme-morandi.css` and `assets/widgets.js`. Almost all interactive capabilities below are **declarative (zero bespoke JS)**—add semantic HTML/SVG attributes and `assets/widgets.js` wires them automatically in both Simplified Chinese and English (`<html lang>`).

## 1. Warm Paper Morandi & Restrained Midnight Slate Palette Contract

Use CSS variables inside hand-drawn diagrams (`class="diag-svg"`) so flowcharts automatically adapt to Warm Paper Light and restrained Midnight Slate Dark modes (in dark mode, `.diag-svg` cards drop colorful tints to neutral slate surfaces with low-chroma strokes so dark screens never feel rainbow-noisy):

| Role | Light Hex | Dark Hex | CSS Var / `.diag-svg` Class |
|---|---|---|---|
| Page Ground | `#F7F5F0` | `#1B2028` | `var(--paper)` |
| Card / Node Surface | `#FBF9F5` | `#272F3B` | `.d-card` (`--surface-tint` / `--border-strong`) |
| Primary Ink / Text | `#1C1917` | `#ECF1F7` | `var(--ink)` (default on `.diag-svg text`) |
| Muted Ink / Sublabels | `#6B655E` | `#8E9DB0` | `.d-muted` / `.d-edge` |
| Scholarly Teal (Proposed / Active) | `#265867` (`#EEF5F7`) | `#7AB3C4` | `.d-teal` / `.d-edge-hot` |
| Muted Sage (Lossless / Gain) | `#2A7A68` (`#EFF8F5`) | `#7FB5A5` | `.d-sage` |
| Muted Terracotta (Risk / Trade-off) | `#C85A3F` (`#FDF3F0`) | `#C98B7D` | `.d-terra` |
| Warm Ochre (Caution / Symbol / Condition) | `#A66E38` (`#FDF7EE`) | `#C5A77B` | `.d-ochre` |

*(Matplotlib quantitative SVGs and original PDF raster crops stay on light academic paper in light mode and automatically receive a softened, low-glare paper plate in dark mode via `theme-morandi.css`—do not invert statistical charts.)*

---

## 2. Four Structured Flowchart Archetypes (Pick 1–2 That Clarify)

Every technical paper monograph should include at least one substantive flowchart or mechanism diagram—never empty boxes with names alone:

1. **End-to-End Method / Data-Flow Flowchart** *(algorithms, ML architectures, signal processing, systems)*:
   - Annotate edges with **tensor shapes / data types / bit-widths**, attach **equation tags** (`Eq. 3`), and mark **bottlenecks or branches**.
   - **High-leverage upgrade**: Attach `.fig-steps` + `.step-vals` so the worked numerical micro-example flows step-by-step right through the flowchart!
2. **Decision Tree / Conditional Routing Flowchart** *(adaptive control, codecs, state machines, clinical/protocol branching)*:
   - Consolidate scattered `if/else` thresholds, escape paths, and fallback branches onto one clean orthogonal tree with explicit trigger predicates on every edge.
3. **Experimental Protocol & Sample-Flow Diagram** *(experimental physics, clinical, empirical, large-scale benchmarks)*:
   - Show raw cohort/dataset size → exclusion/filtering criteria (including footnote rules) → experimental arms/splits → final metric accounting. Makes evidence boundaries visible at a glance.
4. **Same-Coordinate Before / After Mechanism Diff** *(method improvements; ideal in Executive Summary or Section 01)*:
   - Keep identical node geometry and wire `[data-set-view="before"]` / `[data-set-view="after"]` so readers toggle between baseline failure and proposed fix in place.

*(For pure mathematical proofs or surveys without stage pipelines, use a **Lemma→Theorem Dependency SVG** or **Taxonomy Tree SVG** instead of forcing a pipeline flowchart.)*

### Vector SVG Craft Rules
1. **Zero text/line collisions**: Keep ≥32–44px horizontal gaps between stage boxes; route feedback tracks cleanly above/below boxes; use crisp Unicode subscripts (`xₜ`, `yₜ`, `Iₙ₋₁`, `x̂ₜ`) inside `<text>` because KaTeX ignores `<svg>`.
2. **Target-language consistency**: In Chinese monographs, every diagram header, stage title, and branch label must be in Simplified Chinese (keeping standard English acronyms and math variables).
3. **No duplicate overview diagrams**: Keep an Executive Summary visual focused on *problem vs. solution intuition* (or Before/After toggle), and Section 02's flowchart focused on *formula-level data flow and worked-example stepping*.

---

## 3. Declarative Interactive Toolkit (Zero Bespoke JS)

### 3.1 Declarative Flowchart Stepper & Worked-Example Replay (`.fig-steps`)
Opens on the **complete final state (`N / N`)** for instant readability and print fidelity; clicking Play replays `1 → N`. `assets/widgets.js` injects the toolbar (`Prev / Replay / Range / Next / N/N`) automatically—just supply `[data-step]` attributes and `<ol class="steps-notes">`:

```html
<figure class="fig-frame fig-steps" id="fig-pipeline" data-lightbox-title="图 2 · 端到端流水线与微例推演">
  <div class="fig-header">
    <div class="fig-title">图 2 · 端到端流水线与数值微例推演</div>
    <div class="fig-actions"><button class="btn-zoom" type="button" data-zoom-btn>⤢ 放大查看</button></div>
  </div>
  <div class="fig-svg-wrap fig-zoomable">
    <svg class="diag-svg" viewBox="0 0 860 280" role="img" aria-label="方法流水线图">
      <!-- data-step="0" always visible; "0 2" always visible & highlighted on step 2; "2" appears at step 2 -->
      <g class="svg-node" data-ref-node="enc" data-step="0 1">
        <rect class="d-teal" x="24" y="60" width="180" height="76" rx="10" stroke-width="1.6"/>
        <text x="114" y="92" text-anchor="middle" font-size="14" font-weight="700">阶段 1 · 预测</text>
        <text class="d-muted" x="114" y="114" text-anchor="middle" font-size="11.5">Eq. (1): x̂ₜ = Σ aₖ xₜ₋ₖ</text>
      </g>
      <!-- pathLength="1" draws the connector smoothly when stepping -->
      <path class="d-edge-hot" pathLength="1" data-step="2" d="M204 98 H292"/>
      <!-- .step-vals swaps live worked-example numbers in place as steps advance -->
      <g class="step-vals" font-family="monospace" font-size="12">
        <text data-step="1" x="114" y="158" text-anchor="middle">输入: [120, 122, 125]</text>
        <text data-step="2" x="114" y="158" text-anchor="middle">预测 x̂₃ = 124 → 残差 e₃ = +1</text>
      </g>
      <!-- Optional proportional flow dots (MAX 1 figure per page; pauses off-screen & under reduced motion) -->
      <path class="flow-route" data-flow="teal" data-every="1100" d="M114 98 H460"/>
      <g class="flow-dots" aria-hidden="true"></g>
    </svg>
  </div>
  <ol class="steps-notes">
    <li><strong>第 1 步（输入与预测）：</strong>读取前序样本并按式 (1) 计算预测值。</li>
    <li><strong>第 2 步（残差输出）：</strong>计算残差 e₃ = +1 并送入熵编码器。</li>
  </ol>
  <figcaption class="fig-caption">默认展示完整流水线；点击「逐步推演」可按微例逐步查看每阶段中间量。</figcaption>
</figure>
```
- Use `class="step-only" data-step="2"` for transient callout badges or active state rings visible **only** on listed step(s).
- Keep `data-flow` proportional particles to **at most 1 key data-flow figure per page** so the page remains calm.

### 3.2 Same-Coordinate View Switch / Before-After Toggle (`data-set-view`)
Switch between baseline vs. proposed mechanism (or absolute vs. % gain views) inside one `.fig-frame`:

```html
<figure class="fig-frame" id="fig-diff" data-view="after" data-lightbox-title="图 1 · 传统基线与本文机制对照">
  <div class="fig-header">
    <div class="fig-title">图 1 · 传统基线与本文机制对照</div>
    <div class="fig-actions">
      <div class="view-switch" role="group" aria-label="视图切换">
        <button type="button" class="view-btn" data-set-view="before">传统基线</button>
        <button type="button" class="view-btn is-active" data-set-view="after">本文方法</button>
      </div>
      <button class="btn-zoom" type="button" data-zoom-btn>⤢ 放大查看</button>
    </div>
  </div>
  <div class="fig-svg-wrap fig-zoomable">
    <svg class="diag-svg" viewBox="0 0 840 240">
      <!-- shared base nodes without data-view-panel -->
      <g data-view-panel="before"><!-- baseline bottleneck path --></g>
      <g data-view-panel="after"><!-- proposed bypass path --></g>
    </svg>
  </div>
  <figcaption class="fig-caption">点击右上角按钮在同坐标系下切换传统路径与本文改进路径。</figcaption>
</figure>
```
*(Also works with two sibling `<div data-view-panel="abs">` / `<div data-view-panel="rel">` wrapping separate SVGs; Lightbox automatically zooms the currently active visible panel.)*

### 3.3 Bidirectional Linked Highlighting (`data-ref`) & Symbol Quick-Cards (`data-sym`)
- **Bidirectional `data-ref`**: Mark 3–6 key concepts in prose with `<span class="ref-term" data-ref="pred">线性预测器</span>` and matching SVG groups with `class="svg-node" data-ref-node="pred"` (or `data-ref="pred"`). Hovering/focusing **either side** illuminates all matching prose terms and SVG elements together.
- **Auto-Indexed Symbol Hover Cards (`data-sym`)**:
  1. Add `data-sym-table` to the paper's symbol definition `<table>` (optionally add `data-sym-def="T, T_win"` on `<tr>` when a row defines a formatted LaTeX symbol like `$T$` or multiple aliases; columns: `[Symbol, Domain/Unit, Physical Meaning]`).
  2. In later sections, mark recurring symbols in prose with `<span class="sym-ref" data-sym="T">$T$</span>` (or inline fallback `<span class="sym-ref" data-sym="T" data-sym-tip="自相关训练窗长 (samples)">$T$</span>`). Hovering/clicking displays a Morandi quick-card with a one-click `定位到符号表 ↗` jump!

### 3.4 Declarative Interactive Tables (`<table data-interactive>`)
Add `data-interactive` to any clean benchmark/results `<table>` inside `.table-wrap`:
- Automatically adds search filtering, visible row count, one-click `复制 CSV`, numeric column `极值高亮` (add `data-better="low"` on `<th>` for lower-is-better metrics like latency/MSE/bpp), and click-to-sort headers while keeping `.row-total` pinned at the bottom.
- Automatically skips sorting on tables with `rowspan`/`colspan` or `< 5` data rows so merged academic headers are never scrambled.
- Keep `.explorer-card` only when a paper truly needs multi-tab dataset/method switching across separate sub-tables.

### 3.5 Progressive Disclosure Drawers (`<details class="deep-dive">`) & Cross-References (`<a class="xref">`)
- Wrap lengthy algebraic derivations, secondary ablations, or verbatim English quotes in:
  ```html
  <details class="deep-dive">
    <summary>展开推导细节：Levinson–Durbin 递推复杂度证明 <span class="pill">O(p²)</span></summary>
    <div class="deep-dive-body">...</div>
  </details>
  ```
  All `<details>` auto-expand on `Ctrl+P` print and restore afterward.
- Give figures (`id="fig-1"`), equations (`id="eq-1"`), and tables (`id="tab-1"`) stable IDs, and cite them with `<a class="xref" href="#fig-1">图 1</a>`. Clicking smooth-scrolls, pulses the target card, and pops a transient `↩ 返回阅读处` button.

### 3.6 Optional Live Formula / Parameter Explorer (`.live-card`)
Use **only** when the paper provides an explicit analytical equation or measured parameter grid (never invent speculative curves):
- 1–3 `<input type="range">` controls inside `.live-controls`, one clean pure `update()` function updating an inline SVG chart/readout, mark the paper's measured default value, and clearly state the exact equation (or label simplified intuition models `"机理示意"`).

### 3.7 Built-In Automatic Features (Zero Markup Needed)
`assets/widgets.js` enables these automatically on every assembled monograph:
- **Quiet Masthead Controls**: `A−` / `A+` font scale and Warm Paper Light ↔ restrained Midnight Slate Dark toggle (persisted via `localStorage`).
- **Frameless Editorial Left Sidebar**: Clean borderless section outline rail with quiet collapsible `本篇图表` / `核心公式` drawers below (hidden when 0 equations), plus mini progress bar and estimated reading time.
- **Zero-Clutter Marginalia & Exportable Notes**: Selecting any passage (including across inline `<code>` and KaTeX formulas) pops `✎ 批注 | ? 提问`; each `.fig-frame` gets a subtle `✎` icon (with inline `批注 / 疑问` switch). On wide screens (`≥ 1340px`), saved notes appear automatically as aligned right-margin marginalia linked to soft inline highlights (completely empty when 0 notes), while the Masthead `✎ 笔记 N` pill provides centralized review and one-click Markdown copy / `.md` download.
- **120fps Vector Pan & Zoom Lightbox**: Works on every `.fig-frame` SVG or `<img>` (including cropped original figures and view-switched panels).

---

## 4. Layout & Performance Non-Negotiables

- **Zero Google Fonts `<link>` tags** and **zero `backdrop-filter: blur(...)`**.
- **Keep `content-visibility: auto`** on `.fig-frame` and `.explorer-card` (already in `assets/theme-morandi.css`).
- **Balanced grids**: 4-column flush KPIs, 4-column Small Multiples, 2×2 Evidence Boundary cards, 3-column Engineering Transfer cards.
- **Clean print**: `@media print` automatically hides UI chrome, expands `<details>`, and locks steppers to their final complete state.
