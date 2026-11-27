---
name: paper-deep-reader
description: >-
  Generate a standalone interactive HTML deep-reading monograph from a research paper PDF
  (local file, Zotero item, arXiv, or OA DOI) with verified equations, flowcharts, and charts.
  Explicit invocation only — use only when the user names paper-deep-reader or explicitly asks
  for an interactive HTML paper deep-reading page; do not auto-trigger for quick Q&A or summaries.
license: MIT
metadata:
  version: "2.0.0"
---

# Paper Deep Reader (`paper-deep-reader`)

Turn a research paper PDF into a standalone, interactive HTML monograph that **fully replaces reading the source PDF** while being **far clearer to understand**.

**North-Star Principle — Source Layer vs. Reading-Aid Layer**:
- **Source Layer (replaceability)**: Every section, core definition/theorem, numbered equation, figure, table, appendix, and substantive footnote is faithfully accounted for with traceable original numbering (secondary bulk may fold into `<details class="deep-dive">`, never silently dropped).
- **Reading-Aid Layer (clarity)**: Every added overview, diagram, breakdown, walkthrough, symbol table, or interactive widget exists solely to remove a concrete comprehension obstacle in the paper.

*(Detailed rules live once in `references/`: read `academic-writing-guide.md` before drafting, and `diagram-and-layout-guide.md` + `plotting-guide.md` before creating figures or interactivity.)*

---

## Input Adapters (Zero Hard Dependencies)

Resolve the source paper via the lightest path, and **prefer the most complete edition** when multiple versions exist (e.g., an arXiv extended preprint with appendices over a truncated proceedings version; record the exact edition in `.sources-box`):

1. **Local PDF path (default)**: Read the user-supplied `.pdf` directly.
2. **Built-in zero-dependency fetcher (`scripts/fetch_paper.py`, Python stdlib only)**:
   - **arXiv ID / URL**: `python scripts/fetch_paper.py --source 1706.03762 --out <workdir>`
   - **DOI (Open Access)**: `python scripts/fetch_paper.py --source 10.xxxx/... --out <workdir>` — retrieves Crossref metadata and searches legal OA PDFs (OpenAlex, Europe PMC, Semantic Scholar, optional Unpaywall via `--email`/`UNPAYWALL_EMAIL`). On paywalled papers (exit code `2`, `PAYWALL_OR_NO_OA_PDF`), **stop and ask the user for a local PDF or Zotero item**—never fabricate content from an abstract and never use unauthorized sources.
   - **Zotero 7+ Local API**: `python scripts/fetch_paper.py --zotero-query "<title>" --out <workdir>` (or `--zotero-key <KEY>`) queries `127.0.0.1:23119` and resolves the local PDF path, metadata, and notes.
3. **Optional MCP / CLI tools**: Use installed `zotero-cli`, `zotero-mcp`, or paper-search MCP directly when available.

Store all intermediate files (extracted text, page PNGs, `reading_plan.md`, plotting scripts, QA screenshots) inside a dedicated temporary task directory (honoring workspace rules such as `temp/<task>/`); never litter the repository root.

---

## 4-Stage Workflow

### Stage 1 · Source Grounding & Reading Plan
1. Verify once which Python interpreter has `pymupdf`, `matplotlib`, `numpy`, and `PIL`, then reuse it throughout. Run:
   ```bash
   python scripts/extract_pdf.py --pdf <paper.pdf> --out <workdir>
   ```
   This extracts `pdf_text.txt`, renders every page to `pdf_pages/page_NN.png` (`150 DPI`), prints `PAGE_MAP`, and writes `source_inventory.json` (`SOURCE_INVENTORY` listing detected source figures, tables, numbered equations, and appendix start page).
2. Visually inspect all body, conclusion, and appendix page PNGs in **one parallel `read_file` batch** (or 2 batches for long papers) to verify every equation, symbol, table value, footnote, and figure. Only on long papers where `pdf_text.txt` confirms a page is **100% pure bibliography** may you skip inspecting that PNG; never read PNGs one by one.
3. Run **one upfront Python grounding script** right after page inspection to cross-check table arithmetic, compute exact walkthrough values, and locate bounding boxes for original figure crops (`extract_pdf.py --crop PAGE:x0,y0,x1,y1:name.png`, `240 DPI`).
4. Write `<workdir>/reading_plan.md` (internal only, never embedded in HTML; template in `references/academic-writing-guide.md` §1) locking the exact edition, 1-sentence thesis, 3–5 core takeaways, Hero 2–4 picks, terminology glossary, full source coverage map, and obstacle→aid plan.

### Stage 2 · Synthesis & Drafting
Read `references/academic-writing-guide.md` before drafting `body.html`.
- Follow the 3-part flow (**Entry** → **Body** following the paper's own spine → **Closing**), tagging source figures/tables with `data-src="figN"` / `data-src="tabN"` and matching headings with `<span class="src-sec">§N</span>`.
- Write `body.html` in **1 write** for short/medium papers, or **2–3 logical chunks** for long papers (avoid 10+ tiny incremental edits). Use the Native Class Quick-Reference in `references/diagram-and-layout-guide.md` §6 directly without spending turns reading `assets/theme-morandi.css`.

### Stage 3 · Visuals, Figures & Interactivity
Read `references/diagram-and-layout-guide.md` and `references/plotting-guide.md` before generating visuals.
- Generate all Matplotlib vector SVGs + preview PNGs in **one consolidated plotting script**, inspect all preview PNGs in **one parallel `read_file` batch**, and apply at most 1 targeted `edit_file` polish pass.
- Account for every source figure visibly (redraw data-backed charts, crop complex architectures / simple schematics / photos / waveforms / appendix visuals via `--crop`, add custom `.diag-svg` explainers where structural obstacles exist).
- Reuse `assets/widgets.js` for all built-in infrastructure (TOC, Lightbox, interactive tables, KaTeX symbol cards, highlights/marginalia, `.fig-steps` steppers, `data-set-view`). Add bespoke `--extra-js` only when grounded in an explicit equation, model, or measured grid (or requested by the user), obeying the 3 UX laws in `references/diagram-and-layout-guide.md` §5.
- Assemble the single-file HTML via `scripts/assemble_html.py` using `@@TOKEN@@` placeholders (never write ad-hoc base64 scripts or read `assemble_html.py` unless debugging):
  ```bash
  python scripts/assemble_html.py --title "..." --body <workdir>/body.html --out <output/paper.html> \
    --svg SVG_PLOT1=<workdir>/plot1.svg --img IMG_FIG1=<workdir>/crops/fig1.png \
    [--extra-js <workdir>/custom_widgets.js] [--offline-katex]
  ```

### Stage 4 · Dual-Layer QA & Delivery
1. Chain assembly + static QA (with `--inventory`) + short-circuit headless-Chrome audit/screenshots in **one shell command**:
   ```bash
   python scripts/qa_static.py <output/paper.html> --inventory <workdir>/source_inventory.json && \
   python scripts/qa_browser_shots.py --html <output/paper.html> --out <workdir>/qa_shots
   ```
   - Fix every `FAIL` and geometric audit issue (`qa_browser_shots.py` checks runtime errors, overflow, broken images, KaTeX errors, and `.diag-svg` text collisions/clipping, and auto-slices full page height into `2500px` PNGs).
   - **Resolve every source-coverage `WARN`**: either add the missing source figure/table with `data-src` or verify in `source_inventory.json` that the flagged token was a heuristic false positive.
   - Inspect all QA slices in **one parallel `read_file` batch**, perform at most 1 polish pass, and re-verify once.
2. **Deliver standalone HTML only**: Never overwrite earlier versions, and never export PDF unless explicitly requested.

---

## Execution & Browser Performance Guardrails

- **Single-agent unified execution**: Run the entire workflow in one main agent thread—do **not** spawn parallel subagents for prose, charts, or JS (duplicating PDF reads bloats tokens and rework).
- **Minimal turn overhead**: Batch PNG reads without `ls` turns (`extract_pdf.py` prints `PAGE_MAP` and `SOURCE_INVENTORY`); keep grounding, plotting, and QA-chaining consolidated.
- **Browser rendering safety**:
  - Zero render-blocking Google Fonts `<link>` tags and zero `backdrop-filter: blur(...)`;
  - Keep `ignoredTags: ['script','noscript','style','textarea','pre','code','svg']` in KaTeX auto-render and escape `<` as `&lt;` inside math;
  - Pass `rasterized=True` on Matplotlib artists with >500 scatter markers or >2,000 polyline vertices; keep `data-flow` particles to at most 1 flowchart per page.

---

## Anti-Patterns to Never Ship

- **Silent source omissions**: Dropping a source figure, table, or appendix without accounting for it visibly on the page.
- **Backstage QA noise or AI clichés**: Rendering "核验口径" / "全量复核" / `[原文核验事实]` / `校验通过` in reader UI, or filler/slang (`值得注意的是`, `至关重要`, `奠定了坚实基础`, `深入探讨`, `解剖台`, `承重墙`).
- **Minor errata hijacking Entry**: Putting footnote nitpicks, minor ablations, or edition quirks into Hero or `.exec-summary` instead of Closing.
- **Broken or fabricated interactivity**: Inventing speculative slider curves without a paper formula/grid, shipping controls that show no visible effect in their default state, or styling clickable toggles like static badges.
- **Crowded visuals or unverified numbers**: Squeezing 15+ item plots into dual panels, stacking two `<figure>` blocks without bridging prose, or copying numbers from OCR/memory without checking rendered PDF PNGs.
