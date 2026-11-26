# Visual Design System, Vector Diagrams & Interactive Components

All visuals must harmonize with `assets/theme-morandi.css` and `assets/widgets.js`.

## 1. Warm Paper Morandi Palette Contract

Use the exact shared tokens across HTML, custom SVGs, and Matplotlib plots so the entire document reads as one cohesive publication:

| Role | Hex | Usage |
|---|---|---|
| Warm Paper Ground | `#F7F5F0` | Page background (`--paper`) |
| Card Surface | `#FFFFFF` / `#FBF9F5` | Figures, tables, hero, tinted callouts |
| Primary Ink / Body | `#1C1917` / `#292524` | Headings, prose, SVG primary text |
| Muted Ink / Hairlines | `#6B655E` / `#D2CBC0` | Axis ticks, captions, subtle dividers |
| Scholarly Teal (Primary) | `#265867` (soft `#EEF5F7`) | Core proposed method, primary highlight, links |
| Muted Sage (Positive) | `#2A7A68` (soft `#EFF8F5`) | Lossless closure, positive gains, verified hits |
| Muted Terracotta (Trade-off / Risk) | `#C85A3F` (soft `#FDF3F0`) | Regressions, escape spikes, shifts, critical warnings |
| Warm Ochre (Caution / Inference) | `#A66E38` (soft `#FDF7EE`) | Unablated mechanisms, inference notes, outliers |

## 2. Precision Vector SVG Craft Rules

1. **Draw the mechanism, not empty boxes**: Embed domain-specific mini visuals inside SVG cards—mini histograms showing gaps vs packed bins, bit-plane stacks, 2×2 causal pixel neighborhoods, tensor dimension blocks, or attention/routing paths.
2. **Zero text/line collisions**:
   - Keep ≥26–40px horizontal arrow gaps between stage boxes so edge labels (`yₜ`, `标准码流`) never touch box borders.
   - Route auxiliary/side-information dashed tracks cleanly below or above main boxes—never let a dashed path cut through a translucent label box.
   - Use crisp Unicode subscripts/superscripts inside SVG `<text>` (`xₜ`, `yₜ`, `hᵗ`, `hᵗ⁺¹`, `Iₙ₋₁`, `x̂ₜ`) instead of raw ASCII LaTeX braces (`I_{n-1}`), because KaTeX ignores `<svg>` blocks.
3. **Target language consistency**: For Chinese reports, every diagram title, stage header, and annotation must be in Simplified Chinese (preserving standard English acronyms like `JPEG-2000`, `LOCO-I`, `DWT` and math variables).
4. **No duplicate overview diagrams**: If a conceptual intuition figure appears under the Executive Summary, keep it focused on the *problem-vs-solution intuition*, while the Section 2 architecture SVG focuses on *exact formula-level branches and data paths*.
5. **Interactive Prose-to-SVG Linking (`data-ref`)**:
   - Mark 3–6 key concepts in prose with `<span class="ref-term" data-ref="node-id">...</span>`.
   - Give the corresponding SVG `<g>` group `class="svg-node" data-ref-node="node-id"`. `assets/widgets.js` automatically dims non-matching nodes and highlights matching ones on hover/focus.

## 3. Adaptive Interactive Components

Choose only the interactive components that genuinely clarify the paper:
- **Universal Fullscreen Pan/Zoom Lightbox (Always ON for every figure)**:
  - Wrap every figure in `<figure class="fig-frame" data-lightbox-title="...">` with `<button class="btn-zoom" type="button" data-zoom-btn>⤢ 放大查看</button>` inside `.fig-actions` and class `fig-zoomable` on `.fig-svg-wrap` (or `img.fig-img`).
  - `assets/widgets.js` automatically injects the full-screen Lightbox supporting cursor-anchored wheel zoom (`50%–500%`), pointer-captured drag panning, double-click zoom/reset, keyboard `+`/`-`/`0`/`ESC`, and two-stage 120fps GPU + debounced crisp vector re-rendering.
- **Interactive Stepper Player + Custom Sandbox (Use for discrete algorithms, codecs, protocols, or state machines)**:
  - Open on the completed final state (`N / N`); Play replays `1 / N → N / N`.
  - Pair with a small custom-input sandbox so readers can test edge cases and see live metrics + lossless/invariant verification.
- **Small Multiples `.sm-grid` (Use for 3–4 contrasting regimes, failure modes, or extreme exemplars)**:
  - Same mini SVG dimensions and visual scale across cards so differences pop immediately.
- **Interactive Original Table Explorer `.explorer-card` (Use when tables have ≥10 rows or multiple methods/splits)**:
  - Provide codec/metric tabs, group filter pills, live search box, right-aligned `tabular-nums`, and color-coded delta columns. Never put `$...$` inside dynamically generated `thead.innerHTML`; use HTML `<i>K</i>` / `<sub>` directly.

## 4. Layout & Performance Non-Negotiables

- **Zero Google Fonts `<link>` tags** (prevents network stall and CJK font slice jank on local HTML open).
- **Zero `backdrop-filter: blur(...)`** (prevents GPU frame drops when scrolling over dense inline SVGs).
- **Keep `content-visibility: auto`** on `.fig-frame` and `.explorer-card` (already built into `assets/theme-morandi.css`).
- **Clean left sidebar**: Sticky TOC card only; no meta-QA cards.
- **Balanced grids**: Use 4-column flush KPIs, 4-column Small Multiples, 2×2 Evidence Boundary cards, and 3-column Engineering Transfer cards so no awkward orphan cards appear on desktop (`1440px`).
