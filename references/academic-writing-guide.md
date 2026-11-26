# Academic Writing & Silent Deep-Audit Guide

This guide defines the prose standard and analytical depth for `paper-deep-reader`.

## 1. Narrative Skeleton (Classic Academic Reading Order)

Organize the standalone HTML monograph in a calm, linear scholarly progression that reads like an expert companion article rather than a bulleted summary or slide deck:

1. **Masthead & Hero Card**: Concise paper title (target language + original English italic subtitle), 2×2 structured metadata ribbon (authors/affiliation, venue/year, evaluation scope/codecs/datasets, timeline/DOI), and a flush 4-column KPI strip highlighting the 4 numbers that define both the headline gain and the key boundary/trade-off.
2. **Executive Summary (核心导读)**: Two crisp paragraphs—Paragraph 1 states the problem, core mechanism, and primary result without hype; Paragraph 2 surfaces the sharpest cross-cutting empirical findings or scope boundaries.
3. **Conceptual Intuition Visual**: One clean, target-language diagram immediately clarifying *why* the baseline fails and *how* the proposed mechanism resolves it, before diving into notation.
4. **Section 01 · Research Background & Problem Framing**: Concrete failure mode of existing standards/baselines, structured comparison of prior engineering routes, and the exact architectural bet/trade-off of this paper.
5. **Section 02 · Method, Equations & Worked Example**:
   - State the physical/algorithmic intuition before or immediately after each numbered equation.
   - Provide a complete symbol table (symbol, domain/shape, physical meaning, update rule).
   - Carry at least one concrete, small-scale numerical micro-example all the way from input to output (and inverse/verification closure when applicable). Never write "substituting gives..." without evaluating actual numbers.
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
