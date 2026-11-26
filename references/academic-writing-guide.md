# Academic Writing & Silent Deep-Audit Guide

This guide defines the prose standard and analytical depth for `paper-deep-reader`.

## 1. Narrative Skeleton (Classic Academic Reading Order)

Organize the standalone HTML monograph in a calm, linear scholarly progression that reads like an expert companion article rather than a bulleted summary or slide deck:

1. **Masthead & Hero Card**: Concise paper title (target language + original English italic subtitle), 2×2 structured metadata ribbon (authors/affiliation, venue/year, evaluation scope/datasets/systems, timeline/DOI), and a flush 4-column KPI strip highlighting the 4 numbers that define both the headline gain and the key boundary/trade-off.
2. **Executive Summary (核心导读)**: Two crisp paragraphs—Paragraph 1 states the problem, core mechanism, and primary result without hype; Paragraph 2 surfaces the sharpest cross-cutting empirical findings or scope boundaries.
3. **Whole-Paper Logic Map / Conceptual Panorama (全文脉络图 / 全景概览)**: One clean, target-language bird's-eye diagram right after Executive Summary connecting the paper's full argument arc (e.g., Problem/Constraints → Core Design Pillars or Taxonomy Branches → Key Findings/Regimes → Scope & Boundaries), with clickable `data-jump="#sec-..."` links to major sections. Keep this strictly high-level so it complements—never duplicates—Section 02's zoomed-in method/mechanism diagram.
4. **Section 01 · Research Background & Problem Framing**: Concrete failure mode of existing approaches/baselines, structured comparison of prior routes, and the exact design trade-off of this paper.
5. **Section 02 · Method, Equations & Worked Example**:
   - **Respect original equation numbering & prose continuity**: Preserve the paper's own equation numbers (e.g., `Eq. (1)` / `式 (1)`) when the source paper numbers them. When the paper states a key relation unnumbered in prose and you extract it into `.eq-box` for clarity, give it a **descriptive semantic label** (e.g., `核心分解关系 · Sect. 2.1`) rather than fabricating fake `式 (1)` numbers. Always introduce each `.eq-box` naturally in the preceding sentence and link back via `<a class="xref">` when referenced later—never drop orphaned equation cards.
   - **On-demand compact equation notes (`.eq-note`, no rigid dual-paragraph boilerplate)**: Do NOT stamp a fixed multi-paragraph template onto every equation. If a formula is straightforward or already clear from the preceding sentence, omit `.eq-note` and continue the prose. Add a crisp 1–3 line `.eq-note` inside `.eq-box` **only when** the formula introduces new local symbols, non-obvious operators, or key structural factors whose algebraic role is not immediately obvious at a glance—and do not repeat the same wording in the next paragraph.
   - **Semantic Global Symbol Table (`<table data-sym-table>`)**: Collect both (a) core quantities, parameters, and metrics that recur across sections, figures, or tables, **and** (b) key mathematical objects/operators inside the paper's core equations even if they appear only once. Keep the table clean and disciplined by excluding pure loop/summation indices ($i, j, k$), standard textbook notation ($\mathbb{E}[\cdot], \mathrm{Var}(\cdot)$), and throwaway single-example dummy variables (explain those briefly inline next to the formula instead). Wire recurring symbols in later sections with `data-sym` hover quick-cards.
   - Carry at least one concrete, small-scale numerical or concrete-instance worked example all the way from input to output (and inverse/verification closure when applicable). Never write "substituting gives..." without evaluating actual values.
6. **Section 03 · Experimental Design & Empirical Analysis**:
   - Datasets, baselines, metrics, and any hidden accounting rules (e.g., side-information overhead, excluded subsets from footnotes).
   - Pair high-clarity quantitative SVG plots with mechanistic interpretation, explicitly separating what the authors proved/explained from analytical mechanism inferences.
   - Highlight 3–4 representative success/failure archetypes via Small Multiples cards.
7. **Section 04 · Interactive Original Data Explorer** (when the paper has substantive multi-row benchmark tables): Preserve complete verified raw numbers in a filterable/searchable interactive table so readers can audit any single case without interrupting the main prose flow.
8. **Section 05 · Component Hierarchy & Evidence Boundaries**:
   - **5.1 Component Role Table**: Classify each major design choice as *Indispensable Core*, *Conditional Gain*, *Unablated Key Mechanism*, *Prototype Simplification*, or *Architectural Boundary Choice*, citing the exact table/control or stating openly when no ablation was run.
   - **5.2 Evidence Boundary Grid (Balanced 2×2)**: Rank limitations by impact severity (weakens headline claim, missing baseline/ablation, sample/regime truncation, unmeasured system cost).
9. **Section 06 · Engineering Insights & Domain Transfer + Sources**:
   - Practical guidance on when to adopt vs when to avoid or adapt the method.
   - If the user mentions a target domain or research problem, include a dedicated transfer analysis; otherwise focus on general engineering deployment boundaries.
   - Close with a compact `.sources-box` listing the exact citation, DOI, and a concise 1–2 line reading scope note.

## 2. Prose & De-Noising Discipline

- **Tone**: Natural, restrained, precise academic prose. Preserve exact English technical terms, algorithm names, dataset names, and standard acronyms on first mention.
- **Prose–figure pacing & sequential numbering**: Never stack two or more `<figure>` cards back-to-back with zero bridging prose between them. Introduce each figure before it appears and interpret its takeaway afterward; give distinct experimental topics their own `<h3>` subsection, and ensure figure numbers (`图 1`, `图 2`, ... / `Figure 1`, `Figure 2`, ...) strictly increase in document order.
- **Keep facts and inferences distinct without sticker clutter**:
  - Do NOT stamp `[原文核验事实]` on every paragraph, caption, or table. Unmarked statements are understood to be grounded in the source paper.
  - When introducing an analytical inference beyond what the authors explicitly state, signal it naturally in prose (e.g., "原文未解释……；结合……机理分析，可能源于……") and, if dedicated to a figure, add a quiet `机制推断` pill on that figure header only.
- **Zero backstage QA scaffolding**:
  - Do NOT add a sidebar "核验口径" card, masthead "全量复核" badge, or sentences bragging about Python assertion scripts. Quality verification happens silently before delivery.
- **Zero AI clichés or colloquial gimmicks**:
  - Avoid filler openers and promotional verbs (`值得注意的是`, `至关重要`, `标志着`, `奠定了坚实基础`, `深入探讨`, `综上所述`).
  - Avoid awkward literal translations of English whiteboard idioms (`压了一个硬赌注`, `解剖台`, `承重墙`).
- **Preserve hedging strength**: Never turn "suggests" or "on some images" into "proves" or "always". If a paper omits runtime, variance, or a baseline table, state plainly that it was not reported.
