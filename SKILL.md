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
  version: "1.4.1"
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
1. Verify once which Python executable has `pymupdf`, `matplotlib`, `numpy`, and `PIL`, then reuse that same interpreter for the entire run. Run `scripts/extract_pdf.py --pdf <paper.pdf> --out <workdir>` (defaults to `--pages all --dpi 150`), which extracts full text, writes `page_index.json`, prints a compact `PAGE_MAP`, and renders **every page** to PNG so no body prose, conclusion, footnote, or appendix is ever omitted. For un-redrawable original figures (photos/waveforms), use `--crop PAGE:x0,y0,x1,y1:filename` (`240 DPI`) instead of writing ad-hoc crop scripts.
2. Visually inspect all body, conclusion, and appendix page PNGs in **one parallel batch** (or 2 batches for long papers) via `read_file` to verify every equation, symbol, table value, footnote, and figure caption. Only on long papers where `pdf_text.txt` confirms a page is **100% pure bibliography entries** (zero body prose, conclusions, footnotes, or appendix text) may you skip visually inspecting that pure-reference page; never read PNGs one by one.
3. If the paper reports summary totals or grouped metrics across a table, write a brief Python assertion script to cross-check arithmetic consistency and compute key secondary metrics (e.g., absolute vs relative gaps, outlier sensitivity).

### Stage 2 · Academic Monograph Synthesis & Silent Deep-Audit
Read `references/academic-writing-guide.md` before drafting.
- **Narrative & Tone**: Write in clear, rigorous, fluent academic prose matching the user's language (default Simplified Chinese with exact English technical terms preserved). Follow a natural academic reading order (Hero & Executive Summary → Research Background & Problem → Method & Equations → Experimental Analysis → Interactive Original Data → Design Analysis & Evidence Boundaries → Engineering Insights & Transfer).
- **Silent Deep-Audit Checklist** (apply rigorously in the background without polluting the UI with meta-QA badges):
  1. **Design Trade-offs**: Pinpoint where prior methods fail, how the proposed mechanism resolves the failure, and what cost it accepts.
  2. **Equations, On-Demand Dissection & Semantic Symbol Table**: Preserve the source paper's own equation numbering (use descriptive semantic labels—never fabricated `Eq. (1)` numbers—for unnumbered prose relations) and introduce every `.eq-box` smoothly in prose. Add a concise 1–3 line `.eq-note` inside `.eq-box` **only** when a core formula contains new local notation or non-obvious structural factors (never force a bloated boilerplate onto simple equations). Build a `<table data-sym-table>` covering both recurring cross-section quantities **and** key mathematical objects from core equations even if they appear once (excluding trivial indices and throwaway dummy variables), wired to `data-sym` hover quick-cards; carry at least one concrete small-scale worked example end-to-end.
  3. **Component Role Hierarchy**: Distinguish indispensable core mechanisms from conditional gains, unablated choices, and prototype simplifications.
  4. **Evidence Boundary Check**: Cross-check body claims against tables, figures, and footnotes (downplayed regressions, weighted-average skews, un-tabulated claims, sample truncations, unmeasured compute/memory overhead). Keep paper facts clearly separated from mechanism inferences through natural academic prose rather than noisy stamp badges.

### Stage 3 · Structured Flowcharts, Visual Layering & Declarative Interactivity
Read `references/diagram-and-layout-guide.md` and `references/plotting-guide.md` before generating figures.
Do NOT force heavy custom JS simulators where they don't fit—instead, leverage the **zero-JS declarative interactive engine** built into `assets/widgets.js` so every paper gets rich, calm, human-readable interactivity with minimal extra code.

| Paper Archetype | Recommended Diagram + Declarative Interactive Stack (Pick What Clarifies) |
|---|---|
| **Algorithms / Systems / Signal & Data Processing** | Whole-paper logic panorama (`data-jump` clickable) + Parallel baseline-vs-proposed comparison (or `data-set-view` only for true same-coordinate diffs) + Method pipeline with worked-example stepper (`.fig-steps` + `.step-vals`) + Bidirectional `data-ref` + Symbol quick-cards (`data-sym`) + Quantitative plots + `<table data-interactive>` |
| **Machine Learning / Architectures / Modeling** | Whole-paper logic panorama (`data-jump` clickable) + Hierarchical architecture/data-flow diagram with shapes & equation links (`.fig-steps` or `data-ref` linked) + Optional 1–3 slider `.live-card` (only if backed by an explicit formula or measured grid) + Small Multiples + Quantitative plots + `<table data-interactive>` |
| **Experimental / Empirical / Physical / Biomedical Science** | Whole-paper causal or protocol panorama (`data-jump` clickable) + Experimental cohort/sample-filtering flow + Key derivation/error-budget analysis (tuck lengthy proofs into `<details class="deep-dive">`) + Symbol quick-cards (`data-sym`) + Quantitative plots / high-DPI original evidence crops + `<table data-interactive>` |
| **Theory / Proof / Survey / Comparative Benchmarks** | Whole-paper hierarchical mind map / taxonomy tree OR Assumption→Lemma→Theorem dependency DAG (`data-jump` clickable) + Structured comparison matrices (`<table data-interactive>`) + Focused worked counterexamples/cases |

Three orthogonal visual tracks (all aligned to the Warm Paper Morandi palette in `assets/theme-morandi.css` and `assets/morandi-academic.mplstyle`):
1. **Structured Whole-Paper Maps & Precision Vector Diagrams (`class="diag-svg"`)**:
   - Pair a **whole-paper logic panorama or structured mind map** right after Executive Summary (10–14 readable nodes connecting Problem → Design/Taxonomy → Findings → Boundaries, with clickable `data-jump="#sec-..."` anchors) with a zoomed-in **Section 02 mechanism/protocol diagram**—giving distinct bird's-eye vs. close-up granularity without duplication.
   - For baseline-vs-proposed comparisons whose structures differ, default to **parallel simultaneous layout** (upper/lower or side-by-side tracks) rather than hiding half behind a toggle; reserve `data-set-view` toggles for true same-coordinate or high-overlap views.
   - Draw real substance (shapes, units, equation links, thresholds, sample counts, worked-example values)—never empty labeled boxes. Use `.diag-svg` helper classes (`.d-card`, `.d-teal`, `.d-sage`, `.d-terra`, `.d-ochre`, `.d-edge`, `.d-edge-hot`) so diagrams adapt cleanly to both Warm Light and Midnight Slate Dark modes.
   - Use **target-language labels** (e.g., Simplified Chinese with standard English acronyms/symbols for Chinese reports).
   - Wire declarative interactions right into the HTML/SVG with zero bespoke JS: `data-jump` clickable overview nodes, `.fig-steps` + `data-step` for step-by-step worked-example replay, optional `data-set-view`/`data-view-panel` for same-coordinate toggles, bidirectional `data-ref`/`data-ref-node` linking, `data-sym` hover quick-cards backed by `<table data-sym-table>`, `<details class="deep-dive">` for lengthy proofs/excerpts, `<a class="xref" href="#...">` for jump-and-return cross-references, and `<table data-interactive>` for sortable/filterable tables.
   - Optional `.live-card` parameter slider (1–3 sliders): include **only** when grounded in an explicit analytical equation or measured parameter grid from the paper—never invent speculative curves.
2. **Quantitative Statistical Charts (`assets/morandi-academic.mplstyle`, Matplotlib SVG) vs. Original Figure Crops**:
   - Treat every chart as a **visual argument** defending one clear sentence. Whenever numbers exist in tables or prose—or when a small-N original plot uses poor scaling (e.g., linear axis flattening >10× baselines) or jarring default colors—redesign and redraw it as a Morandi vector SVG using **one consolidated plotting script**, then visually inspect every rendered PNG in parallel via `read_file`.
   - Reserve high-DPI (`220–300 DPI`) original PDF crops strictly for genuinely un-redrawable evidence: photographs, micrographs, dense high-frequency raw waveforms, or 100+ point un-tabulated curves whose original rendering is already clean and legible.
   - Use **dual-panel** layout only for concise, low-density comparisons (≤8 categories per panel); **split dense charts (≥15 samples or dense annotated scatters) into separate full-width SVGs** with bridging prose between figures—never stack multiple figures back-to-back without explanatory text.
3. **Zero-Dependency Self-Contained Assembly**:
   - Write the page body fragment (`body.html`) using semantic classes from `assets/theme-morandi.css`. `assets/widgets.js` automatically provides: Masthead Light/Dark theme (`Warm Paper` ↔ restrained `Midnight Slate`) & font-size controls, frameless left outline sidebar with collapsible `本篇图表` / `核心公式` drawers and reading progress, bidirectional `data-ref` linking, live-KaTeX `data-sym` hover quick-cards, `.fig-steps` steppers & flow dots, `data-set-view` toggles, `<table data-interactive>` sorting/filtering/extrema/CSV, xref jump-back pill, unified cross-node/KaTeX-safe selection & figure notes rendered as aligned right-margin marginalia on wide screens (with top-bar Markdown export), interactive 120fps vector Lightbox (preserving live `.fig-steps` stepping and `data-set-view` toggling while zoomed), and clean `@media print`.
   - Run `scripts/assemble_html.py` to bundle CSS, JS, cleaned/ID-prefixed SVGs, and any optional `--extra-js` into one standalone `.html` file. Pass `--offline-katex` when the user requests 100% air-gapped offline KaTeX (caches and inlines WOFF2-only fonts once).
   - **Performance guardrails**: Never add render-blocking Google Fonts `<link>` tags or `backdrop-filter: blur(...)`; keep `ignoredTags: ['script','noscript','style','textarea','pre','code','svg']` in KaTeX auto-render; escape `<` as `&lt;` inside KaTeX math.

### Stage 4 · Dual-Layer QA & Delivery
1. **Single-Command Assembly + Dual QA**: Chain `assemble_html.py` → `qa_static.py` → `qa_browser_shots.py` in one shell command (`assemble_html.py` automatically minifies inline CSS and rounds excessive SVG float decimals; `qa_browser_shots.py` runs an automated headless-Chrome DOM geometric audit—checking JS runtime errors, horizontal overflow, broken images, KaTeX errors, and diagram SVG text collisions/clipping/tiny labels—and captures `2000px`-tall `1440px` PNG slices). Fix every `FAIL` and reported geometric issue, inspect the slices in **one parallel `read_file` batch**, polish any visual issue, and re-verify once.
2. **Deliver HTML only**: Output the standalone `.html` file without overwriting earlier versions. Do NOT export PDF unless the user explicitly asks for one.

---

## Execution Speed & Browser Performance Guardrails

- **Reuse built-in infrastructure, keep full creativity for paper-specific widgets**:
  - Do NOT re-implement generic plumbing already built into `assets/widgets.js` (TOC/scroll-spy, Lightbox zoom, standard sortable/filterable/CSV tables via `table[data-interactive]`, symbol hover cards via `data-sym`, margin notes, or basic `.fig-steps` / `data-set-view` toggling).
  - You remain **fully encouraged** to craft bespoke, creative domain-specific interactive visuals via `--extra-js` whenever a paper's core mechanism genuinely benefits from one (e.g., visual byte-lane animations, attention/matrix explorers, physical phase/parameter probes, or interactive state-machine traces)—with no arbitrary line cap; just keep outputs visually intuitive at a glance rather than raw text/Hex dumps or production-scale re-implementations.
- **Minimize turn count via batching without compressing analytical depth**:
  - Inspect page PNGs in parallel batches (skipping only 100% pure bibliography pages on long papers);
  - Generate all Matplotlib charts in **1 consolidated Python script**, then inspect all preview PNGs in 1 parallel turn;
  - Write `body.html` in 1 write for short/medium papers, or 2–3 logical section chunks for long papers so deep analysis and worked examples are never truncated (avoid 10+ tiny incremental edits);
  - Chain assembly + static QA + browser audit/screenshot capture in 1 command.
- **Prevent browser jank on dense figures**: For Matplotlib scatter/waveform plots with >500 points, pass `rasterized=True` on the dense data artist so axes/text stay sharp SVG while avoiding thousands of slow SVG DOM nodes; keep `data-flow` dots to at most 1 flowchart per page.

---

## Anti-Patterns to Never Ship

- **Background QA scaffold leaking into reader UI**: Never render a sidebar "核验口径" box, masthead "全量复核" badge, or repetitive `[原文核验事实]` / `校验通过` stamps across paragraphs and captions. Place a concise 1–2 line source/scope note in the bottom `.sources-box` only.
- **Whiteboard gimmicks or AI clichés**: Never use gimmicky translated section headers ("赌注 / 解剖台 / 承重墙") or filler phrases ("值得注意的是 / 至关重要 / 深入探讨 / 奠定基石").
- **Fabricated interactive widgets or empty box flowcharts**: Never invent fake curves for a slider when no formula/grid exists, and never draw boxes with only names and no data shapes, thresholds, or equation links.
- **Cramped dense multi-panel plots or stacked figures**: Never squeeze two 20+ point charts side by side into an `800px` column, and never place two `<figure>` cards back-to-back without bridging prose.
- **Unverified numbers**: Never copy a figure or table value from memory or noisy OCR without checking the rendered PDF page PNG.
