# paper-deep-reader

[简体中文](README.md) | **English**

[![License: MIT](https://img.shields.io/badge/License-MIT-4A7C7E.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Claude_Code_%7C_Codex_%7C_Cursor_%7C_Antigravity-B86B52.svg)](#quick-start)
[![Output](https://img.shields.io/badge/Output-Single--File_Interactive_HTML-5E8C61.svg)](#live-preview)

An Agent Skill that turns a research paper PDF (local file, arXiv, Open-Access DOI, or Zotero item) into a **single-file interactive HTML deep-reading monograph** designed to **fully replace reading the source PDF while being far clearer to follow**—preserving every section, equation, figure, table, and appendix alongside obstacle-driven figure reading guides, hoverable equation symbols, step-through diagrams, equation-grounded labs, and highlight/note tools.

---

## Live Preview

- **Online Interactive Demos (GitHub Pages)**: [Vaswani et al. (2017) *Attention Is All You Need* (English)](https://yangyannick.github.io/paper-deep-reader/examples/vaswani-2017-attention-en.html) · [简体中文版](https://yangyannick.github.io/paper-deep-reader/examples/vaswani-2017-attention-zh.html)
- **Original Paper (Open Access)**: [Vaswani et al. (2017), *Attention Is All You Need* (NeurIPS 2017 / `arXiv:1706.03762v7`, 15 pp. with Attention Visualizations Appendix)](https://arxiv.org/abs/1706.03762)

Generated natively from the complete 15-page `arXiv:1706.03762v7` preprint (covering all 5 original figures, 4 tables, and appendix visualizations; ~1.27 MB English / ~1.15 MB Chinese single-file HTML, no server or build step required). Pass `arXiv:1706.03762` to `$paper-deep-reader` to reproduce.

| Editorial Hero, Core Overview & Clickable Paper Panorama | Equation-Grounded Interactive Lab & Multi-Head Mechanics |
| :---: | :---: |
| ![Editorial Hero and Paper Panorama](docs/images/preview-en-hero.png) | ![Interactive Scaling Lab](docs/images/preview-en-interactive.png) |
| **Side-by-Side Figure Reading Guide, Symbol Hover & 3-Color Notes** | **Inline Interactive Table (Extrema Highlight) & Morandi Vector Chart** |
| ![Side-by-Side Reading Guide and Symbol Hover](docs/images/preview-en-reading-tools.png) | ![Inline Interactive Table and Morandi Vector Chart](docs/images/preview-en-charts-table.png) |

---

## Core Features

- **Full source-layer coverage & automated inventory audit**: Prefers the most complete paper edition and visually verifies every PDF page; `extract_pdf.py` emits `source_inventory.json` and `qa_static.py --inventory` verifies every source figure and table is visibly accounted for via `data-src`.
- **High-DPI originals paired with path-anchored reading guides**: Redraws data-backed plots in Morandi vector SVG while keeping complex architectures/schematics at 240 DPI paired with a bottom-to-top/left-to-right `.fig-guide` breakdown (side-by-side `.fig-split` for portrait figures, stacked for landscapes).
- **Interactive step-through cards & question-driven labs**: Clickable whole-paper panoramas, `.fig-steps` diagrams with hover-preview and click-to-step stage cards (synced live inside the pan/zoom Lightbox), and bespoke `--extra-js` parameter labs with zero dead controls.
- **Equation symbol lookup & 3-color annotations**: Hover directly over rendered KaTeX math for instant symbol definitions, pin and drag a searchable floating symbol sheet, highlight passages in 3 colors, take wide-screen margin notes, and export cleanly to Markdown.
- **Multi-source input & single-file delivery**: Supports local PDFs, arXiv, Open-Access DOIs, and Zotero 7+, bundling everything into one self-contained `.html` file (Warm Paper Light / Midnight Slate Dark, clean print CSS, and optional `--offline-katex` for air-gapped math).

---

## Quick Start

### 1. Install the Skill

Works with **Claude Code**, **Codex**, **Cursor**, **Antigravity**, and any Agent Skills–compatible assistant:

```bash
# Option A: Install via skills CLI
npx skills add yangyannick/paper-deep-reader

# Option B: Clone directly into your local skills directory
git clone https://github.com/yangyannick/paper-deep-reader.git ~/.agents/skills/paper-deep-reader
```

> Configured for explicit invocation so it never hijacks casual paper questions. Trigger it by naming `paper-deep-reader` / `$paper-deep-reader` or requesting an interactive HTML deep-reading page.

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

- **Core**: `pymupdf`, `matplotlib`, `numpy`, `pillow` (used for PDF rendering, image optimization, and quantitative vector plots). `scripts/fetch_paper.py` uses Python's standard library only.
- **Optional QA tools**: Node.js (`node --check` for inline JS syntax verification) and Chrome / Chromium / Edge (auto-detected for 1440px headless visual QA and DOM geometric audit).

---

## Supported Inputs

| Input Source | Extra Plugin | How It Works |
| :--- | :---: | :--- |
| **Local PDF** (`path/to/paper.pdf`) | None | Default offline entry; extracts text and renders all pages for visual verification. |
| **arXiv ID / URL** (`1706.03762`, etc.) | None | Built-in `scripts/fetch_paper.py` fetches Atom metadata and downloads the complete PDF. |
| **Open-Access DOI** (`10.1051/...`) | None | Fetches Crossref metadata and checks OpenAlex, Europe PMC, Semantic Scholar, and optional Unpaywall for legal OA PDFs. |
| **Paywalled DOI** (`10.1109/...`) | None | Saves bibliographic metadata and stops (`exit 2`) asking for a local PDF or Zotero entry—never fabricates content or uses unauthorized sources. |
| **Zotero 7+ Local Library** | None | Compatible with Zotero 7 / 8 / 9 / 10 via the local API (`127.0.0.1:23119`); reads metadata/notes and auto-resolves local PDFs (including custom data directories). Also seamlessly uses `zotero-cli` / `zotero-mcp` if installed. |

---

## Usage Examples

### In an Agent Session

**1. arXiv Paper (Deep Learning / Architecture Paper)**
```text
Use $paper-deep-reader on arXiv:1706.03762 (Attention Is All You Need) in English. Cover all 5 original figures (including appendix visualizations) and 4 tables, pair original architecture figures with path-anchored reading guides, and include an interactive scaling lab and 3-token step-through walkthrough.
```

**2. Open-Access DOI (Signal Processing / Scientific Computing / Compression Paper)**
```text
Use $paper-deep-reader on DOI 10.1051/0004-6361/201629565 (Dysco). Include a clickable paper panorama, a worked-example step-through pipeline, an interactive quantization/dithering lab, and inline sortable data tables.
```

**3. Zotero Local Library (With Existing Notes)**
```text
Use $paper-deep-reader to read "Attention Is All You Need" from my Zotero library, and incorporate my Zotero notes into the closing limitations and implications section.
```

**4. Local PDF & Domain-Transfer Engineering Audit**
```text
Use $paper-deep-reader on ./papers/bitshuffle-2015.pdf. In the closing section, evaluate how it transfers to 16-bit high-rate scientific DAQ streams, including memory overhead and failure boundaries.
```

**5. Air-Gapped Offline Archive**
```text
Use $paper-deep-reader on arXiv:1706.03762 and write the entire standalone interactive HTML monograph in English with --offline-katex enabled.
```

### Standalone CLI Utilities

```bash
# 1. Fetch metadata & PDF (arXiv / OA DOI / Zotero 7+)
python scripts/fetch_paper.py --source 1706.03762 --out ./temp/demo
python scripts/fetch_paper.py --source 10.1051/0004-6361/201629565 --out ./temp/demo
python scripts/fetch_paper.py --zotero-query "Attention Is All You Need" --out ./temp/demo

# 2. Extract full text, page index, source figure/table inventory & all-page 150 DPI PNGs
python scripts/extract_pdf.py --pdf ./temp/demo/paper.pdf --out ./temp/demo

# 3. Assemble standalone HTML (inline vector SVGs, auto-optimized images & optional --offline-katex)
python scripts/assemble_html.py --title "Demo" --body ./temp/demo/body.html --out ./temp/demo/out.html \
  --svg SVG_PLOT1=./temp/demo/plot1.svg --img IMG_FIG1=./temp/demo/crops/fig1.png --offline-katex

# 4. Run static QA & source-coverage audit (KaTeX, duplicate IDs, bindings, data-src coverage, JS syntax)
python scripts/qa_static.py examples/vaswani-2017-attention-en.html --inventory ./temp/demo/source_inventory.json --strict-cliches

# 5. Capture 1440px full-page headless browser slices & run DOM geometric/runtime audit
python scripts/qa_browser_shots.py --html examples/vaswani-2017-attention-en.html --out ./temp/demo/qa_shots
```

---

## Workflow & Repository Layout

The skill runs in four stages: **1. Source grounding, all-page visual verification & internal reading plan** → **2. Source-layer + obstacle-driven reading-aid synthesis** → **3. Redrawn plots, high-DPI original crops, interactive diagrams & single-file assembly** → **4. Static coverage QA + 1440px browser visual audit**.

```text
paper-deep-reader/
├── SKILL.md                           # v2.0 orchestrator (Source/Aid principle, input adapters, 4-stage workflow)
├── agents/
│   └── openai.yaml                    # Explicit-invocation policy for Codex
├── assets/
│   ├── theme-morandi.css              # Warm Paper Light / Midnight Slate Dark, elastic grids, .fig-split/.fig-guide & print CSS
│   ├── widgets.js                     # Declarative stepper card linking, view toggles, symbol hover/sheet, 3-color notes & lightbox
│   └── morandi-academic.mplstyle      # Harmonized Matplotlib academic style
├── references/
│   ├── academic-writing-guide.md      # Source/Aid architecture, obstacle->aid playbook, cross-discipline walkthroughs & translation rules
│   ├── diagram-and-layout-guide.md    # 7 figure forms, path-anchored reading guides, interactive UX contract & class quick-reference
│   └── plotting-guide.md              # Visual-argument plotting, redraw/crop alignment & 8-point QA checklist
├── scripts/
│   ├── fetch_paper.py                 # Stdlib-only fetcher (arXiv / OA DOI / PDF URL / Zotero 7+)
│   ├── extract_pdf.py                 # PyMuPDF text extraction, 150 DPI page renderer & source_inventory.json scanner
│   ├── assemble_html.py               # Single-file HTML bundler (SVG/image inline optimizer, ID prefixer, --offline-katex)
│   ├── qa_static.py                   # Static QA (KaTeX, IDs, interactive bindings, data-src coverage, clichés, node --check)
│   └── qa_browser_shots.py            # Cross-platform 1440px visual QA slicer & DOM geometric/runtime auditor
├── docs/images/                       # Matched CN & EN README showcase screenshots
├── examples/
│   ├── vaswani-2017-attention-zh.html # Chinese standalone HTML demo (Attention Is All You Need, arXiv v7)
│   └── vaswani-2017-attention-en.html # English standalone HTML demo (Attention Is All You Need, arXiv v7)
├── requirements.txt
├── README.md                          # Simplified Chinese documentation (default)
├── README.en.md                       # English documentation
└── LICENSE                            # MIT
```

---

## FAQ

- **Why did a DOI return `PAYWALL_OR_NO_OA_PDF`?**  
  Subscription publishers (e.g., IEEE, Elsevier, Springer non-OA papers) do not expose full-text PDFs through public APIs. `fetch_paper.py` queries legal open-access sources only and stops rather than letting the model hallucinate equations or tables from an abstract. Supply a local PDF or read via Zotero. Setting `UNPAYWALL_EMAIL=you@example.com` also enables Unpaywall lookups for repository/author-accepted versions.
- **How do I enable Zotero 7+ Local API?**  
  Open Zotero (7 / 8 / 9 / 10) → **Settings → Advanced → General** → enable *"Allow other applications on this computer to communicate with Zotero"*. The script resolves the actual disk path automatically via the `/file` endpoint, even when your Zotero data folder is stored in a custom location.
- **Does the generated HTML work offline?**  
  By default all CSS, JS, tables, vector SVG figures, and cropped images are embedded in one `.html` file (typically ~250–500 KB for vector-only papers, or ~1–2 MB for long papers with high-DPI cropped original figures; only KaTeX fonts load from CDN). Pass `--offline-katex` to `scripts/assemble_html.py` to inline compact WOFF2-only KaTeX for 100% air-gapped math rendering.

---

## Credits & License

All templates, stylesheets, scripts, and guides in this repository are written from scratch under the [MIT License](LICENSE). The workflow draws inspiration from several open-source ideas:
- Vector mechanism diagrams, linked highlighting, steppers, Before/After diffs, and selection-note workflows inspired by [`visual-explainer`](https://github.com/nicobailon/visual-explainer) (MIT).
- Concrete walkthroughs, component role analysis, and evidence-boundary checks inspired by academic paper X-ray workflows.
- Visual-argument-first render–inspect–revise Matplotlib loops inspired by academic plotting workflows.
- Local library integration compatible with Zotero 7+ Local API and [`zotero-mcp`](https://github.com/54yyyu/zotero-mcp) (MIT).
