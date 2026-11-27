# Academic Writing & Content Architecture Guide (v2.0.0)

Single source of truth for **content selection, structural hierarchy, reading-aid triggers, closing synthesis, and cross-language academic prose** in `paper-deep-reader`.

## 1. North-Star Principle: Source Layer vs. Reading-Aid Layer

Every page must simultaneously **(1) replace the source PDF** (readers never need to flip back) and **(2) read far more clearly than the original paper**. Every page element belongs to one of two layers:

- **Source Layer (replaceability)**: **Complete** (every section, core definition/theorem, numbered equation, figure, table, appendix, and substantive footnote accounted for), **faithful** (claims, qualifiers, symbols, and numbers match the PDF), and **traceable** (original numbering preserved). Fold secondary bulk (long proofs, 30+ row raw tables, appendix galleries) into `<details class="deep-dive">`—folded is kept, never dropped.
- **Reading-Aid Layer (clarity)**: **Obstacle-driven**—add an overview, diagram, breakdown, walkthrough, symbol table, or interactive widget only when a concrete comprehension barrier exists. Never pad or repeat what the Source Layer already states cleanly.

### Three-Part Page Flow (No Fixed 8-Section Boilerplate)
1. **Entry (Reading-Aid)**: Hero highlights (2–4 picks) → Core Overview (`.exec-summary`) → Whole-Paper Panorama (medium/long papers). Short orientation, never a substitute for the body.
2. **Body (Source + In-Place Aids)**: Follows the paper's own logical spine (mechanisms for method papers, identification & findings for empirical/social-science papers, theorem chains for theory, taxonomy axes for surveys). Place aids right where friction occurs.
3. **Closing (Source Conclusion + Reading-Aid Synthesis)**: Honor the paper's conclusion without repetition, then deliver Limitations & Scope Boundaries, natural Implications, and `.sources-box`.

### Internal Pre-Draft `reading_plan.md` (In Workdir Only — Never in HTML)
Write `<workdir>/reading_plan.md` once right after page inspection and upfront numeric grounding:

```markdown
# Reading Plan (Internal)
- Edition: <e.g., arXiv 1706.03762v7, 15 pp., with Appendix>
- Thesis: <1 sentence: problem, core idea, decisive result>
- Core Takeaways (3–5 bullets): <backbone only; zero minor errata>
- Hero Picks (2–4): <value/proposition> | <label> | <why irreplaceable>
- Glossary Lock: <Term -> Fixed Translation>; Keep English: <models, metrics, operators>
- Coverage Map:
  | Source Item | Section / Drawer | Form |
  | §3.2.1 / Eq. (1) | 02 Architecture | .eq-box + walkthrough |
  | Fig. 1 | 02 Architecture | High-DPI crop + breakdown |
  | Fig. 3–5 (Appendix) | 03 Deep-Dive | Crops in deep-dive |
  | Table 3 | 04 Experiments | Interactive table + redrawn plot |
- Reading Aids (Obstacle -> Aid): <specific obstacle> -> <specific aid>
```

---

## 2. Entry Layer: 30-Second Orientation

- **Hero Highlights (`.kpi-grid`)**: **2–4** adaptive cells, zero fixed dimensions. *Sole test*: "If a peer has 5 seconds, what 2–4 conclusions, quantitative leaps, core theorems, key mechanisms, or decisive boundaries are truly irreplaceable?" Never split redundant metrics to fill space or showcase unintuitive raw counts.
- **Core Overview (`.exec-summary`)**: **1 framing sentence** (`<p>`) + **3–5 crisp bullets** (`<ul>`) covering *pain point broken → why the core idea works → decisive result*. **Hard red line**: minor ablations, copy-editing errata, and edition quirks never enter Entry (save for Closing); do not copy Hero numbers verbatim.
- **Whole-Paper Panorama (`data-jump`)**: Default for medium/long papers; omit on 2–3p short letters. Shape follows the paper (causal pipeline, taxonomy tree, conceptual framework, or Assumption → Lemma → Theorem DAG). Shows *where things live* without repeating `.exec-summary`.

---

## 3. Source Layer Rules

- **Headings**: Follow the paper's arc; tag matching headings with `<span class="src-sec">§3</span>` inside `<h2>` / `<h3>`.
- **Claims & Related Work**: Translate definitions, theorems, and central claims faithfully with all qualifiers intact. Background prose may be tightened without losing claims; Related Work may become a structured comparison table.
- **Equations (`.eq-box`)**: Include all numbered source equations preserving exact numbers (`式 (N)` / `Eq. (N)`). Extracted unnumbered prose relations get descriptive semantic labels (e.g., `核心分解关系 · §2.1`)—never fake `Eq. (1)`. Introduce naturally and cross-link via `<a class="xref">`. Add a 1–3 line `.eq-note` **only** when new local symbols or non-obvious structural factors need unpacking; never repeat it in the next paragraph.
- **Tables (`.table-wrap`)**: Transcribe all source tables inline where analyzed (`<table data-interactive>` where suitable); fold 30+ row listings in `<details class="deep-dive">`. If a table is redrawn as a chart, keep exact numbers retrievable (direct chart labels or original table tucked in `deep-dive`).
- **Figures**: Every source figure must appear visibly (no "omit" option); see `references/diagram-and-layout-guide.md` §2 for forms and mandatory `data-src` tagging.
- **Appendices & Footnotes**: Cover appendices (collapsible in `deep-dive`). Place substantive footnotes inline where relevant (e.g., variance-scaling proof next to $\sqrt{d_k}$).
- **Naming**: Chinese `原文图 N` / `原文图 N（重绘）` / `图解 A` / `原文表 N` / `式 (N)`; English `Figure N` / `Figure N (redrawn)` / `Explainer A` / `Table N` / `Eq. (N)`.

---

## 4. Reading-Aid Layer: Obstacle → Aid Playbook

| Concrete Obstacle | Reading Aid | Trigger |
|---|---|---|
| Long multi-branch paper | Whole-paper panorama (`data-jump`) | **Default** (skip 2–3p letters) |
| Dense notation (≥3 recurring/core symbols) | `<table data-sym-table>` *(exclude loop indices $i,j,k$, textbook ops $\mathbb{E}[\cdot]$, one-off dummy vars)* | **Mandatory when present** |
| Abstract mechanism, formula, identification framework, or protocol | **Cross-Discipline Concrete Walkthrough** (optionally `.fig-steps` + `.step-vals`) | **Mandatory when present** *(skip macro surveys/commentaries)* |
| Opaque/complex original diagram | High-DPI crop + structured breakdown beneath (+ optional flat `.diag-svg`) | **When present** |
| Poorly scaled/crowded original plot | Morandi Matplotlib redraw (keep original number & `data-src`) | **When present** |
| Parameter sensitivity or regime trade-off | Bespoke `--extra-js` interactive (only if backed by formula, model, or measured grid) | **On-demand** |
| Unfamiliar prerequisite (e.g., BLEU, DID, domain quantity) | 3–6 line primer inside `<details class="deep-dive">` | **On-demand** |
| Contrasting regimes or extreme cases | Case comparison: brief → 2–3 col `.sm-grid`; rich → `.sm-grid.is-vertical` or comparison table | **On-demand** |
| Multi-component design + ablation study | Component Role Table (*Indispensable Core / Conditional Gain / Unablated / Prototype Simplification / Boundary Choice*, citing exact controls) | **On-demand** |
| Lengthy proof or extended appendix | `<details class="deep-dive">` | **On-demand** |
| Table-local accounting rule or footnote caveat | 1–2 line `.aside-note` right beside the table or claim | **On-demand** |

**Concrete Walkthrough across disciplines** (walk one grounded small-scale instance end-to-end; never write "substituting gives..." without actual values):
- *Algorithms / Engineering*: small-scale numerical trace from input to output (and inverse/verification closure).
- *Physics / Chemistry / Math*: plug in representative physical orders of magnitude or trace a low-dimensional special case / counterexample.
- *Biology / Medicine / Experimental Science*: trace one pathway, clinical case, or single-sample intervention-to-measurement chain.
- *Economics / Social Science / Management / Law*: dissect one representative empirical case or policy shock, or translate core coefficients into tangible real-world meaning.

---

## 5. Closing Layer

1. **Limitations & Scope Boundaries (Always Present)**: Grounded in body, tables, figures, and footnotes (downplayed regressions, weighted-average skews, missing baselines/ablations, truncations, unmeasured costs, external-validity limits), ordered by severity. Note errata **only** when they affect interpretation; put table-specific caveats in-place via `.aside-note`.
2. **Natural Implications (No Forced CS Boilerplate)**:
   - *User supplied a target domain/transfer question* (top priority): transferable principles, adaptations, and failure boundaries.
   - *Method / Systems / Engineering*: adoption criteria, parameter selection, applicability limits.
   - *Basic Science / Theory / Social Science / Policy*: theoretical positioning, open follow-up questions, or real-world / policy implications.
3. **Sources Box (`.sources-box`, 2–4 lines)**: Full citation, DOI / arXiv / official code or data link, and 1-sentence note naming the exact edition read.

---

## 6. Cross-Language Academic Expression (4 Zero-Overhead Rules)

Apply in a single pass when target language differs from source (no multi-pass rewrite loops):

1. **Pre-Draft Glossary Lock**: Lock recurring term translations and English-retention whitelist in `reading_plan.md` and keep 100% consistency. First mention: `学科通行译名（Original Term, ACRONYM）`. Retain universally used English model names, frameworks, metrics, and named operators—never coin literal neologisms.
2. **Kill 4 Translationese Patterns** (especially in Chinese): break stacked pre-modifiers into short flowing clauses; convert unnatural `被`-passives into active/subjectless clauses; avoid stacked `……性/……化/……度` suffixes; cut empty `通过进行……实现……` filler.
3. **Literal Logic, Idiomatic Cadence**: Preserve causal direction, control qualifiers (`single model` vs. `ensemble`), and exact hedging strength (`suggests`, `under these conditions`, `up to`)—never inflate into "proves" or "always".
4. **Discipline Fidelity & Uniform Figure Language**:
   - *STEM*: 100% fidelity on symbols, units, operators, and experimental controls.
   - *Social Science / Humanities / Policy*: keep school-specific constructs (*agency*, *habitus*, *legitimacy*, *framing*, *salience*), scale names, and key quotes alongside English originals; strictly separate correlation from causal identification.
   - *Figures*: titles, axes, legends, and custom diagrams in target language (keeping standard acronyms/symbols).

---

## 7. Prose & De-Noising Discipline

- **Facts vs. Inferences**: Unmarked prose is grounded in the paper—never stamp `[原文核验事实]`. Signal analytical inferences naturally in prose, and use a quiet `机制推断` pill only on figure headers dedicated to inference.
- **Zero Backstage Noise & Zero Clichés**: No sidebar "核验口径", masthead "全量复核", or mentions of Python scripts. Avoid AI clichés (`值得注意的是`, `至关重要`, `奠定了坚实基础`, `深入探讨`, `综上所述`) and whiteboard slang (`压了一个硬赌注`, `解剖台`, `承重墙`).
- **Pacing**: Always bridge consecutive `<figure>` blocks with prose; introduce each figure beforehand, interpret it afterward, and give distinct experimental topics their own `<h3>`.
