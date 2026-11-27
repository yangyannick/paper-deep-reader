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

## 2. Five Structured Diagram Archetypes (Pick 1–2 That Clarify)

Every paper monograph should pair a **bird's-eye whole-paper orientation** with **zoomed-in mechanism/protocol clarity**—never empty boxes with names alone, and never two diagrams repeating the same scope:

1. **Whole-Paper Logic Panorama / Mind Map** *(ideal right after Executive Summary for ANY paper type)*:
   - Gives readers a 1-glance overview of the entire paper's argument skeleton (e.g., *Problem / Constraints → Core Method Pillars or Taxonomy Branches → Key Findings / Regimes → Scope & Boundaries*), adapted to the paper:
     - *Method / Systems / Empirical papers*: structured 4-stage causal flow (10–14 concise nodes with key numbers on branches);
     - *Surveys / Taxonomies / Comparative papers*: clean 2–3 level hierarchical mind map / taxonomy tree;
     - *Theory / Proof papers*: Assumption → Lemma → Main Theorem → Corollary dependency DAG.
   - Attach `data-jump="#sec-01"` (etc.) on major blocks so clicking a node smoothly jumps straight to that section (with a return-to-reading pill). Keep typography crisp—never draw cramped 30–40 node spiderwebs with microscopic text.
2. **Parallel Side-by-Side / Dual-Track Comparison** *(default for comparing structurally different baselines vs. proposed method)*:
   - When the baseline and proposed approach have different topologies (e.g., two legacy failure branches vs. one multi-stage proposed pipeline), draw them **simultaneously in parallel upper/lower or left/right tracks** so readers contrast them in one glance with zero clicks and full print fidelity.
3. **End-to-End Method / Data-Flow Pipeline** *(algorithms, ML architectures, signal processing, systems, Section 02)*:
   - Annotate edges with **tensor shapes / data types / physical units**, attach **equation links**, and mark **bottlenecks or branches**.
   - **High-leverage upgrade**: Attach `.fig-steps` + `.step-vals` so the worked concrete micro-example flows step-by-step right through the flowchart (also remains fully interactive inside Lightbox!).
4. **Decision Tree / Experimental Protocol & Sample-Flow Diagram** *(adaptive control, state machines, experimental physics, clinical/empirical cohorts, large-scale benchmarks)*:
   - Consolidate scattered `if/else` thresholds and escape branches onto an orthogonal routing tree, OR show cohort/dataset filtering → exclusion criteria (including footnotes) → experimental arms → final metric accounting.
5. **Same-Coordinate View Toggle (`data-set-view`)** *(optional—ONLY for true same-coordinate or high-overlap diffs)*:
   - Reserve interactive view toggling for cases where both views share identical coordinates or an identical architectural skeleton and overlaying them simultaneously would clutter the canvas (e.g., overlapping distributions/curves before vs. after a transform, absolute values vs. % delta on identical axes, or switching operating regimes on the same graph). Do NOT force a toggle when two diagrams have completely different layouts and read better in parallel!

### Vector SVG Craft Rules
1. **Zero text/line collisions & clean anchor alignment**: Keep ≥32–44px horizontal gaps between stage boxes; anchor connector arrows cleanly at box edge midpoints (never grazing rounded corners or floating off-edge); route feedback tracks cleanly above/below boxes; use crisp Unicode subscripts (`xₜ`, `yₜ`, `Iₙ₋₁`, `x̂ₜ`) inside `<text>` because KaTeX ignores `<svg>`.
2. **Visual grouping & edges must match true logical topology**: Parallel elements belonging to the same stage or category must have clear visual grouping so readers immediately see what belongs together; every arrow or connector must express a genuine causal, sequential, or parent–child relationship—never draw forced cross-links between unrelated sibling nodes just to make a layout look symmetric.
3. **Target-language consistency**: In Chinese monographs, every diagram header, stage title, and branch label must be in Simplified Chinese (keeping standard English acronyms and math variables).
4. **Clear granularity separation**: Keep the top-of-article visual focused on the **whole-paper logic panorama** (bird's-eye arc or taxonomy), and Section 02's diagram focused on **formula-level data flow, internal mechanics, and worked-example stepping**—never duplicate the same overview twice.

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
      <!-- Attach data-flow directly to inter-box connector edges (never draw flow-route across box text!) -->
      <path class="d-edge-hot" pathLength="1" data-step="2" data-flow="teal" data-every="1300" d="M204 98 H292"/>
      <!-- .step-vals swaps live worked-example numbers in place as steps advance -->
      <g class="step-vals" font-family="monospace" font-size="12">
        <text data-step="1" x="114" y="158" text-anchor="middle">输入: [120, 122, 125]</text>
        <text data-step="2" x="114" y="158" text-anchor="middle">预测 x̂₃ = 124 → 残差 e₃ = +1</text>
      </g>
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

### 3.2 Optional Same-Coordinate View Toggle (`data-set-view`)
Use **only** when two views share identical coordinates or an identical architectural skeleton and overlaying them would clutter the canvas (for structurally different baseline vs. proposed flows, prefer a parallel dual-track diagram instead). Lightbox automatically preserves the toggle while zoomed!

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
- **Auto-Indexed Symbol Hover Cards & Draggable Floating Symbol Sheet (`<table data-sym-table>`)**:
  1. Add `data-sym-table` to the paper's symbol definition `<table>` (optionally add `data-sym-def="T, T_win"` on `<tr>` for aliases; columns: `[Symbol, Domain/Unit, Physical Meaning]`).
  2. `assets/widgets.js` **automatically** binds hover quick-cards onto every matching symbol inside rendered KaTeX formulas—both display equations (`$$...$$`, clean at rest, highlights on hover) and inline math (`$...$`)—and adds a `📌 悬浮查看` / Masthead `Σ 符号` pinnable, draggable floating symbol sheet! Manual `<span class="sym-ref" data-sym="T">$T$</span>` remains supported for plain-text mentions or inline `data-sym-tip` fallbacks.

### 3.4 Declarative Interactive Tables (`<table data-interactive>`)
Add `data-interactive` to any clean benchmark/results `<table>` inside `.table-wrap` (and set `data-table-title="表 1 · ..."` on `.table-wrap` or use `<caption>` so the left sidebar's `本篇表格` drawer shows a crisp label):
- Automatically adds search filtering, visible row count, one-click `复制 CSV`, and click-to-sort headers while keeping `.row-total` pinned at the bottom.
- **Semantic extrema highlighting (strictly opt-in via `data-better`)**: Add `data-better="high"` or `data-better="low"` **only** on `<th>` columns representing genuinely comparable performance metrics on a common scale. Never mark categorical labels, dataset names, method parameters, years, or mixed-scale non-comparable columns; `widgets.js` strictly highlights only columns carrying `data-better` (and hides the `极值高亮` button when no column declares it).
- Automatically skips sorting on tables with `rowspan`/`colspan` or `< 5` data rows so merged academic headers are never scrambled.
- Keep tables inline inside the subsection that discusses them; use `<details class="deep-dive">` or `.explorer-card` only when a paper genuinely has an oversized raw per-sample table (e.g., 30+ rows) or multi-tab sub-tables.

### 3.5 Progressive Disclosure Drawers (`<details class="deep-dive">`), On-Demand Equation Notes (`.eq-note`) & Cross-References (`<a class="xref">`, `data-jump`)
- Wrap lengthy algebraic derivations, secondary ablations, or verbatim quotes in:
  ```html
  <details class="deep-dive">
    <summary>展开推导细节：递推复杂度与收敛边界 <span class="pill">推导</span></summary>
    <div class="deep-dive-body">...</div>
  </details>
  ```
  All `<details>` auto-expand on `Ctrl+P` print and restore afterward.
- Inside `.eq-box`, add an optional `<div class="eq-note">` (1–3 concise lines separated by a dashed hairline) **only when** a core formula introduces local symbols, non-obvious operators, or key structural terms whose role isn't obvious at a glance; skip `.eq-note` for simple formulas already clear in prose.
- Give figures (`id="fig-1"`), equations (`id="eq-1"`), and tables (`id="tab-1"`) stable IDs, and cite them with `<a class="xref" href="#fig-1">图 1</a>`. Inside overview flowcharts or mind maps, add `data-jump="#sec-02"` on any SVG `<g>` node so clicking smoothly jumps to that section with a transient `↩ 返回阅读处` pill.

### 3.6 Optional Live Formula / Parameter Explorer (`.live-card`)
Use **only** when the paper provides an explicit analytical equation or measured parameter grid (never invent speculative curves):
- 1–3 `<input type="range">` controls inside `.live-controls`, one clean pure `update()` function updating an inline SVG chart/readout, mark the paper's measured default value, and clearly state the exact equation (or label simplified intuition models `"机理示意"`).

### 3.7 Built-In Automatic Features & Canonical Page Shell
Always start `body.html` with this canonical shell so scroll-spy, collapsible `本篇图表` / `核心公式` drawers, reading progress, and right-margin marginalia attach cleanly:

```html
<div id="scroll-progress" aria-hidden="true"></div>
<header class="masthead">
  <div class="masthead-inner">
    <div class="masthead-title"><span class="masthead-dot"></span><span>短标题</span></div>
    <div class="masthead-meta"><span class="pill pill-teal">Venue Year</span></div>
  </div>
</header>
<div class="page-shell">
  <aside class="sidebar" aria-label="文章导航">
    <nav class="toc-card">
      <div class="toc-heading">Contents · 目录</div>
      <ul class="toc-list" id="toc-list">
        <li><a href="#sec-exec">核心导读</a></li>
        <li><a href="#sec-01">01 · 研究背景</a></li>
      </ul>
    </nav>
  </aside>
  <main class="article-main">...</main>
</div>
```

`assets/widgets.js` enables these automatically on every assembled monograph:
- **Quiet Masthead Controls**: `A−` / `A+` font scale and Warm Paper Light ↔ restrained Midnight Slate Dark toggle (persisted via `localStorage`).
- **Frameless Editorial Left Sidebar**: Clean borderless section outline rail with quiet collapsible `本篇插图` / `本篇表格` (`Figures` / `Tables`) drawers below, plus mini progress bar and estimated reading time.
- **Zero-Clutter Highlighter, Marginalia & Exportable Notes**: Selecting any passage (including across inline `<code>` and KaTeX formulas) pops 3 Morandi color dots for instant 1-click inline highlighting plus `✎ 批注 | ? 提问`; clicking an existing pure highlight allows recoloring, upgrading to a note, or deleting. Pure highlights stay inline without crowding the right margin, while written notes/questions appear on wide screens (`≥ 1340px`) as aligned right-margin marginalia; the Masthead `✎ 笔记 N` pill provides filtered review (`全部 / 批注与提问 / 高亮摘录`) and one-click Markdown copy / `.md` download.
- **Interactive 120fps Vector Pan & Zoom Lightbox**: Works on every `.fig-frame` SVG or `<img>` (including cropped original figures), and **automatically mounts synced `.fig-steps` stepper controls (`←` / `→` / `Space` + step notes) and `data-set-view` Before/After toggles inside the Lightbox footer** so readers can step and flip views live without losing pan/zoom position.

---

## 4. Layout & Performance Non-Negotiables

- **Zero Google Fonts `<link>` tags** and **zero `backdrop-filter: blur(...)`**.
- **Keep `content-visibility: auto`** on `.fig-frame` and `.explorer-card` (already in `assets/theme-morandi.css`).
- **Balanced grids**: 4-column flush KPIs, 4-column Small Multiples, 2×2 Evidence Boundary cards, 3-column Engineering Transfer cards.
- **Clean print**: `@media print` automatically hides UI chrome, expands `<details>`, and locks steppers to their final complete state.
