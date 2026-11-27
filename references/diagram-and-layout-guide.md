# Visual Design System, Figures & Interactive Contract (v2.0.0)

Single source of truth for **source figure presentation, `.diag-svg` craft, declarative `widgets.js` markup, bespoke interactive UX rules, and native CSS classes** across Simplified Chinese and English (`<html lang>`).

## 1. Warm Paper Morandi & Midnight Slate Palette Contract

Use CSS variables and `.diag-svg` helper classes inside custom diagrams so they automatically adapt between Warm Paper Light and Midnight Slate Dark modes:

| Role | Light Hex | Dark Hex | CSS Var / `.diag-svg` Class |
|---|---|---|---|
| Page Ground | `#F7F5F0` | `#1B2028` | `var(--paper)` |
| Card / Node Surface | `#FBF9F5` | `#272F3B` | `.d-card` (`--surface-tint` / `--border-strong`) |
| Primary / Muted Ink | `#1C1917` / `#6B655E` | `#ECF1F7` / `#8E9DB0` | `var(--ink)` / `.d-muted`, `.d-edge` |
| Scholarly Teal (Proposed / Active) | `#265867` (`#EEF5F7`) | `#7AB3C4` | `.d-teal` / `.d-edge-hot` |
| Muted Sage (Gain / Lossless) | `#2A7A68` (`#EFF8F5`) | `#7FB5A5` | `.d-sage` |
| Muted Terracotta (Risk / Trade-off) | `#C85A3F` (`#FDF3F0`) | `#C98B7D` | `.d-terra` |
| Warm Ochre (Caution / Condition) | `#A66E38` (`#FDF7EE`) | `#C5A77B` | `.d-ochre` |

*(Matplotlib SVGs and original raster crops stay on light paper in light mode and receive a softened plate in dark mode via `theme-morandi.css`—never invert statistical charts.)*

---

## 2. Source Figure Forms, Numbering & `data-src` Coverage

Every source figure must appear **visibly** (in body or inside `<details class="deep-dive">`)—there is **no "omit" option**. Divide labor by **Fidelity vs. Explanation**:

| Figure Category | Presentation Form | Title Format (ZH / EN) |
|---|---|---|
| **Data-backed quantitative chart** | Redraw in Morandi Matplotlib SVG to replace original (may split crowded panels into `a`/`b`) | `原文图 N（重绘）· ...` / `Figure N (redrawn) · ...` |
| **Complex architecture / mechanism** (3D stacks, nested residual loops, dense schematics) | High-DPI crop (`220–300 DPI`) + **path-anchored `.fig-guide` reading breakdown** (portrait figures `H/W ≳ 1` use `.fig-split` left-image / right-guide; wide landscape figures stack image above `.fig-guide`; never use unordered `.sm-grid` cards to summarize prose instead of walking the figure) | `原文图 N · ...` / `Figure N · ...` |
| **Simple schematic / small illustration** | High-DPI crop in compact frame (`.fig-frame.is-compact`, max `560px`) | `原文图 N · ...` / `Figure N · ...` |
| **Photos / micrographs / waveforms / 100+ pt un-tabulated curves** | High-DPI crop (`220–300 DPI`) with `<img class="fig-img fig-zoomable">` | `原文图 N · ...` / `Figure N · ...` |
| **Complementary pair** | Combined multi-panel keeping each subfigure visible | Label every subfigure with its original number |
| **Secondary / appendix visuals** | High-DPI crop inside `<details class="deep-dive">` | `原文图 N · ...` / `Figure N · ...` |
| **Added reading-aid diagram** (panorama, comparison, walkthrough) | Custom `.diag-svg` (or analytical Matplotlib SVG) | `图解 A · ...` / `Explainer A · ...` |

- **Path-anchored reading guide (`.fig-guide`) standard for complex original crops**: Never summarize the body prose in 3–4 unordered `.sm-grid` cards. Instead, place a `.fig-guide` (inside `.fig-split` beside portrait figures, or directly inside `.fig-frame` below wide landscape figures) meeting three rules:
  1. **Follow visual flow**: Order entries along the diagram's actual reading path (bottom-to-top or left-to-right), covering start-to-finish without dropping input/output layers;
  2. **Anchor every core label**: In cross-language monographs, explicitly map `<span class="fg-term">Original Label</span> → <strong>中文译名</strong>` so readers who do not know the embedded English terms can trace every box directly;
  3. **Decode non-verbal graphic cues**: Explicitly explain symbols, loops, and routing arrows (e.g., `⊕`, `N×`, bypass residual lines, split/merged arrow sources, 3D stacked brackets `h`) using `<li class="fg-sym">` where helpful.
- **Mandatory `data-src`**: Add `data-src="fig1"`, `data-src="tab2"`, or `data-src="fig3 fig4"` (matching `source_inventory.json` IDs) on the `<figure>`, `.table-wrap`, or `<details class="deep-dive">` accounting for each source figure/table so `qa_static.py --inventory` can verify coverage.
- **Cropping pipeline**: `extract_pdf.py --crop PAGE:x0,y0,x1,y1:name.png` (`220–300 DPI`) → `assemble_html.py --img TOKEN=path` (auto WebP/PNG).

---

## 3. Five Diagram Archetypes & Vector Craft (`.diag-svg`)

1. **Whole-Paper Panorama** (`data-jump="#sec-..."`): 10–14 concise nodes mapping the paper's arc (pipeline, taxonomy tree, or theorem DAG); never 30+ node spiderwebs.
2. **Parallel Dual-Track Comparison**: Default for structurally different baseline vs. proposed flows (1-glance contrast + print fidelity).
3. **Mechanism / Data-Flow Pipeline**: Annotate tensor shapes, units, equation links, and bottlenecks; wire `.fig-steps` + `.step-vals` for concrete step-throughs.
4. **Decision Tree / Cohort Flow**: Orthogonal routing for conditional thresholds or sample screening → exclusions (incl. footnotes) → arms → metrics.
5. **Same-Coordinate View Toggle (`data-set-view`)**: ONLY for overlapping diffs sharing identical axes/topology.

**Craft rules**: ≥32–44px gaps between stage boxes; anchor arrows at box edge midpoints; route feedback loops outside boxes; use Unicode subscripts (`xₜ`, `x̂ₜ`) since KaTeX ignores `<svg>`; match visual grouping and connectors strictly to real topology; separate panorama vs. close-up granularity; write labels in target language (keeping standard acronyms/variables).

---

## 4. Declarative Interactive Toolkit (Zero Bespoke JS)

### 4.1 Flowchart Stepper (`.fig-steps`)
Opens on the **final state (`N / N`)**; Play replays `1 → N`. Stage cards carrying non-zero `data-step` inside `.fig-steps` SVGs automatically get hover preview (120ms debounce; updates `.step-vals`, `.steps-notes`, and preview badge without moving the slider or dimming `.step-vals`) and click-to-jump (or Enter/Space; multi-step cards like `0 5 6` cycle `5 ↔ 6`; does not open Lightbox or hijack `[data-jump]`), synced live inside the zoomed Lightbox. Use `class="step-only" data-step="k"` for transient badges; cap `data-flow` to ≤1 figure/page.

```html
<figure class="fig-frame fig-steps" id="fig-walk" data-lightbox-title="图解 B · 流水线与微例推演">
  <div class="fig-header">
    <div class="fig-title">图解 B · 流水线与微例推演</div>
    <div class="fig-actions"><button class="btn-zoom" type="button" data-zoom-btn>⤢ 放大查看</button></div>
  </div>
  <div class="fig-svg-wrap fig-zoomable">
    <svg class="diag-svg" viewBox="0 0 860 260" role="img" aria-label="方法流水线图">
      <g class="svg-node" data-ref-node="enc" data-step="0 1">
        <rect class="d-teal" x="24" y="50" width="180" height="72" rx="10" stroke-width="1.6"/>
        <text x="114" y="82" text-anchor="middle" font-size="14" font-weight="700">阶段 1 · 预测</text>
        <text class="d-muted" x="114" y="104" text-anchor="middle" font-size="11.5">式 (1): x̂ₜ = Σ aₖ xₜ₋ₖ</text>
      </g>
      <path class="d-edge-hot" pathLength="1" data-step="2" data-flow="teal" data-every="1300" d="M204 86 H292"/>
      <g class="step-vals" font-family="monospace" font-size="12">
        <text data-step="1" x="114" y="152" text-anchor="middle">输入: [120, 122, 125]</text>
        <text data-step="2" x="114" y="152" text-anchor="middle">预测 x̂₃ = 124 → 残差 e₃ = +1</text>
      </g>
      <g class="flow-dots" aria-hidden="true"></g>
    </svg>
  </div>
  <ol class="steps-notes">
    <li><strong>第 1 步：</strong>读取前序样本并按式 (1) 计算预测值。</li>
    <li><strong>第 2 步：</strong>计算残差 e₃ = +1 并送入熵编码器。</li>
  </ol>
  <figcaption class="fig-caption">悬停阶段卡片预览中间量；点击卡片或播放条逐步推演。</figcaption>
</figure>
```

### 4.2 View Toggle (`data-set-view`), Linking (`data-ref`), Symbols (`data-sym-table`) & Tables (`data-interactive`)
- **`data-set-view`**: Put `data-view="after"` on `<figure>`, `.view-switch` buttons with `data-set-view="before"|"after"`, and matching `[data-view-panel="before"|"after"]` SVG `<g>` or wrapper `<div>`s. Never add inline `style="display:none"` or `hidden` on `[data-view-panel]`.
- **`data-ref` / `data-ref-node`**: Pair prose `<span class="ref-term" data-ref="k">` with SVG `data-ref-node="k"`. Prose hover highlights SVG only (does not trigger stepper preview).
- **`<table data-sym-table>`**: Columns `[Symbol, Domain/Unit, Meaning]` (optional `tr[data-sym-def="T, T_win"]`). Auto-binds hover quick-cards onto rendered KaTeX (`$$...$$` and `$...$`) plus draggable `Σ 符号` floating sheet.
- **`<table data-interactive>`**: Inside `.table-wrap[data-src="tab1"][data-table-title="原文表 1 · ..."]`. Auto-adds search, row count, CSV copy, and sort (pins `.row-total`; skips merged headers or `<5` rows). Add `th[data-better="high"|"low"]` **only** on comparable common-scale performance metrics.
- **Drawers, Notes & Jumps**: `<details class="deep-dive"><summary>标题 <span class="pill">附录</span></summary><div class="deep-dive-body">...</div></details>`; `<div class="aside-note"><strong>注：</strong>...</div>`; `<a class="xref" href="#eq-1">式 (1)</a>`; `data-jump="#sec-02"`.

---

## 5. Bespoke Interactive Contract (`--extra-js`)

1. **Reuse Infrastructure**: Never re-implement TOC, Lightbox, interactive tables, KaTeX symbol cards, highlights/marginalia, `.fig-steps`, or `data-set-view`.
2. **Freeform Domain Visuals (No Forced Dashboard Cage)**: Craft bespoke `--extra-js` visuals whenever backed by an explicit formula, model, or measured parameter grid (or requested by the user). `.live-card` is an optional convenience shell, never mandatory. Compact scoped `<style>` with a unique prefix (e.g., `.lab-*`) is allowed using **Morandi CSS variables** only so Light/Dark modes stay harmonious; zero external libraries.
3. **Three Pure UX Laws**:
   - **Question-Driven**: Answers a specific body question, displays a 1-sentence "what to observe" cue, and states its takeaway in prose for static/print readers.
   - **Zero Dead Controls**: Initializes at the paper's actual setup **and** visibly updates on every control interaction. If a parameter is invariant in the paper's default mode (e.g., scaled $d_k$), render the unscaled vs. scaled contrast side-by-side so the invariance itself becomes immediately visible.
   - **Unmistakable Controls**: Style mode switches as clearly clickable segmented buttons/radios with distinct active/inactive states and keyboard support—never static-looking badges.

---

## 6. Canonical Shell, Native Classes & Built-In `widgets.js` Features

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
        <li><a href="#sec-01">01 · 引言</a></li>
      </ul>
    </nav>
  </aside>
  <main class="article-main">...</main>
</div>
```

### Morandi Native Class Quick-Reference *(use directly—no need to read `theme-morandi.css`)*

| Component | Class Structure (`assets/theme-morandi.css`) |
|---|---|
| **Hero & Highlights** | `.hero-card` → `.hero-accent-bar` + `.hero-body` (`.hero-kicker`, `h1`, `.hero-subtitle`, `.meta-ribbon` → `.meta-item` `span`/`strong`) + `.kpi-grid` *(elastic 2–4 cols)* → `.kpi-cell` (`.kpi-num` + `.kpi-teal`/`.kpi-sage`/`.kpi-ochre`/`.kpi-terra`, `.kpi-label`, `.kpi-sub`) |
| **Core Overview** | `.exec-summary` → `.exec-summary-title` + `<p>` + `<ul><li>` |
| **Headings** | `<section id="sec-01">` → `<h2><span class="sec-idx">01</span> Title <span class="src-sec">§2</span></h2>`; `<h3>Sub <span class="src-sec">§2.1</span></h3>` |
| **Equation / Aside** | `.eq-box[id]` → `.eq-label` + `$$...$$` + optional `.eq-note`; in-place note `.aside-note` |
| **Figure Frame** | `<figure class="fig-frame [is-compact] [fig-steps]" id="fig-1" data-src="fig1" data-lightbox-title="...">` → `.fig-header` (`.fig-title`, `.fig-actions` → `button.btn-zoom[data-zoom-btn]`) + `.fig-svg-wrap.fig-zoomable` (or `img.fig-img.fig-zoomable`) + `figcaption.fig-caption` |
| **Figure Reading Guide** | Portrait original: `.fig-split` → `.fig-svg-wrap` (left) + `.fig-guide` (right); Landscape original: `.fig-guide` directly below `.fig-svg-wrap`. Inside `.fig-guide`: `.fig-guide-head` + `ol.fig-guide-list` → `li[.fg-sym]` (`span.fg-step` + `span.fg-term` + `strong` + concise role/arrow explanation) |
| **Table Frame** | `.table-wrap[id][data-src][data-table-title]` → `table[data-interactive\|data-sym-table][.compact-table]` (`.num`, `tr.row-total`, `.delta-pos`/`.delta-neg`/`.delta-neu`, `th[data-better]`) |
| **Case / Limits / Transfer** | `.sm-grid` *(2–3 col)* or `.sm-grid.is-vertical` *(stacked wide)* → `.sm-card` (`.sm-head` → `.sm-name`/`.sm-k`, `.sm-desc`); `.audit-grid` → `.audit-card` (`.sev-high`/`.sev-mid`/`.sev-scope`/`.sev-sys`, `.audit-title`, `<p>`); `.transfer-grid` → `.transfer-card` (`.transfer-num`, `<h4>`, `<p>`) |
| **Explorer / Sources** | Optional `.live-card` (`.live-head`, `.live-controls` → `.live-slider-row`, `.live-readout`); `.sources-box` (`<h3>` + `<ul>`); `.pill` + `.pill-teal`/`.pill-sage`/`.pill-ochre`/`.pill-terra` |

**Built-in automatically via `widgets.js`**: Masthead Light/Dark toggle, `A−`/`A+`, draggable `Σ 符号` floating sheet, filtered `✎ 笔记 N` drawer + Markdown export; frameless sidebar with `本篇插图`/`本篇表格` drawers & reading progress; KaTeX-safe 3-color highlighter + wide-screen marginalia (`≥1340px`); 120fps pan/zoom Lightbox preserving `.fig-steps` & `data-set-view`; clean `@media print`.
