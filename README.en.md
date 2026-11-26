# paper-deep-reader

[简体中文](README.md) | **English**

[![License: MIT](https://img.shields.io/badge/License-MIT-4A7C7E.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Claude_Code_%7C_Codex_%7C_Cursor_%7C_Antigravity-B86B52.svg)](#quick-start)
[![Output](https://img.shields.io/badge/Output-Single--File_Interactive_HTML-5E8C61.svg)](#live-preview)

An Agent Skill for deep technical reading of research papers. Given a local PDF, arXiv ID, Open-Access DOI, or Zotero item, it generates a standalone, offline-ready interactive HTML monograph—combining page-by-page visually verified equations and tables, vector mechanism diagrams, Matplotlib charts, and a wheel-zoom / drag-pan vector lightbox.

---

## Live Preview

- **Online Interactive Demo (GitHub Pages)**: [Pinho (2002) Deep-Reading Monograph](https://yangyannick.github.io/paper-deep-reader/examples/pinho-2002-demo.html)
- **Offline Local File**: Open [`examples/pinho-2002-demo.html`](examples/pinho-2002-demo.html) directly in any browser.

Built from Pinho (2002), *IEEE Signal Processing Letters*, Vol. 9, No. 1, pp. 5–7 (~250 KB single file, no server or build step required).

| Editorial Layout & Sticky TOC | Vector Architecture & Interactive Stepper |
| :---: | :---: |
| ![Editorial Hero and Summary](docs/images/preview-hero.png) | ![Interactive Stepper and Vector Architecture](docs/images/preview-interactive.png) |
| **Full-Width Matplotlib Vector Plots** | **Case Small Multiples & Interactive Data Table** |
| ![Full-Width Vector Plots](docs/images/preview-charts.png) | ![Interactive Data Table and Small Multiples](docs/images/preview-table-audit.png) |

---

## Core Features

- **Page-by-page visual grounding**: Renders key PDF pages to PNGs via PyMuPDF and visually verifies equations, multi-column tables, and footnotes before drafting—avoiding raw text extraction errors and fabricated numbers.
- **Journal-grade editorial reading**: Pairs a warm paper Morandi palette, sticky left TOC, and KaTeX math with zero render-blocking Google Fonts and zero blur-compositing overhead so multi-figure pages open fast and scroll smoothly.
- **Paper-adaptive diagrams & vector zoom**: Matches discrete algorithms with step-by-step players and sandboxes, architectures with linked-highlight SVGs and comparison cards, and dense benchmarks with full-width Matplotlib vector SVGs—all backed by a cursor-anchored wheel-zoom (`50%–500%`) and drag-pan lightbox.
- **Analytical depth without UI clutter**: Delivers concrete numerical micro-examples, key design trade-offs, and empirical scope boundaries in clear scholarly prose without AI clichés or noisy verification badges.
- **Single-file delivery, zero hard dependencies**: Inlines all CSS, JS, and vector SVGs into one ~250 KB `.html` file; works with local PDFs, arXiv, Open-Access DOIs, and Zotero 7+ without requiring extra MCP servers or plugins.

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

- **Core**: `pymupdf`, `matplotlib`, `numpy`, `pillow` (used for PDF rendering and quantitative vector plots). `scripts/fetch_paper.py` uses Python's standard library only.
- **Optional QA tools**: Node.js (`node --check` for inline JS syntax verification) and Chrome / Chromium / Edge (auto-detected for 1440px headless visual QA).

---

## Supported Inputs

| Input Source | Extra Plugin | How It Works |
| :--- | :---: | :--- |
| **Local PDF** (`path/to/paper.pdf`) | None | Default offline entry; extracts text and renders key pages for visual verification. |
| **arXiv ID / URL** (`1706.03762`, etc.) | None | Built-in `scripts/fetch_paper.py` fetches Atom metadata and downloads the PDF. |
| **Open-Access DOI** (`10.1038/...`) | None | Fetches Crossref metadata and checks OpenAlex, Europe PMC, Semantic Scholar, and optional Unpaywall for legal OA PDFs. |
| **Paywalled DOI** (`10.1109/...`) | None | Saves bibliographic metadata and stops (`exit 2`) asking for a local PDF or Zotero entry—never fabricates content or uses unauthorized sources. |
| **Zotero 7+ Local Library** | None | Compatible with Zotero 7 / 8 / 9 / 10 via the local API (`127.0.0.1:23119`); reads metadata/notes and auto-resolves local PDFs (including custom data directories). Also seamlessly uses `zotero-cli` / `zotero-mcp` if installed. |

---

## Usage Examples

### In an Agent Session

**1. Local PDF (Algorithm / Compression / State-Machine Paper)**
```text
Use $paper-deep-reader on ./papers/pinho-2002.pdf. Include a concrete numerical worked example, an interactive step-by-step player, a custom input sandbox, and a filterable original data table.
```

**2. arXiv or Open-Access DOI (Deep Learning / Architecture Paper)**
```text
Use $paper-deep-reader on arXiv:2312.00752 (Mamba). Focus on a linked-highlight architecture SVG, tensor-shape trace, ablation small multiples, and sequence-length scaling charts.
```
```text
Use $paper-deep-reader to analyze DOI 10.1038/s41586-021-03819-2.
```

**3. Zotero Local Library (With Existing Notes)**
```text
Use $paper-deep-reader to read "Online Preprocessing for Sparse Histograms" from my Zotero library, and incorporate my Zotero notes into the final engineering insights section.
```

**4. Domain-Transfer & Engineering Boundary Analysis**
```text
Use $paper-deep-reader on ./papers/bitshuffle-2015.pdf. In the final section, evaluate how it transfers to 16-bit high-rate scientific DAQ streams, including memory overhead and failure boundaries.
```

**5. Specify Output Language (English / Simplified Chinese)**
```text
Use $paper-deep-reader on arXiv:1706.03762 and write the entire standalone interactive HTML monograph in English.
```

### Standalone CLI Utilities

```bash
# 1. Fetch metadata & PDF (arXiv / OA DOI / Zotero 7+)
python scripts/fetch_paper.py --source 1706.03762 --out ./temp/demo
python scripts/fetch_paper.py --source 10.1038/s41586-021-03819-2 --out ./temp/demo
python scripts/fetch_paper.py --zotero-query "sparse histograms" --out ./temp/demo

# 2. Extract full text & render 200 DPI verification page PNGs
python scripts/extract_pdf.py --pdf ./temp/demo/arxiv_1706.03762.pdf --out ./temp/demo --pages 1-6 --dpi 200

# 3. Run static QA on a generated HTML file (KaTeX, duplicate IDs, JS syntax, clichés)
python scripts/qa_static.py examples/pinho-2002-demo.html --strict-cliches

# 4. Capture 1440px headless browser slices for visual inspection
python scripts/qa_browser_shots.py --html examples/pinho-2002-demo.html --out ./temp/demo/qa_shots
```

---

## Workflow & Repository Layout

The skill runs in four stages: **1. Source grounding & page-by-page visual verification** → **2. Monograph synthesis with worked examples & scope audit** → **3. Vector diagrams, inspected Matplotlib plots & single-file assembly** → **4. Static + 1440px browser visual QA**.

```text
paper-deep-reader/
├── SKILL.md                           # 4-stage workflow, input adapters & paper-type adaptation
├── agents/
│   └── openai.yaml                    # Explicit-invocation policy for Codex
├── assets/
│   ├── theme-morandi.css              # Warm Paper Morandi stylesheet & lightbox CSS
│   ├── widgets.js                     # TOC spy, prose-SVG linking, localized vector lightbox
│   └── morandi-academic.mplstyle      # Harmonized Matplotlib academic style
├── references/
│   ├── academic-writing-guide.md      # Narrative order, worked examples & evidence-audit rules
│   ├── diagram-and-layout-guide.md    # Vector diagram craft & adaptive interactive widgets
│   └── plotting-guide.md              # Full-width vs dual-panel rules & visual QA checklist
├── scripts/
│   ├── fetch_paper.py                 # Stdlib-only fetcher (arXiv / OA DOI / PDF URL / Zotero 7+)
│   ├── extract_pdf.py                 # PyMuPDF text extraction & verification page renderer
│   ├── assemble_html.py               # Single-file HTML bundler (SVG cleaner & ID prefixer)
│   ├── qa_static.py                   # Static QA (KaTeX, IDs, clichés, node --check)
│   └── qa_browser_shots.py            # Cross-platform 1440px headless visual QA slicer
├── docs/images/                       # README showcase screenshots
├── examples/
│   └── pinho-2002-demo.html           # Complete standalone HTML demo
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
  All CSS, JS, tables, and vector SVG figures are embedded in the single `.html` file with zero external fonts or image hosts. Only KaTeX is loaded from CDN for formula typesetting (prose, tables, and all vector figures still render offline).

---

## Credits & License

All templates, stylesheets, scripts, and guides in this repository are written from scratch under the [MIT License](LICENSE). The workflow draws inspiration from several open-source ideas:
- Vector mechanism diagrams, linked highlighting, steppers, and small multiples inspired by [`visual-explainer`](https://github.com/nicobailon/visual-explainer) (MIT).
- Worked micro-examples, component role analysis, and evidence-boundary checks inspired by academic paper X-ray workflows.
- Render–inspect–revise Matplotlib quality loops inspired by academic plotting workflows.
- Local library integration compatible with Zotero 7+ Local API and [`zotero-mcp`](https://github.com/54yyyu/zotero-mcp) (MIT).
