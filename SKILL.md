---
name: paper-deep-reader
description: >-
  Transform any research paper PDF (local file, Zotero item, or arXiv/DOI paper) into a standalone,
  self-contained interactive HTML deep-reading monograph with Warm Paper Morandi magazine layout
  (Light & Warm Dark modes), verified formulas (KaTeX, optional air-gapped offline bundle),
  interactive flowcharts & worked-example steppers, publication-grade Matplotlib plots, symbol
  quick-cards, sortable data tables, local notes export, and a 120fps vector pan/zoom lightbox.
  Explicit invocation only — use when the user explicitly names paper-deep-reader or specifically
  requests generating an interactive HTML deep-reading page for a research paper. Do NOT auto-trigger
  for quick paper questions, brief summaries, or ordinary chat discussions.
license: MIT
metadata:
  version: "1.3.2"
---

# Paper Deep Reader (`paper-deep-reader`)

Produce a publication-grade, single-file interactive HTML deep-reading monograph from a research paper PDF. The output combines the calm editorial readability of an academic journal, the analytical rigor of a peer-level close reading, structured flowcharts, and a zero-dependency declarative interactive toolkit.

## Input Adapters (Zero Hard Dependencies)

Resolve the source paper using the lightest available input path:
1. **Local PDF path (default, zero extra setup)**: Read the user-supplied `.pdf` directly.
2. **Built-in zero-dependency fetcher (`scripts/fetch_paper.py`, Python stdlib only)**:
   - **arXiv ID / URL**: `python scripts/fetch_paper.py --source 1706.03762 --out <workdir>` — fetches arXiv metadata and downloads the PDF automatically.
   - **DOI (Open Access)**: `python scripts/fetch_paper.py --source 10.xxxx/... --out <workdir>` — retrieves authoritative Crossref metadata and searches legal Open-Access PDFs (OpenAlex, Europe PMC, Semantic Scholar, optional Unpaywall via `--email`/`UNPAYWALL_EMAIL`, Crossref links). If the paper is paywalled with no legal OA PDF, the script saves `paper_meta.json` and exits with code `2` (`PAYWALL_OR_NO_OA_PDF`): **stop and ask the user for a local PDF or Zotero item**—never fabricate formulas/tables from an abstract alone and never use unauthorized download sources.
   - **Zotero 7+ Local API (zero-plugin)**: `python scripts/fetch_paper.py --zotero-query "<title>" --out <workdir>` (or `--zotero-key <KEY>`) queries `127.0.0.1:23119` (compatible with Zotero 7 / 8 / 9 / 10) and automatically resolves the local PDF path via `/file` (even for custom data directories) alongside metadata and notes.
3. **Optional `zotero-cli` / `zotero-mcp` / paper-search MCP**: If already installed in the host environment, you may use them directly to retrieve metadata, notes, and local PDF paths.

Always put intermediate files (extracted text, PDF page PNGs, plotting scripts, QA screenshots) in a dedicated temporary task directory (respecting any workspace temp-directory rule such as `temp/<task>/`); never litter the repository root.

---

## 4-Stage Workflow

### Stage 1 · Source Grounding & Visual Fidelity Verification
1. Run `scripts/extract_pdf.py --pdf <paper.pdf> --out <workdir> --pages <all-or-key-pages> --dpi 200` to extract full text and render key pages (all pages for short papers ≤6 pages; pages containing equations, tables, footnotes, and core figures for longer papers) to PNGs.
2. Visually inspect the rendered page PNGs (`read_file`) to verify every equation, symbol, table value, footnote, and figure caption. Never rely solely on raw PDF text extraction for multi-column tables or formulas.
3. If the paper reports summary totals or grouped metrics across a table, write a brief Python assertion script to cross-check arithmetic consistency and compute key secondary metrics (e.g., absolute vs relative gaps, outlier sensitivity).

### Stage 2 · Academic Monograph Synthesis & Silent Deep-Audit
Read `references/academic-writing-guide.md` before drafting.
- **Narrative & Tone**: Write in clear, rigorous, fluent academic prose matching the user's language (default Simplified Chinese with exact English technical terms preserved). Follow a natural academic reading order (Hero & Executive Summary → Research Background & Problem → Method & Equations → Experimental Analysis → Interactive Original Data → Design Analysis & Evidence Boundaries → Engineering Insights & Transfer).
- **Silent Deep-Audit Checklist** (apply rigorously in the background without polluting the UI with meta-QA badges):
  1. **Design Trade-offs**: Pinpoint where prior methods fail, how the proposed mechanism resolves the failure, and what cost it accepts.
  2. **Equations + Concrete Worked Example**: Define every symbol's domain and physical meaning in a `<table data-sym-table>` symbol table (powering automatic hover quick-cards across the page), explain the physical intuition before/after key formulas, and carry at least one concrete small-number micro-example end-to-end (including inverse/verification closure where applicable).
  3. **Component Role Hierarchy**: Distinguish indispensable core mechanisms from conditional gains, unablated choices, and prototype simplifications.
  4. **Evidence Boundary Check**: Cross-check body claims against tables, figures, and footnotes (downplayed regressions, weighted-average skews, un-tabulated claims, sample truncations, unmeasured compute/memory overhead). Keep paper facts clearly separated from mechanism inferences through natural academic prose rather than noisy stamp badges.

### Stage 3 · Structured Flowcharts, Visual Layering & Declarative Interactivity
Read `references/diagram-and-layout-guide.md` and `references/plotting-guide.md` before generating figures.
Do NOT force heavy custom JS simulators where they don't fit—instead, leverage the **zero-JS declarative interactive engine** built into `assets/widgets.js` so every paper gets rich, calm, human-readable interactivity with minimal extra code.

| Paper Archetype | Recommended Flowchart + Declarative Interactive Stack (Pick What Clarifies) |
|---|---|
| **Discrete Algorithm / State Machine / Protocol** | Before/After mechanism toggle (`data-set-view`) + End-to-end pipeline / decision flowchart upgraded with worked-example stepper (`.fig-steps` + `data-step` + `.step-vals`) + Bidirectional `data-ref` + Symbol quick-cards (`data-sym`) + Quantitative plots + `<table data-interactive>` |
| **Deep Learning / Architecture / Systems** | Before/After mechanism toggle (`data-set-view`) + Hierarchical data-flow flowchart with tensor shapes & equation tags (`.fig-steps` or `data-ref` linked) + Optional 1–3 slider `.live-card` (only if backed by an explicit formula or empirical ablation grid) + Small Multiples + Quantitative plots + `<table data-interactive>` |
| **Theory / Physics / Experimental / Empirical Science** | Experimental protocol / sample-filtering flowchart (PRISMA/CONSORT style) or causal/dependency SVG + Derivation & worked example (tuck lengthy proofs into `<details class="deep-dive">`) + Symbol quick-cards (`data-sym`) + Error-budget / quantitative plots + `<table data-interactive>` |

Three orthogonal visual tracks (all aligned to the Warm Paper Morandi palette in `assets/theme-morandi.css` and `assets/morandi-academic.mplstyle`):
1. **Structured Reading Flowcharts & Precision Vector Diagrams (`class="diag-svg"`)**:
   - Include **at least 1 substantive flowchart or structural mechanism diagram** matched to the paper (Method/Data-Flow Pipeline, Decision/Routing Tree, Experimental Protocol Flow, or Same-Coordinate Before/After Diff; use a Theorem Dependency or Taxonomy SVG for pure proof/survey papers).
   - Draw the real mechanism (tensor shapes, equation numbers, branch thresholds, sample counts, worked-example numbers)—never empty labeled boxes. Use `.diag-svg` helper classes (`.d-card`, `.d-teal`, `.d-sage`, `.d-terra`, `.d-ochre`, `.d-edge`, `.d-edge-hot`) so diagrams adapt cleanly to both Warm Light and Warm Dark modes.
   - Use **target-language labels** (e.g., 100% Simplified Chinese with standard English acronyms/symbols for Chinese reports).
   - Wire declarative interactions right into the HTML/SVG with zero bespoke JS: `.fig-steps` + `data-step` for step-by-step worked-example replay, `data-set-view`/`data-view-panel` for Before/After toggling, bidirectional `data-ref`/`data-ref-node` linking, `data-sym` hover quick-cards backed by `<table data-sym-table>`, `<details class="deep-dive">` for lengthy proofs/excerpts, `<a class="xref" href="#...">` for jump-and-return cross-references, and `<table data-interactive>` for sortable/filterable tables.
   - Optional `.live-card` parameter slider (1–3 sliders): include **only** when grounded in an explicit analytical equation or measured parameter grid from the paper—never invent speculative curves.
2. **Quantitative Statistical Charts (`assets/morandi-academic.mplstyle`, Matplotlib SVG) vs. Original Figure Crops**:
   - Treat every chart as a **visual argument** defending one clear sentence. Whenever numbers exist in tables or prose—or when a small-N original plot uses poor scaling (e.g., linear axis flattening >10× baselines) or jarring default colors—redesign and redraw it as a Morandi vector SVG using **one consolidated plotting script**, then visually inspect every rendered PNG in parallel via `read_file`.
   - Reserve high-DPI (`220–300 DPI`) original PDF crops strictly for genuinely un-redrawable evidence: photographs, micrographs, dense high-frequency raw waveforms, or 100+ point un-tabulated curves whose original rendering is already clean and legible.
   - Use **dual-panel** layout only for concise, low-density comparisons (≤8 categories per panel); **split dense charts (≥15 samples or dense annotated scatters) into separate full-width SVGs** with bridging prose between figures—never stack multiple figures back-to-back without explanatory text.
3. **Zero-Dependency Self-Contained Assembly**:
   - Write the page body fragment (`body.html`) using semantic classes from `assets/theme-morandi.css`. `assets/widgets.js` automatically provides: Masthead Light/Dark theme (`Warm Paper` ↔ restrained `Midnight Slate`) & font-size controls, frameless left outline sidebar with collapsible `本篇图表` / `核心公式` drawers and reading progress, bidirectional `data-ref` linking, live-KaTeX `data-sym` hover quick-cards, `.fig-steps` steppers & flow dots, `data-set-view` toggles, `<table data-interactive>` sorting/filtering/extrema/CSV, xref jump-back pill, unified cross-node/KaTeX-safe selection & figure notes rendered as aligned right-margin marginalia on wide screens (with top-bar Markdown export), 120fps vector Lightbox, and clean `@media print`.
   - Run `scripts/assemble_html.py` to bundle CSS, JS, cleaned/ID-prefixed SVGs, and any optional `--extra-js` into one standalone `.html` file. Pass `--offline-katex` when the user requests 100% air-gapped offline KaTeX (caches and inlines WOFF2-only fonts once).
   - **Performance guardrails**: Never add render-blocking Google Fonts `<link>` tags or `backdrop-filter: blur(...)`; keep `ignoredTags: ['script','noscript','style','textarea','pre','code','svg']` in KaTeX auto-render; escape `<` as `&lt;` inside KaTeX math.

### Stage 4 · Dual-Layer QA & Delivery
1. **Static QA**: Run `python scripts/qa_static.py <output.html>` and fix every `FAIL` (unreplaced tokens, KaTeX brace/angle errors, duplicate SVG IDs, forbidden QA-noise/AI-cliché strings, broken zoom buttons / stepper / view-switch bindings, JS syntax errors via `node --check`).
2. **Visual Browser QA**: Run `python scripts/qa_browser_shots.py --html <output.html> --out <workdir>/qa_shots`, inspect the rendered `1440px` PNG slices via `read_file`, fix any layout/wrapping/clipping/spacing issue, and re-verify.
3. **Deliver HTML only**: Output the standalone `.html` file without overwriting earlier versions. Do NOT export PDF unless the user explicitly asks for one.

---

## Anti-Patterns to Never Ship

- **Background QA scaffold leaking into reader UI**: Never render a sidebar "核验口径" box, masthead "全量复核" badge, or repetitive `[原文核验事实]` / `校验通过` stamps across paragraphs and captions. Place a concise 1–2 line source/scope note in the bottom `.sources-box` only.
- **Whiteboard gimmicks or AI clichés**: Never use gimmicky translated section headers ("赌注 / 解剖台 / 承重墙") or filler phrases ("值得注意的是 / 至关重要 / 深入探讨 / 奠定基石").
- **Fabricated interactive widgets or empty box flowcharts**: Never invent fake curves for a slider when no formula/grid exists, and never draw boxes with only names and no data shapes, thresholds, or equation links.
- **Cramped dense multi-panel plots or stacked figures**: Never squeeze two 20+ point charts side by side into an `800px` column, and never place two `<figure>` cards back-to-back without bridging prose.
- **Unverified numbers**: Never copy a figure or table value from memory or noisy OCR without checking the rendered PDF page PNG.
