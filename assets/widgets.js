/* paper-deep-reader: Zero-Dependency Declarative Interactive Engine (v2.0.0)
 * 1. Quiet Masthead controls (Warm Light/Dark theme, font scale, print helper)
 * 2. rAF scroll progress + 3-in-1 Left Sidebar (TOC / Figures / Equations + progress)
 * 3. Bidirectional Prose <-> SVG linked highlighting (data-ref / data-ref-node)
 * 4. Auto-indexed Symbol Hover Quick-Card (data-sym <-> data-sym-table / data-sym-def)
 * 5. Declarative Flowchart Stepper & Proportional Flow Dots (.fig-steps, data-step, data-flow)
 * 6. Same-Coordinate View Switch / Before-After Toggle (data-set-view / data-view-panel)
 * 7. Declarative Interactive Tables (table[data-interactive]: sort, filter, extrema, CSV)
 * 8. Cross-Reference Jump + Target Pulse + Return-to-Reading Pill
 * 9. Zero-Clutter Selection Notes & Figure Annotations (localStorage + Markdown export)
 * 10. Two-Stage 120fps GPU + Debounced Crisp Vector Pan & Zoom Lightbox
 */
(function initPaperDeepReaderWidgets() {
  const isZh = /^zh\b/i.test((document.documentElement.getAttribute('lang') || 'zh-CN').trim());
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ui = isZh
    ? {
        outlineCap: '文章大纲',
        foldFigs: '本篇插图',
        foldTables: '本篇表格',
        symTableTitle: '符号体系表',
        secProgress: (i, n) => '第 ' + i + ' / ' + n + ' 节',
        readMin: (m) => '约 ' + m + ' 分钟',
        fontDec: '减小字号',
        fontInc: '增大字号',
        themeDark: '切换深夜蓝灰模式',
        themeLight: '切换白天暖纸模式',
        prev: '‹ 上一步',
        next: '下一步 ›',
        play: '▶ 逐步推演',
        pause: '❚❚ 暂停',
        stepPreview: (k, n) => '预览 ' + k + ' / ' + n,
        symJump: '定位到符号表 ↗',
        symFloatBtn: 'Σ 符号',
        symFloatTitle: 'Σ 符号速查表（可拖动）',
        symPinBtn: '📌 悬浮查看',
        symSearch: '筛选符号或含义…',
        symMin: '折叠/展开',
        jumpBack: '↩ 返回阅读处',
        tblSearch: '筛选行…',
        tblRows: (v, t) => v + ' / ' + t + ' 行',
        tblExtrema: '极值高亮',
        tblCsv: '复制 CSV',
        copied: '已复制 ✓',
        figNoteTitle: '对此图记批注或提问',
        selNote: '✎ 批注',
        selAsk: '? 提问',
        hlAmber: '暖黄高亮',
        hlSage: '浅青高亮',
        hlRose: '淡粉高亮',
        hlAdded: '已高亮标注',
        hlAddNote: '+ 补批注',
        tagHl: '高亮',
        tabAll: '全部',
        tabNotes: '批注与提问',
        tabHls: '高亮摘录',
        notePlaceholder: '写下你的批注（Ctrl+Enter 保存）…',
        askPlaceholder: '写下你的疑问，可导出发给 AI 追问（Ctrl+Enter 保存）…',
        cancel: '取消',
        save: '保存',
        notesBtn: (n) => '✎ 笔记 ' + n,
        notesModalTitle: '阅读批注与追问清单',
        notesEmpty: '暂无笔记。选中正文文字或点击图框右上角 ✎ 即可记录。',
        tagNote: '批注',
        tagAsk: '疑问',
        locate: '定位',
        del: '删除',
        copyMd: '复制 Markdown',
        downloadMd: '下载 .md',
        clearAll: '清空',
        confirmClear: '确认清空本篇全部笔记？',
        close: '✕ 关闭',
        closeAria: '关闭',
        noteSaved: '已保存到本地笔记',
        mdCopied: '已复制 Markdown，可直接粘贴到笔记或发给 AI',
        lbTitle: '图表放大查看',
        lbHint: '滚轮缩放 · 拖拽平移 · 双击还原',
        lbStepHint: '← / → 切步 · 空格播放',
        lbOut: '缩小',
        lbIn: '放大',
        lbFit: '复位',
        lbFitAria: '复位适应窗口',
        lbCloseAria: '关闭放大视图',
      }
    : {
        outlineCap: 'Contents',
        foldFigs: 'Figures',
        foldTables: 'Tables',
        symTableTitle: 'Symbol Table',
        secProgress: (i, n) => 'Sec ' + i + ' / ' + n,
        readMin: (m) => '~' + m + ' min',
        fontDec: 'Decrease font size',
        fontInc: 'Increase font size',
        themeDark: 'Switch to Dimmed Slate dark mode',
        themeLight: 'Switch to Warm Paper light mode',
        prev: '‹ Prev',
        next: 'Next ›',
        play: '▶ Replay',
        pause: '❚❚ Pause',
        stepPreview: (k, n) => 'Preview ' + k + ' / ' + n,
        symJump: 'Jump to symbol table ↗',
        symFloatBtn: 'Σ Symbols',
        symFloatTitle: 'Σ Symbol Reference (drag)',
        symPinBtn: '📌 Float',
        symSearch: 'Filter symbols…',
        symMin: 'Minimize / Expand',
        jumpBack: '↩ Back to reading',
        tblSearch: 'Filter rows…',
        tblRows: (v, t) => v + ' / ' + t + ' rows',
        tblExtrema: 'Highlight extrema',
        tblCsv: 'Copy CSV',
        copied: 'Copied ✓',
        figNoteTitle: 'Annotate or ask about this figure',
        selNote: '✎ Note',
        selAsk: '? Ask',
        hlAmber: 'Amber highlight',
        hlSage: 'Sage highlight',
        hlRose: 'Rose highlight',
        hlAdded: 'Highlighted',
        hlAddNote: '+ Add note',
        tagHl: 'Highlight',
        tabAll: 'All',
        tabNotes: 'Notes & Qs',
        tabHls: 'Highlights',
        notePlaceholder: 'Write a reading note (Ctrl+Enter to save)…',
        askPlaceholder: 'Write a question to export or ask an AI (Ctrl+Enter)…',
        cancel: 'Cancel',
        save: 'Save',
        notesBtn: (n) => '✎ Notes ' + n,
        notesModalTitle: 'Reading Notes & Questions',
        notesEmpty: 'No notes yet. Select any passage or click ✎ on a figure to add one.',
        tagNote: 'Note',
        tagAsk: 'Question',
        locate: 'Locate',
        del: 'Delete',
        copyMd: 'Copy Markdown',
        downloadMd: 'Download .md',
        clearAll: 'Clear all',
        confirmClear: 'Clear all saved notes for this paper?',
        close: '✕ Close',
        closeAria: 'Close',
        noteSaved: 'Saved locally',
        mdCopied: 'Copied Markdown to clipboard',
        lbTitle: 'Inspect Figure',
        lbHint: 'Wheel to zoom · Drag to pan · Double-click to reset',
        lbStepHint: '← / → step · Space play',
        lbOut: 'Zoom out',
        lbIn: 'Zoom in',
        lbFit: 'Reset',
        lbFitAria: 'Fit to window',
        lbCloseAria: 'Close fullscreen viewer',
      };

  function hashStr(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
    return (h >>> 0).toString(36);
  }
  const DOC_KEY = hashStr((document.title || 'paper') + '|' + (location.pathname || ''));

  function lsGet(k, fallback) {
    try {
      const v = localStorage.getItem(k);
      return v == null ? fallback : v;
    } catch (_) {
      return fallback;
    }
  }
  function lsSet(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (_) {}
  }

  let toastTimer = 0;
  function showToast(msg) {
    let t = document.getElementById('pdr-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'pdr-toast';
      t.className = 'pdr-toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return fallbackCopy(text);
  }
  function fallbackCopy(text) {
    return new Promise((resolve) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      ta.remove();
      resolve();
    });
  }

  // Shared Jump + Pulse + Return-to-Reading Pill
  let returnBtn = null;
  let returnY = null;
  let returnTimer = 0;
  function hideReturnBtn() {
    if (returnBtn) returnBtn.hidden = true;
    if (returnTimer) { clearTimeout(returnTimer); returnTimer = 0; }
  }
  function showReturnBtn(prevY) {
    returnY = prevY;
    if (!returnBtn) {
      returnBtn = document.createElement('button');
      returnBtn.type = 'button';
      returnBtn.className = 'pdr-jump-back';
      returnBtn.textContent = ui.jumpBack;
      returnBtn.addEventListener('click', () => {
        const y = returnY;
        hideReturnBtn();
        if (typeof y === 'number') {
          window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });
      document.body.appendChild(returnBtn);
    }
    returnBtn.hidden = false;
    if (returnTimer) clearTimeout(returnTimer);
    returnTimer = setTimeout(hideReturnBtn, 9500);
  }
  function jumpToElement(el, saveBack) {
    if (!el) return;
    const prevY = window.scrollY;
    const parentDetails = el.closest('details:not([open])');
    if (parentDetails) parentDetails.open = true;
    el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
    el.classList.remove('is-jump-target');
    void el.offsetWidth;
    el.classList.add('is-jump-target');
    setTimeout(() => el.classList.remove('is-jump-target'), 1650);
    if (saveBack) {
      const targetY = el.getBoundingClientRect().top + window.scrollY;
      if (Math.abs(targetY - prevY) > 220) showReturnBtn(prevY);
    }
  }

  // 1. Quiet Masthead Reading Controls (Theme, Font Scale, Print Helper)
  let mastheadTools = null;
  (function initReadingControls() {
    const savedTheme = lsGet('pdr-global:theme', '');
    if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

    const sizes = ['sm', 'md', 'lg'];
    let sizeIdx = Math.max(0, sizes.indexOf(lsGet('pdr-global:font', 'md')));
    if (sizeIdx !== 1) document.documentElement.setAttribute('data-font-size', sizes[sizeIdx]);

    const host = document.querySelector('.masthead-meta') || document.querySelector('.masthead-inner');
    if (host) {
      mastheadTools = document.createElement('span');
      mastheadTools.className = 'masthead-tools';

      const btnDec = document.createElement('button');
      btnDec.type = 'button';
      btnDec.className = 'mh-btn';
      btnDec.textContent = 'A−';
      btnDec.title = ui.fontDec;
      btnDec.setAttribute('aria-label', ui.fontDec);

      const btnInc = document.createElement('button');
      btnInc.type = 'button';
      btnInc.className = 'mh-btn';
      btnInc.textContent = 'A+';
      btnInc.title = ui.fontInc;
      btnInc.setAttribute('aria-label', ui.fontInc);

      const btnTheme = document.createElement('button');
      btnTheme.type = 'button';
      btnTheme.className = 'mh-btn';
      function syncThemeBtn() {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        btnTheme.textContent = dark ? '☀' : '☾';
        btnTheme.title = dark ? ui.themeLight : ui.themeDark;
        btnTheme.setAttribute('aria-label', btnTheme.title);
      }
      syncThemeBtn();

      btnDec.addEventListener('click', () => {
        sizeIdx = Math.max(0, sizeIdx - 1);
        document.documentElement.setAttribute('data-font-size', sizes[sizeIdx]);
        lsSet('pdr-global:font', sizes[sizeIdx]);
      });
      btnInc.addEventListener('click', () => {
        sizeIdx = Math.min(sizes.length - 1, sizeIdx + 1);
        document.documentElement.setAttribute('data-font-size', sizes[sizeIdx]);
        lsSet('pdr-global:font', sizes[sizeIdx]);
      });
      btnTheme.addEventListener('click', () => {
        const nextDark = document.documentElement.getAttribute('data-theme') !== 'dark';
        if (nextDark) document.documentElement.setAttribute('data-theme', 'dark');
        else document.documentElement.removeAttribute('data-theme');
        lsSet('pdr-global:theme', nextDark ? 'dark' : 'light');
        syncThemeBtn();
      });

      mastheadTools.append(btnDec, btnInc, btnTheme);
      host.appendChild(mastheadTools);
    }

    // Auto-open <details> for clean printing, restore afterward
    let openedForPrint = [];
    window.addEventListener('beforeprint', () => {
      openedForPrint = [];
      document.querySelectorAll('details:not([open])').forEach(d => {
        d.open = true;
        openedForPrint.push(d);
      });
    });
    window.addEventListener('afterprint', () => {
      openedForPrint.forEach(d => { d.open = false; });
      openedForPrint = [];
    });
  })();

  // 2. Navigation Progress & Option B Frameless Outline + Quiet Collapsible Figure/Eq Drawers
  (function initNavigationAndSidebar() {
    const bar = document.getElementById('scroll-progress');
    const tocList = document.getElementById('toc-list')
      || document.querySelector('.toc-card .toc-list, .sidebar .toc-list, ul.toc-list');
    const tocLinks = tocList ? Array.from(tocList.querySelectorAll('a')) : [];
    const sections = tocLinks.map(a => {
      const href = a.getAttribute('href') || '';
      return href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
    }).filter(Boolean);

    let footerPos = null;
    let miniFill = null;
    const tocCard = tocList
      ? (tocList.closest('.toc-card') || tocList.closest('nav') || tocList.closest('.sidebar'))
      : null;
    const mainScope = document.querySelector('.article-main') || document.querySelector('main') || document.body;
    if (tocCard && tocList) {
      const heading = tocCard.querySelector('.toc-heading');
      if (heading && !heading.textContent.trim()) heading.textContent = ui.outlineCap;

      const figs = Array.from(mainScope.querySelectorAll('.fig-frame'));
      const tables = Array.from(mainScope.querySelectorAll('.table-wrap, .explorer-card'))
        .filter(el => !(el.classList.contains('table-wrap') && el.closest('.explorer-card')));
      figs.forEach((f, i) => { if (!f.id) f.id = 'pdr-fig-' + (i + 1); });
      tables.forEach((t, i) => { if (!t.id) t.id = 'pdr-tab-' + (i + 1); });

      if (figs.length || tables.length) {
        const foldGroup = document.createElement('div');
        foldGroup.className = 'toc-fold-group';

        function buildFold(title, items) {
          const det = document.createElement('details');
          det.className = 'toc-fold';
          const sum = document.createElement('summary');
          const lblSpan = document.createElement('span');
          lblSpan.textContent = title;
          const cntSpan = document.createElement('span');
          cntSpan.className = 'toc-fold-cnt';
          cntSpan.textContent = String(items.length);
          sum.append(lblSpan, cntSpan);

          const ul = document.createElement('ul');
          items.forEach(({ el, text }) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + el.id;
            a.textContent = text;
            a.title = text;
            a.addEventListener('click', (ev) => {
              ev.preventDefault();
              jumpToElement(el, true);
            });
            li.appendChild(a);
            ul.appendChild(li);
          });
          det.append(sum, ul);
          return det;
        }

        if (figs.length) {
          const figItems = figs.map((f, i) => {
            const titleEl = f.querySelector('.fig-title');
            return { el: f, text: titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : ((isZh ? '图 ' : 'Fig. ') + (i + 1)) };
          });
          foldGroup.appendChild(buildFold(ui.foldFigs, figItems));
        }
        if (tables.length) {
          const tabItems = tables.map((tw, i) => {
            const innerTbl = tw.querySelector('table');
            let title = (tw.getAttribute('data-table-title') || (innerTbl && innerTbl.getAttribute('data-table-title')) || '').trim();
            if (!title) {
              const cap = tw.querySelector('caption, .fig-title, .explorer-title, h3, h4');
              if (cap) title = cap.textContent.replace(/\s+/g, ' ').trim();
            }
            if (!title) {
              const prev = tw.previousElementSibling;
              if (prev && /^H[34]$/i.test(prev.tagName)) title = prev.textContent.replace(/\s+/g, ' ').trim();
            }
            if (!title && innerTbl && innerTbl.hasAttribute('data-sym-table')) title = ui.symTableTitle;
            if (!title) title = (isZh ? '表 ' : 'Table ') + (i + 1);
            return { el: tw, text: title };
          });
          foldGroup.appendChild(buildFold(ui.foldTables, tabItems));
        }
        tocList.insertAdjacentElement('afterend', foldGroup);
      }

      // Reading progress bar & estimated reading time footer (exclude SVG/MathML/chrome tokens)
      const txtClone = mainScope.cloneNode(true);
      txtClone.querySelectorAll('svg, script, style, .katex-mathml, .tbl-tools, .steps-bar').forEach(el => el.remove());
      const rawTxt = txtClone.textContent || '';
      const cjk = (rawTxt.match(/[\u4e00-\u9fff]/g) || []).length;
      const latin = (rawTxt.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
      const mins = Math.max(2, Math.round(cjk / 420 + latin / 220));
      const foot = document.createElement('div');
      foot.className = 'toc-footer';
      const metaRow = document.createElement('div');
      metaRow.className = 'toc-meta-row';
      footerPos = document.createElement('span');
      footerPos.textContent = tocLinks.length ? ui.secProgress(1, tocLinks.length) : '';
      const est = document.createElement('span');
      est.textContent = ui.readMin(mins);
      metaRow.append(footerPos, est);
      const miniBar = document.createElement('div');
      miniBar.className = 'toc-mini-bar';
      miniFill = document.createElement('div');
      miniFill.className = 'toc-mini-fill';
      miniFill.style.width = tocLinks.length ? (100 / tocLinks.length).toFixed(1) + '%' : '0%';
      miniBar.appendChild(miniFill);
      foot.append(metaRow, miniBar);
      tocCard.appendChild(foot);
    }

    let rafPending = false;
    let activeIdx = 0;
    let cachedMaxScroll = 0;
    let sectionTops = [];
    let metricsTimer = 0;

    function refreshNavMetrics() {
      metricsTimer = 0;
      const doc = document.documentElement;
      cachedMaxScroll = Math.max(0, doc.scrollHeight - doc.clientHeight);
      const sy = window.scrollY;
      sectionTops = sections.map(s => s.getBoundingClientRect().top + sy);
    }
    function scheduleMetrics() {
      if (metricsTimer) clearTimeout(metricsTimer);
      metricsTimer = setTimeout(() => { refreshNavMetrics(); updateNav(); }, 120);
    }

    // Zero-reflow scroll handler: pure cached arithmetic + GPU transform (0 DOM layout reads!)
    function updateNav() {
      rafPending = false;
      const sy = window.scrollY;
      if (bar) {
        const ratio = cachedMaxScroll > 0 ? Math.min(1, Math.max(0, sy / cachedMaxScroll)) : 0;
        bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      }
      if (!sectionTops.length) return;
      let nextIdx = 0;
      if (sy >= 160) {
        const cutoff = sy + 170;
        for (let i = 0; i < sectionTops.length; i++) {
          if (sectionTops[i] <= cutoff) nextIdx = i;
        }
      }
      if (nextIdx !== activeIdx) {
        if (tocLinks[activeIdx]) tocLinks[activeIdx].classList.remove('active');
        if (tocLinks[nextIdx]) tocLinks[nextIdx].classList.add('active');
        activeIdx = nextIdx;
        if (footerPos) footerPos.textContent = ui.secProgress(activeIdx + 1, tocLinks.length);
        if (miniFill) miniFill.style.width = (((activeIdx + 1) / tocLinks.length) * 100).toFixed(1) + '%';
      }
    }

    if (tocLinks[0]) tocLinks[0].classList.add('active');
    refreshNavMetrics();
    window.addEventListener('load', () => { refreshNavMetrics(); updateNav(); });
    window.addEventListener('resize', scheduleMetrics, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      const mainForNav = document.querySelector('.article-main');
      if (mainForNav) new ResizeObserver(scheduleMetrics).observe(mainForNav);
    }
    window.addEventListener('scroll', () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateNav);
      }
    }, { passive: true });
    updateNav();
  })();

  // 3. Bidirectional Prose <-> SVG Linked Highlighting (O(k) incremental diffing)
  (function initLinkedHighlights() {
    const allLinked = Array.from(document.querySelectorAll('[data-ref], [data-ref-node]'));
    if (!allLinked.length) return;

    function keysOf(el) {
      const a = (el.getAttribute('data-ref') || '').trim();
      const b = (el.getAttribute('data-ref-node') || '').trim();
      return (a + ' ' + b).trim().split(/\s+/).filter(Boolean);
    }

    const byKey = new Map();
    const svgOwner = new WeakMap();
    allLinked.forEach(el => {
      const ks = keysOf(el);
      const svg = el.closest('svg');
      if (svg) svgOwner.set(el, svg);
      else if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      ks.forEach(k => {
        if (!byKey.has(k)) byKey.set(k, []);
        byKey.get(k).push(el);
      });
    });

    let activeKeys = null;
    let prevLitEls = [];
    let prevLitSvgs = [];

    function paint(keys) {
      activeKeys = keys;
      for (let i = 0; i < prevLitEls.length; i++) {
        const el = prevLitEls[i];
        el.classList.remove(svgOwner.has(el) ? 'is-highlighted' : 'is-active');
      }
      for (let i = 0; i < prevLitSvgs.length; i++) {
        prevLitSvgs[i].classList.remove('svg-dimmed');
      }
      prevLitEls = [];
      prevLitSvgs = [];
      if (!keys || !keys.length) return;

      const litSet = new Set();
      const svgSet = new Set();
      for (let i = 0; i < keys.length; i++) {
        const list = byKey.get(keys[i]);
        if (!list) continue;
        for (let j = 0; j < list.length; j++) {
          const el = list[j];
          litSet.add(el);
          const svg = svgOwner.get(el);
          if (svg) svgSet.add(svg);
        }
      }
      litSet.forEach(el => {
        el.classList.add(svgOwner.has(el) ? 'is-highlighted' : 'is-active');
        prevLitEls.push(el);
      });
      svgSet.forEach(svg => {
        svg.classList.add('svg-dimmed');
        prevLitSvgs.push(svg);
      });
    }

    allLinked.forEach(el => {
      const ks = keysOf(el);
      if (!ks.length) return;
      el.addEventListener('mouseenter', () => paint(ks));
      el.addEventListener('mouseleave', () => { if (activeKeys === ks) paint(null); });
      el.addEventListener('focus', () => paint(ks));
      el.addEventListener('blur', () => { if (activeKeys === ks) paint(null); });
    });
  })();

  // 4. Auto-Indexed Symbol Hover Quick-Card (manual data-sym + auto KaTeX formula binding + draggable floating sheet)
  (function initSymbolCards() {
    const manualRefs = Array.from(document.querySelectorAll('[data-sym]'));
    const symTables = Array.from(document.querySelectorAll('table[data-sym-table]'));
    const explicitDefRows = Array.from(document.querySelectorAll('tr[data-sym-def]'));
    if (!manualRefs.length && !symTables.length && !explicitDefRows.length) return;

    const symMap = new Map();
    const allEntries = [];
    function cleanKey(s) {
      return (s || '').replace(/\$/g, '').replace(/\s+/g, ' ').trim();
    }
    function normMathKey(s) {
      return (s || '')
        .replace(/[\s\u200b\u00a0\u2061]+/g, '')
        .replace(/['’]/g, '′')
        .trim();
    }
    function normLatexAlias(s) {
      return normMathKey(
        (s || '')
          .replace(/\$/g, '')
          .replace(/\\(?:mathrm|mathbf|boldsymbol|textbf|text|mathit|mathcal|operatorname)\s*\{([^}]*)\}/g, '$1')
          .replace(/\\sigma\b/g, 'σ')
          .replace(/\\Sigma\b/g, 'Σ')
          .replace(/\\Delta\b/g, 'Δ')
          .replace(/\\delta\b/g, 'δ')
          .replace(/\\alpha\b/g, 'α')
          .replace(/\\beta\b/g, 'β')
          .replace(/\\gamma\b/g, 'γ')
          .replace(/\\lambda\b/g, 'λ')
          .replace(/\\theta\b/g, 'θ')
          .replace(/\\omega\b/g, 'ω')
          .replace(/\\nu\b/g, 'ν')
          .replace(/\\mu\b/g, 'μ')
          .replace(/\\rho\b/g, 'ρ')
          .replace(/\\tau\b/g, 'τ')
          .replace(/\\phi\b/g, 'ϕ')
          .replace(/\\psi\b/g, 'ψ')
          .replace(/\\epsilon\b/g, 'ϵ')
          .replace(/\\varepsilon\b/g, 'ε')
          .replace(/\\max\b/g, 'max')
          .replace(/\\min\b/g, 'min')
          .replace(/[_^{}\\]/g, '')
      );
    }
    function indexRow(tr, explicitKeys) {
      const cells = Array.from(tr.querySelectorAll('td'));
      if (cells.length < 2) return;
      if (tr._pdrSymEntry) return;
      const symText = cleanKey(cells[0].textContent);
      const entry = { rowEl: tr, cells: cells, explicitKeys: explicitKeys || '' };
      tr._pdrSymEntry = entry;
      allEntries.push(entry);
      const keys = (explicitKeys || symText).split(',').map(cleanKey).filter(Boolean);
      keys.forEach(k => { if (!symMap.has(k)) symMap.set(k, entry); });
    }

    explicitDefRows.forEach(tr => indexRow(tr, tr.getAttribute('data-sym-def')));
    symTables.forEach(tbl => {
      tbl.querySelectorAll('tbody tr').forEach(tr => {
        indexRow(tr, tr.getAttribute('data-sym-def') || '');
      });
    });

    let pop = null;
    let activeRef = null;
    let hideTimer = 0;

    function closePop() {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = 0; }
      if (pop) { pop.remove(); pop = null; }
      if (activeRef) {
        if (Array.isArray(activeRef)) activeRef.forEach(n => n.classList.remove('is-sym-open'));
        else activeRef.classList.remove('is-sym-open');
        activeRef = null;
      }
    }
    function scheduleClose() {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(closePop, 150);
    }

    function openPopForEntry(anchorEl, entry, fallbackTip, fallbackDomain, highlightEls) {
      if (!entry && !fallbackTip) return;
      closePop();
      activeRef = highlightEls && highlightEls.length ? highlightEls : anchorEl;
      if (Array.isArray(activeRef)) activeRef.forEach(n => n.classList.add('is-sym-open'));
      else activeRef.classList.add('is-sym-open');

      pop = document.createElement('div');
      pop.className = 'pdr-sym-pop';
      pop.setAttribute('role', 'tooltip');

      const head = document.createElement('div');
      head.className = 'pdr-sym-head';
      const keyEl = document.createElement('span');
      keyEl.className = 'pdr-sym-key';
      if (entry && entry.cells[0]) {
        Array.from(entry.cells[0].childNodes).forEach(n => keyEl.appendChild(n.cloneNode(true)));
      } else {
        Array.from(anchorEl.childNodes).forEach(n => keyEl.appendChild(n.cloneNode(true)));
      }
      head.appendChild(keyEl);

      if (entry && entry.cells.length >= 3) {
        const domEl = document.createElement('span');
        domEl.className = 'pdr-sym-domain';
        Array.from(entry.cells[1].childNodes).forEach(n => domEl.appendChild(n.cloneNode(true)));
        head.appendChild(domEl);
      } else if (!entry && fallbackDomain) {
        const domEl = document.createElement('span');
        domEl.className = 'pdr-sym-domain';
        domEl.textContent = fallbackDomain;
        head.appendChild(domEl);
      }
      pop.appendChild(head);

      const body = document.createElement('p');
      body.className = 'pdr-sym-body';
      if (entry) {
        const mCells = entry.cells.slice(entry.cells.length >= 3 ? 2 : 1);
        mCells.forEach((c, idx) => {
          if (idx > 0) body.appendChild(document.createTextNode(' — '));
          Array.from(c.childNodes).forEach(n => body.appendChild(n.cloneNode(true)));
        });
      } else {
        body.textContent = fallbackTip;
      }
      pop.appendChild(body);

      if (entry && entry.rowEl) {
        const foot = document.createElement('div');
        foot.className = 'pdr-sym-foot';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pdr-sym-jump';
        btn.textContent = ui.symJump;
        btn.addEventListener('click', () => {
          const target = entry.rowEl;
          closePop();
          jumpToElement(target, true);
        });
        foot.appendChild(btn);
        pop.appendChild(foot);
      }

      if (typeof window.renderMathInElement === 'function' && pop.textContent.indexOf('$') !== -1) {
        window.renderMathInElement(pop, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'svg'],
          throwOnError: false,
        });
      }

      pop.addEventListener('mouseenter', () => { if (hideTimer) { clearTimeout(hideTimer); hideTimer = 0; } });
      pop.addEventListener('mouseleave', scheduleClose);
      document.body.appendChild(pop);

      const rect = anchorEl.getBoundingClientRect();
      const pw = pop.offsetWidth;
      const ph = pop.offsetHeight;
      let left = rect.left + rect.width / 2 - pw / 2;
      left = Math.max(12, Math.min(left, window.innerWidth - pw - 12));
      let top = rect.bottom + 8;
      if (top + ph > window.innerHeight - 12) top = Math.max(12, rect.top - ph - 8);
      pop.style.left = left.toFixed(0) + 'px';
      pop.style.top = top.toFixed(0) + 'px';
    }

    function openPop(el) {
      const rawKey = cleanKey(el.getAttribute('data-sym'));
      const tip = (el.getAttribute('data-sym-tip') || '').trim();
      const entry = symMap.get(rawKey) || null;
      openPopForEntry(el, entry, tip, el.getAttribute('data-sym-domain') || '', null);
    }

    manualRefs.forEach(el => {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      el.addEventListener('mouseenter', () => openPop(el));
      el.addEventListener('mouseleave', scheduleClose);
      el.addEventListener('focus', () => openPop(el));
      el.addEventListener('blur', scheduleClose);
      el.addEventListener('click', (e) => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) return;
        e.stopPropagation();
        if (activeRef === el) closePop();
        else openPop(el);
      });
    });

    // Automatic hover binding onto rendered KaTeX formulas (both display $$...$$ and inline $...$)
    function buildKatexSymMap() {
      const kMap = new Map();
      function reg(rawKey, entry) {
        const k = normMathKey(rawKey);
        if (!k || /^\d+(?:\.\d+)?$/.test(k)) return;
        if (!kMap.has(k)) kMap.set(k, entry);
      }
      allEntries.forEach(entry => {
        const c0 = entry.cells[0];
        if (c0) {
          const kHtmls = c0.querySelectorAll('.katex-html');
          if (kHtmls.length) {
            kHtmls.forEach(kh => {
              const parts = (kh.textContent || '').split(/[,，、;]/);
              parts.forEach(part => {
                const lhs = part.split(/[=∈:]/)[0];
                reg(lhs, entry);
                // Also register bare symbol before function arg e.g. f_ch(ν) -> f_ch
                const bare = lhs.replace(/\([^)]*\)\s*$/, '');
                if (bare && bare !== lhs) reg(bare, entry);
              });
            });
          } else {
            const parts = (c0.textContent || '').replace(/\$/g, '').split(/[,，、;]/);
            parts.forEach(p => {
              const lhs = p.split(/[=∈:]/)[0];
              reg(normLatexAlias(lhs), entry);
            });
          }
        }
        if (entry.explicitKeys) {
          entry.explicitKeys.split(',').forEach(alias => {
            const nk = normLatexAlias(alias);
            if (nk) reg(nk, entry);
          });
        }
      });
      return kMap;
    }

    function bindRenderedKatexSymbols() {
      if (!allEntries.length) return;
      const kMap = buildKatexSymMap();
      if (!kMap.size) return;
      const scope = document.querySelector('.article-main') || document.body;

      function attach(nodes, entry) {
        nodes.forEach(n => {
          n.classList.add('pdr-ksym');
          n.addEventListener('mouseenter', () => openPopForEntry(nodes[0], entry, '', '', nodes));
          n.addEventListener('mouseleave', scheduleClose);
          n.addEventListener('click', (ev) => {
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed) return;
            ev.stopPropagation();
            if (activeRef === nodes) closePop();
            else openPopForEntry(nodes[0], entry, '', '', nodes);
          });
        });
      }

      const SKIP_CLS = ['strut', 'mspace', 'mbin', 'mrel', 'mopen', 'mclose', 'mpunct', 'mop'];
      function hasSkipCls(el) {
        for (let i = 0; i < SKIP_CLS.length; i++) {
          if (el.classList.contains(SKIP_CLS[i])) return true;
        }
        return false;
      }

      function scanEl(parent, inSubSup) {
        const kids = Array.from(parent.children);
        for (let i = 0; i < kids.length; i++) {
          const ch = kids[i];
          if (hasSkipCls(ch) || ch.classList.contains('mathbb')) continue;
          const isMord = ch.classList.contains('mord');
          // 1. Check 2-sibling multi-token symbol first (e.g. \Delta\sigma)
          if (!inSubSup && isMord && i + 1 < kids.length && kids[i + 1].classList.contains('mord') && !kids[i + 1].classList.contains('mathbb')) {
            const k2 = normMathKey((ch.textContent || '') + (kids[i + 1].textContent || ''));
            if (k2.length >= 2 && kMap.has(k2)) {
              attach([ch, kids[i + 1]], kMap.get(k2));
              i++;
              continue;
            }
          }
          // 2. Check single .mord token (longest match: composite f_ch matched before recursing into f)
          if (isMord) {
            const k1 = normMathKey(ch.textContent || '');
            // Protect subscript/superscript single-letter indices (e.g. b in f_b) from false triggers
            if (k1 && !(inSubSup && k1.length <= 1) && kMap.has(k1)) {
              attach([ch], kMap.get(k1));
              continue;
            }
          }
          // 3. Recurse deeper into fractions, roots, groups, and scripts
          if (ch.children && ch.children.length) {
            scanEl(ch, inSubSup || ch.classList.contains('msupsub'));
          }
        }
      }

      scope.querySelectorAll('.katex').forEach(kEl => {
        if (kEl.dataset.pdrSymBound) return;
        if (kEl.closest('table[data-sym-table], [data-sym], .pdr-sym-pop, .pdr-sym-float')) return;
        const kh = kEl.querySelector('.katex-html');
        if (!kh) return;
        kEl.dataset.pdrSymBound = '1';
        scanEl(kh, false);
      });
    }

    window.addEventListener('load', () => {
      bindRenderedKatexSymbols();
      setTimeout(bindRenderedKatexSymbols, 450);
    });
    setTimeout(bindRenderedKatexSymbols, 250);

    // Pinnable, Draggable Floating Symbol Cheat-Sheet (auto-mounted when table[data-sym-table] exists)
    const primarySymTable = symTables[0] || null;
    let floatPanel = null;
    let floatBtnMh = null;

    function clampFloatPos(panel, left, top) {
      const pw = panel.offsetWidth || 380;
      const ph = panel.offsetHeight || 60;
      return {
        x: Math.max(8, Math.min(left, window.innerWidth - pw - 8)),
        y: Math.max(8, Math.min(top, window.innerHeight - ph - 8)),
      };
    }

    function openSymbolFloat() {
      if (!primarySymTable) return;
      if (floatPanel) {
        floatPanel.hidden = false;
        floatPanel.classList.remove('is-min');
        if (floatBtnMh) floatBtnMh.classList.add('is-accent');
        return;
      }

      floatPanel = document.createElement('div');
      floatPanel.className = 'pdr-sym-float';
      floatPanel.setAttribute('role', 'dialog');
      floatPanel.setAttribute('aria-label', ui.symFloatTitle);

      const head = document.createElement('div');
      head.className = 'pdr-sf-head';
      const title = document.createElement('span');
      title.className = 'pdr-sf-title';
      title.textContent = ui.symFloatTitle;
      const acts = document.createElement('span');
      acts.className = 'pdr-sf-actions';

      const bMin = document.createElement('button');
      bMin.type = 'button';
      bMin.className = 'pdr-sf-btn';
      bMin.textContent = '—';
      bMin.title = ui.symMin;
      bMin.setAttribute('aria-label', ui.symMin);
      bMin.addEventListener('click', (e) => {
        e.stopPropagation();
        floatPanel.classList.toggle('is-min');
        bMin.textContent = floatPanel.classList.contains('is-min') ? '▢' : '—';
      });

      const bClose = document.createElement('button');
      bClose.type = 'button';
      bClose.className = 'pdr-sf-btn';
      bClose.textContent = '×';
      bClose.title = ui.closeAria;
      bClose.setAttribute('aria-label', ui.closeAria);
      bClose.addEventListener('click', (e) => {
        e.stopPropagation();
        floatPanel.hidden = true;
        if (floatBtnMh) floatBtnMh.classList.remove('is-accent');
      });
      acts.append(bMin, bClose);
      head.append(title, acts);
      floatPanel.appendChild(head);

      const body = document.createElement('div');
      body.className = 'pdr-sf-body';
      const tblClone = primarySymTable.cloneNode(true);
      tblClone.removeAttribute('id');
      tblClone.removeAttribute('data-sym-table');
      tblClone.removeAttribute('data-interactive');
      tblClone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      if (typeof window.renderMathInElement === 'function' && tblClone.textContent.indexOf('$') !== -1) {
        window.renderMathInElement(tblClone, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'svg'],
          throwOnError: false,
        });
      }
      body.appendChild(tblClone);

      const clonedRows = Array.from(tblClone.querySelectorAll('tbody tr'));
      if (clonedRows.length >= 5) {
        const sWrap = document.createElement('div');
        sWrap.className = 'pdr-sf-search';
        const sInp = document.createElement('input');
        sInp.type = 'search';
        sInp.placeholder = ui.symSearch;
        sInp.setAttribute('aria-label', ui.symSearch);
        sInp.addEventListener('input', () => {
          const q = sInp.value.trim().toLowerCase();
          clonedRows.forEach(r => {
            r.hidden = !!(q && !r.textContent.toLowerCase().includes(q));
          });
        });
        sWrap.appendChild(sInp);
        floatPanel.appendChild(sWrap);
      }
      floatPanel.appendChild(body);
      document.body.appendChild(floatPanel);

      // Default unobtrusive bottom-right dock
      const initLeft = Math.max(12, window.innerWidth - floatPanel.offsetWidth - 22);
      const initTop = Math.max(72, window.innerHeight - floatPanel.offsetHeight - 22);
      floatPanel.style.left = initLeft.toFixed(0) + 'px';
      floatPanel.style.top = initTop.toFixed(0) + 'px';
      if (floatBtnMh) floatBtnMh.classList.add('is-accent');

      // Smooth clamped pointer dragging via header bar
      let dragOn = false, sx = 0, sy = 0, ox = 0, oy = 0;
      head.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || e.target.closest('button')) return;
        dragOn = true;
        sx = e.clientX;
        sy = e.clientY;
        const r = floatPanel.getBoundingClientRect();
        ox = r.left;
        oy = r.top;
        head.classList.add('is-dragging');
        head.setPointerCapture(e.pointerId);
      });
      head.addEventListener('pointermove', (e) => {
        if (!dragOn) return;
        const pos = clampFloatPos(floatPanel, ox + (e.clientX - sx), oy + (e.clientY - sy));
        floatPanel.style.left = pos.x.toFixed(0) + 'px';
        floatPanel.style.top = pos.y.toFixed(0) + 'px';
      });
      function stopDrag(e) {
        if (!dragOn) return;
        dragOn = false;
        head.classList.remove('is-dragging');
        if (e && head.hasPointerCapture && head.hasPointerCapture(e.pointerId)) {
          head.releasePointerCapture(e.pointerId);
        }
      }
      head.addEventListener('pointerup', stopDrag);
      head.addEventListener('pointercancel', stopDrag);
      window.addEventListener('resize', () => {
        if (!floatPanel || floatPanel.hidden) return;
        const r = floatPanel.getBoundingClientRect();
        const pos = clampFloatPos(floatPanel, r.left, r.top);
        floatPanel.style.left = pos.x.toFixed(0) + 'px';
        floatPanel.style.top = pos.y.toFixed(0) + 'px';
      }, { passive: true });
    }

    function toggleSymbolFloat() {
      if (floatPanel && !floatPanel.hidden) {
        floatPanel.hidden = true;
        if (floatBtnMh) floatBtnMh.classList.remove('is-accent');
      } else {
        openSymbolFloat();
      }
    }

    if (primarySymTable) {
      // Entry 1: Quiet Masthead button so user can open symbol sheet from anywhere in the paper
      if (mastheadTools) {
        floatBtnMh = document.createElement('button');
        floatBtnMh.type = 'button';
        floatBtnMh.className = 'mh-btn';
        floatBtnMh.textContent = ui.symFloatBtn;
        floatBtnMh.title = ui.symFloatTitle;
        floatBtnMh.addEventListener('click', toggleSymbolFloat);
        mastheadTools.prepend(floatBtnMh);
      }
      // Entry 2: Quiet pin button on the symbol table card itself
      const symWrap = primarySymTable.closest('.table-wrap');
      if (symWrap) {
        const pinBtn = document.createElement('button');
        pinBtn.type = 'button';
        pinBtn.className = 'tbl-btn';
        pinBtn.textContent = ui.symPinBtn;
        pinBtn.addEventListener('click', openSymbolFloat);
        const existingTools = symWrap.querySelector('.tbl-tools');
        if (existingTools) {
          existingTools.appendChild(pinBtn);
        } else {
          const pinBar = document.createElement('div');
          pinBar.className = 'sym-pin-bar';
          pinBar.appendChild(pinBtn);
          symWrap.insertBefore(pinBar, primarySymTable);
        }
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePop();
        if (floatPanel && !floatPanel.hidden) {
          floatPanel.hidden = true;
          if (floatBtnMh) floatBtnMh.classList.remove('is-accent');
        }
      }
    });
    document.addEventListener('click', (e) => {
      if (!pop) return;
      const inActive = Array.isArray(activeRef) ? activeRef.includes(e.target) : (e.target === activeRef);
      if (!pop.contains(e.target) && !inActive) closePop();
    });
  })();

  // 5. Declarative Flowchart Stepper & Proportional Flow Dots (.fig-steps)
  (function initDeclarativeSteppers() {
    function parseStepTokens(el, total) {
      return (el.getAttribute('data-step') || '').trim().split(/\s+/).map(tok => {
        if (tok === 'final') return total;
        const v = Number(tok);
        return Number.isFinite(v) ? v : -1;
      }).filter(v => v >= 0);
    }

    function getNonZeroSteps(el, total) {
      const seen = new Set();
      const out = [];
      parseStepTokens(el, total).forEach(v => {
        if (v >= 1 && v <= total && !seen.has(v)) {
          seen.add(v);
          out.push(v);
        }
      });
      return out;
    }

    function syncNodes(container, cur, stillMode, total) {
      container.classList.toggle('is-still', !!stillMode);
      container.classList.toggle('is-full', cur === total);
      const sEls = Array.from(container.querySelectorAll('[data-step]'))
        .filter(el => !el.closest('.steps-notes') && !el.closest('.step-vals'));
      sEls.forEach(el => {
        const nums = parseStepTokens(el, total);
        if (!nums.length) return;
        const isOnly = el.classList.contains('step-only');
        const onNow = nums.includes(cur);
        if (isOnly) {
          el.classList.toggle('is-now', onNow);
        } else {
          el.classList.toggle('is-on', nums[0] <= cur);
          el.classList.toggle('is-now', onNow);
        }
      });
    }

    function syncVals(container, cur, total) {
      container.querySelectorAll('.step-vals').forEach(grp => {
        const kids = Array.from(grp.querySelectorAll('[data-step]'));
        let best = null;
        let bestStep = -1;
        kids.forEach(kid => {
          parseStepTokens(kid, total).forEach(s => {
            if (s <= cur && s >= bestStep) { bestStep = s; best = kid; }
          });
        });
        kids.forEach(kid => kid.classList.toggle('is-val-active', kid === best));
      });
    }

    function syncStepperDom(container, cur, stillMode, total) {
      syncNodes(container, cur, stillMode, total);
      syncVals(container, cur, total);
    }

    document.querySelectorAll('.fig-steps').forEach(root => {
      const notes = Array.from(root.querySelectorAll('.steps-notes > li'));
      const n = notes.length;
      if (!n) return;

      let bar = root.querySelector('.steps-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'steps-bar';
        const notesEl = root.querySelector('.steps-notes');
        if (notesEl) notesEl.insertAdjacentElement('beforebegin', bar);
        else root.appendChild(bar);
      }

      if (!bar.querySelector('[data-step-play]')) {
        bar.innerHTML =
          '<button type="button" class="btn" data-step-go="-1">' + ui.prev + '</button>' +
          '<button type="button" class="btn btn-primary" data-step-play>' + ui.play + '</button>' +
          '<input type="range" class="player-range" min="0" max="' + (n - 1) + '" value="' + (n - 1) + '" aria-label="Step">' +
          '<button type="button" class="btn" data-step-go="1">' + ui.next + '</button>' +
          '<span class="step-badge" data-step-badge>' + n + ' / ' + n + '</span>';
      }

      const range = bar.querySelector('input[type="range"]');
      const playBtn = bar.querySelector('[data-step-play]');
      const badge = bar.querySelector('[data-step-badge]');
      let idx = n - 1;
      let stillState = true;
      let timer = 0;
      let previewIdx = null;
      let hoverTimer = 0;
      let leaveTimer = 0;

      function clearPreviewTimers() {
        if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = 0; }
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = 0; }
      }

      function emitState() {
        const activeIdx = previewIdx !== null ? previewIdx : idx;
        root.dispatchEvent(new CustomEvent('pdr:step', {
          detail: {
            step: activeIdx + 1,
            index: activeIdx,
            committedIndex: idx,
            total: n,
            still: stillState,
            playing: !!timer,
            preview: previewIdx !== null,
          },
        }));
      }

      function renderNotesAndBadge() {
        const isPrev = previewIdx !== null;
        const activeIdx = isPrev ? previewIdx : idx;
        root.classList.toggle('is-previewing', isPrev);
        notes.forEach((li, j) => { li.hidden = j !== activeIdx; });
        if (badge) {
          badge.textContent = isPrev ? ui.stepPreview(activeIdx + 1, n) : ((idx + 1) + ' / ' + n);
          badge.classList.toggle('is-preview', isPrev);
        }
      }

      function clearPreview(silent) {
        clearPreviewTimers();
        if (previewIdx === null) return;
        previewIdx = null;
        syncVals(root, idx + 1, n);
        renderNotesAndBadge();
        if (!silent) emitState();
      }

      function preview(k) {
        if (timer) return;
        const target = Math.max(0, Math.min(n - 1, k));
        if (previewIdx === target) return;
        previewIdx = target;
        syncVals(root, target + 1, n);
        renderNotesAndBadge();
        emitState();
      }

      function show(k, stillMode) {
        clearPreviewTimers();
        previewIdx = null;
        idx = Math.max(0, Math.min(n - 1, k));
        stillState = !!stillMode;
        const cur = idx + 1;
        syncStepperDom(root, cur, stillState, n);
        renderNotesAndBadge();
        if (range) range.value = String(idx);
        emitState();
      }

      function stop() {
        const wasPlaying = !!timer;
        if (timer) { clearInterval(timer); timer = 0; }
        if (playBtn) playBtn.textContent = ui.play;
        if (wasPlaying) emitState();
      }

      function jump(k) {
        stop();
        show(k, false);
      }

      function togglePlay() {
        if (timer) { stop(); return; }
        clearPreview(true);
        if (idx === n - 1) show(0, false);
        if (playBtn) playBtn.textContent = ui.pause;
        timer = setInterval(() => {
          if (idx < n - 1) show(idx + 1, false);
          else stop();
        }, 2800);
        emitState();
      }

      // Mark clickable/hoverable stage cards inside SVG (exclude .step-vals, .step-only, [data-jump], connector paths)
      Array.from(root.querySelectorAll('svg [data-step]')).forEach(el => {
        if (el.closest('.step-vals, .steps-notes, [data-jump]')) return;
        if (el.hasAttribute('data-jump') || el.classList.contains('step-only')) return;
        if (el.parentElement && el.parentElement.closest('.is-step-card')) return;
        const isCard = el.classList.contains('svg-node')
          || el.hasAttribute('data-ref-node')
          || (el.tagName.toLowerCase() === 'g' && !!el.querySelector('rect, circle, ellipse, polygon'));
        if (!isCard) return;
        if (!getNonZeroSteps(el, n).length) return;
        el.classList.add('is-step-card');
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
      });

      function bindStepCards(scopeEl, opts) {
        if (!scopeEl) return () => {};
        let activeCard = null;

        function findCard(target) {
          if (!target || !target.closest) return null;
          const card = target.closest('.is-step-card');
          if (!card || !scopeEl.contains(card)) return null;
          if (card.hasAttribute('data-jump') || card.closest('[data-jump]')) return null;
          return card;
        }

        function pickHoverStep(card) {
          const steps = getNonZeroSteps(card, n);
          if (!steps.length) return -1;
          return steps.includes(idx + 1) ? (idx + 1) : steps[0];
        }

        function triggerCardJump(card) {
          const steps = getNonZeroSteps(card, n);
          if (!steps.length) return;
          const curStep = idx + 1;
          const pos = steps.indexOf(curStep);
          const nextStep = (steps.length > 1 && pos >= 0) ? steps[(pos + 1) % steps.length] : steps[0];
          jump(nextStep - 1);
        }

        function schedulePreview(card) {
          if (timer || (opts && opts.isDragging && opts.isDragging())) return;
          if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = 0; }
          const targetStep = pickHoverStep(card);
          if (targetStep < 1) return;
          if (previewIdx !== null) {
            if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = 0; }
            preview(targetStep - 1);
          } else {
            if (hoverTimer) clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
              hoverTimer = 0;
              if (!timer && activeCard === card && !(opts && opts.isDragging && opts.isDragging())) {
                const s = pickHoverStep(card);
                if (s >= 1) preview(s - 1);
              }
            }, 120);
          }
        }

        function scheduleLeave() {
          if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = 0; }
          activeCard = null;
          if (previewIdx === null) return;
          if (leaveTimer) clearTimeout(leaveTimer);
          leaveTimer = setTimeout(() => {
            leaveTimer = 0;
            if (!activeCard) clearPreview();
          }, 100);
        }

        const onMouseOver = (e) => {
          const card = findCard(e.target);
          if (!card || card === activeCard) return;
          activeCard = card;
          schedulePreview(card);
        };
        const onMouseOut = (e) => {
          const card = findCard(e.target);
          if (!card) return;
          const next = findCard(e.relatedTarget);
          if (next === card) return;
          if (next) {
            activeCard = next;
            schedulePreview(next);
            return;
          }
          scheduleLeave();
        };
        const onFocusIn = (e) => {
          const card = findCard(e.target);
          if (!card) return;
          activeCard = card;
          clearPreviewTimers();
          if (!timer) {
            const targetStep = pickHoverStep(card);
            if (targetStep >= 1) preview(targetStep - 1);
          }
        };
        const onFocusOut = (e) => {
          const card = findCard(e.target);
          if (!card) return;
          const next = findCard(e.relatedTarget);
          if (next) return;
          activeCard = null;
          clearPreview();
        };
        const onClick = (e) => {
          const card = findCard(e.target);
          if (!card) return;
          if (opts && opts.wasDragged && opts.wasDragged()) return;
          e.stopPropagation();
          triggerCardJump(card);
        };
        const onKeyDown = (e) => {
          const card = findCard(e.target);
          if (!card) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            triggerCardJump(card);
          }
        };

        scopeEl.addEventListener('mouseover', onMouseOver);
        scopeEl.addEventListener('mouseout', onMouseOut);
        scopeEl.addEventListener('focusin', onFocusIn);
        scopeEl.addEventListener('focusout', onFocusOut);
        scopeEl.addEventListener('click', onClick);
        scopeEl.addEventListener('keydown', onKeyDown);

        return () => {
          scopeEl.removeEventListener('mouseover', onMouseOver);
          scopeEl.removeEventListener('mouseout', onMouseOut);
          scopeEl.removeEventListener('focusin', onFocusIn);
          scopeEl.removeEventListener('focusout', onFocusOut);
          scopeEl.removeEventListener('click', onClick);
          scopeEl.removeEventListener('keydown', onKeyDown);
        };
      }

      root.querySelectorAll('svg').forEach(svg => bindStepCards(svg));

      bar.addEventListener('click', (e) => {
        const go = e.target.closest('[data-step-go]');
        if (go) {
          stop();
          show(idx + Number(go.getAttribute('data-step-go')), false);
          return;
        }
        if (e.target.closest('[data-step-play]')) togglePlay();
      });

      if (range) {
        range.addEventListener('input', () => {
          stop();
          show(Number(range.value), false);
        });
      }

      root._pdrStepper = {
        count: n,
        getIndex: () => idx,
        getActiveIndex: () => (previewIdx !== null ? previewIdx : idx),
        isPreviewing: () => previewIdx !== null,
        isStill: () => stillState,
        isPlaying: () => !!timer,
        show,
        jump,
        preview,
        clearPreview,
        go: (delta) => { stop(); show(idx + delta, false); },
        togglePlay,
        stop,
        applyTo: (targetEl) => {
          syncNodes(targetEl, idx + 1, stillState, n);
          syncVals(targetEl, (previewIdx !== null ? previewIdx : idx) + 1, n);
        },
        bindStepCards,
        getNoteEl: (k) => notes[k] || null,
      };

      show(n - 1, true);
      window.addEventListener('beforeprint', () => { clearPreview(true); stop(); show(n - 1, true); });
    });

    // Proportional Flow Dots (auto-layered behind node cards + pre-sampled LUT + 30fps cap)
    if (!prefersReducedMotion && typeof IntersectionObserver !== 'undefined') {
      document.querySelectorAll('svg').forEach(svg => {
        const routeEls = Array.from(svg.querySelectorAll('path[data-flow]'));
        if (!routeEls.length) return;
        let layer = svg.querySelector('.flow-dots');
        if (!layer) {
          layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          layer.setAttribute('class', 'flow-dots');
          layer.setAttribute('aria-hidden', 'true');
          svg.appendChild(layer);
        }
        // Keep flow dots BEHIND node cards so particles only travel along visible wires and never block card text
        const firstCard = svg.querySelector('.svg-node, rect.d-teal, rect.d-sage, rect.d-ochre, rect.d-terra, rect.d-card');
        if (firstCard && firstCard.parentNode === svg) {
          svg.insertBefore(layer, firstCard);
        }
        const stepper = svg.closest('.fig-steps');
        const SAMPLES = 96;
        const routes = routeEls.map((p, ri) => {
          const len = p.getTotalLength ? p.getTotalLength() : 0;
          if (len <= 10) return null;
          const lut = new Float32Array((SAMPLES + 1) * 2);
          for (let i = 0; i <= SAMPLES; i++) {
            const pt = p.getPointAtLength((len * i) / SAMPLES);
            lut[i * 2] = pt.x;
            lut[i * 2 + 1] = pt.y;
          }
          return {
            len: len,
            speed: Math.min(0.14, Math.max(0.055, len / 700)),
            lut: lut,
            every: Math.max(400, Number(p.getAttribute('data-every')) || 1250),
            cls: 'flow-dot ' + (p.getAttribute('data-flow') || 'teal'),
            next: ri * 260,
          };
        }).filter(Boolean);
        if (!routes.length) return;

        let dots = [];
        let visible = false;
        let running = false;
        let lastFrame = 0;

        function isLive() {
          return visible && !document.hidden && (!stepper || stepper.classList.contains('is-full'));
        }
        function tick(t) {
          if (!isLive()) {
            running = false;
            dots.forEach(d => d.c.remove());
            dots = [];
            return;
          }
          if (t - lastFrame < 32) {
            requestAnimationFrame(tick);
            return;
          }
          lastFrame = t;
          for (let ri = 0; ri < routes.length; ri++) {
            const r = routes[ri];
            if (t >= r.next) {
              r.next = t + r.every;
              const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              c.setAttribute('r', '3.3');
              c.setAttribute('class', r.cls);
              c.setAttribute('cx', '0');
              c.setAttribute('cy', '0');
              c.style.transform = 'translate3d(' + r.lut[0].toFixed(1) + 'px,' + r.lut[1].toFixed(1) + 'px,0)';
              layer.appendChild(c);
              dots.push({ c: c, r: r, t0: t });
            }
          }
          dots = dots.filter(d => {
            const frac = ((t - d.t0) * d.r.speed) / d.r.len;
            if (frac >= 1) { d.c.remove(); return false; }
            const pos = frac * SAMPLES;
            const i0 = pos | 0;
            const i1 = Math.min(SAMPLES, i0 + 1);
            const alpha = pos - i0;
            const x = d.r.lut[i0 * 2] + (d.r.lut[i1 * 2] - d.r.lut[i0 * 2]) * alpha;
            const y = d.r.lut[i0 * 2 + 1] + (d.r.lut[i1 * 2 + 1] - d.r.lut[i0 * 2 + 1]) * alpha;
            d.c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
            return true;
          });
          requestAnimationFrame(tick);
        }
        function start() {
          if (!running && isLive()) {
            running = true;
            requestAnimationFrame(tick);
          }
        }
        if (stepper) stepper.addEventListener('pdr:step', start);
        document.addEventListener('visibilitychange', start);
        new IntersectionObserver((entries) => {
          visible = !!(entries[0] && entries[0].isIntersecting);
          start();
        }, { threshold: 0.1 }).observe(svg);
      });
    }
  })();

  function setViewPanelVisible(p, visible) {
    p.classList.toggle('is-view-hidden', !visible);
    if (visible) {
      if (p.style && p.style.display === 'none') p.style.display = '';
      if (p.hidden) p.hidden = false;
    }
  }

  // 6. Same-Coordinate View Switch / Before-After Toggle
  (function initViewSwitches() {
    document.querySelectorAll('.fig-frame').forEach(frame => {
      const btns = Array.from(frame.querySelectorAll('[data-set-view]'));
      if (!btns.length) return;
      const panels = Array.from(frame.querySelectorAll('[data-view-panel]'));

      function applyView(key) {
        frame.setAttribute('data-view', key);
        btns.forEach(b => {
          const on = b.getAttribute('data-set-view') === key;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        panels.forEach(p => {
          const allowed = (p.getAttribute('data-view-panel') || '').trim().split(/\s+/);
          setViewPanelVisible(p, allowed.includes(key));
        });
        frame.dispatchEvent(new CustomEvent('pdr:view', { detail: { view: key } }));
      }

      btns.forEach(b => {
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          applyView(b.getAttribute('data-set-view'));
        });
      });

      frame._pdrView = {
        views: btns.map(b => ({ key: b.getAttribute('data-set-view'), label: b.textContent.trim() })),
        getActive: () => frame.getAttribute('data-view') || '',
        setView: applyView,
      };

      const initial = frame.getAttribute('data-view')
        || (btns.find(b => b.classList.contains('is-active')) || btns[0]).getAttribute('data-set-view');
      if (initial) applyView(initial);
    });
  })();

  // 7. Declarative Interactive Data Tables (table[data-interactive])
  (function initInteractiveTables() {
    function parseStrictNum(raw) {
      const s = (raw || '').replace(/,/g, '').replace(/[−–—]/g, '-').trim();
      if (!s || /^(-|n\/a|na|—|–)$/i.test(s)) return null;
      if (/^\d{4}-\d{2}/.test(s) || /\//.test(s)) return null;
      const m = s.match(/^[~≈<>≤≥±+]?\s*([-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)(?:\s*±\s*\d+(?:\.\d+)?)?\s*(?:[%×x]|[A-Za-zµμ°]{1,6})?$/);
      return m ? Number(m[1]) : null;
    }

    document.querySelectorAll('table[data-interactive]').forEach(table => {
      if (table.closest('.explorer-card')) return;
      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');
      if (!thead || !tbody) return;

      const allRows = Array.from(tbody.querySelectorAll('tr'));
      const totalRows = allRows.filter(r => r.classList.contains('row-total'));
      const dataRows = allRows.filter(r => !r.classList.contains('row-total'));
      if (!dataRows.length) return;

      const hasBodySpan = dataRows.some(r => r.querySelector('[rowspan], [colspan]'));
      const headRows = Array.from(thead.querySelectorAll('tr'));
      const hasHeadSpan = headRows.length !== 1 || !!thead.querySelector('[rowspan], [colspan]');
      const ths = headRows.length === 1 ? Array.from(headRows[0].querySelectorAll('th')) : [];
      const canSort = !hasBodySpan && !hasHeadSpan && dataRows.length >= 5 && ths.length > 0;

      // Extrema highlighting strictly honors AI-declared data-better="high"|"low" columns only
      const extremaCols = [];
      const sortNumericCols = new Set();
      if (!hasBodySpan && ths.length) {
        ths.forEach((th, colIdx) => {
          const dir = (th.getAttribute('data-better') || '').trim().toLowerCase();
          if (dir === 'high' || dir === 'low') {
            extremaCols.push({ colIdx, lowBetter: dir === 'low' });
          }
          let nums = 0;
          dataRows.forEach(r => {
            const td = r.children[colIdx];
            if (td && parseStrictNum(td.textContent) !== null) nums++;
          });
          if (nums >= Math.max(3, Math.ceil(dataRows.length * 0.6))) sortNumericCols.add(colIdx);
        });
      }

      // Build quiet toolbar
      const tools = document.createElement('div');
      tools.className = 'tbl-tools';
      const search = document.createElement('input');
      search.type = 'search';
      search.className = 'tbl-search';
      search.placeholder = ui.tblSearch;
      search.setAttribute('aria-label', ui.tblSearch);

      const countEl = document.createElement('span');
      countEl.className = 'tbl-count';
      countEl.textContent = ui.tblRows(dataRows.length, dataRows.length);

      tools.append(search, countEl);

      let extremaOn = false;
      let extremaBtn = null;
      if (extremaCols.length && dataRows.length >= 2) {
        extremaBtn = document.createElement('button');
        extremaBtn.type = 'button';
        extremaBtn.className = 'tbl-btn';
        extremaBtn.textContent = ui.tblExtrema;
        tools.appendChild(extremaBtn);
      }

      const csvBtn = document.createElement('button');
      csvBtn.type = 'button';
      csvBtn.className = 'tbl-btn';
      csvBtn.textContent = ui.tblCsv;
      tools.appendChild(csvBtn);

      const wrap = table.closest('.table-wrap');
      if (wrap) wrap.insertBefore(tools, table);
      else table.insertAdjacentElement('beforebegin', tools);

      function updateExtrema() {
        dataRows.forEach(r => Array.from(r.children).forEach(td => td.classList.remove('cell-best', 'cell-worst')));
        if (!extremaOn) return;
        const visibleRows = dataRows.filter(r => !r.hidden);
        if (visibleRows.length < 2) return;
        extremaCols.forEach(({ colIdx, lowBetter }) => {
          const vals = visibleRows
            .map(r => ({ td: r.children[colIdx], v: parseStrictNum(r.children[colIdx] && r.children[colIdx].textContent) }))
            .filter(x => x.v !== null);
          if (vals.length < 2) return;
          const minV = Math.min(...vals.map(x => x.v));
          const maxV = Math.max(...vals.map(x => x.v));
          if (minV === maxV) return;
          const bestV = lowBetter ? minV : maxV;
          const worstV = lowBetter ? maxV : minV;
          vals.forEach(x => {
            if (x.v === bestV) x.td.classList.add('cell-best');
            else if (x.v === worstV) x.td.classList.add('cell-worst');
          });
        });
      }

      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        let vis = 0;
        dataRows.forEach(r => {
          const match = !q || r.textContent.toLowerCase().includes(q);
          r.hidden = !match;
          if (match) vis++;
        });
        countEl.textContent = ui.tblRows(vis, dataRows.length);
        updateExtrema();
      });

      if (extremaBtn) {
        extremaBtn.addEventListener('click', () => {
          extremaOn = !extremaOn;
          extremaBtn.classList.toggle('is-active', extremaOn);
          updateExtrema();
        });
      }

      csvBtn.addEventListener('click', () => {
        const rows = [];
        headRows.forEach(r => rows.push(Array.from(r.children).map(c => c.textContent.replace(/\s+/g, ' ').trim())));
        dataRows.filter(r => !r.hidden).concat(totalRows).forEach(r => {
          rows.push(Array.from(r.children).map(c => c.textContent.replace(/\s+/g, ' ').trim()));
        });
        const csv = rows.map(cols => cols.map(c => '"' + c.replace(/"/g, '""') + '"').join(',')).join('\n');
        copyText(csv).then(() => {
          csvBtn.textContent = ui.copied;
          setTimeout(() => { csvBtn.textContent = ui.tblCsv; }, 1600);
        });
      });

      if (canSort) {
        let sortCol = -1;
        let sortDir = 1;
        ths.forEach((th, colIdx) => {
          th.classList.add('is-sortable');
          const ind = document.createElement('span');
          ind.className = 'sort-ind';
          ind.textContent = '⇅';
          th.appendChild(ind);

          th.addEventListener('click', () => {
            if (sortCol === colIdx) sortDir = -sortDir;
            else { sortCol = colIdx; sortDir = sortNumericCols.has(colIdx) ? -1 : 1; }

            ths.forEach((h, j) => {
              h.classList.toggle('is-sorted', j === sortCol);
              const si = h.querySelector('.sort-ind');
              if (si) si.textContent = j === sortCol ? (sortDir > 0 ? '↑' : '↓') : '⇅';
            });

            dataRows.sort((a, b) => {
              const ta = (a.children[colIdx] ? a.children[colIdx].textContent : '').trim();
              const tb = (b.children[colIdx] ? b.children[colIdx].textContent : '').trim();
              const na = parseStrictNum(ta);
              const nb = parseStrictNum(tb);
              if (na !== null && nb !== null) return (na - nb) * sortDir;
              if (na !== null) return -1;
              if (nb !== null) return 1;
              return ta.localeCompare(tb, undefined, { numeric: true }) * sortDir;
            });

            dataRows.forEach(r => tbody.appendChild(r));
            totalRows.forEach(r => tbody.appendChild(r));
          });
        });
      }
    });
  })();

  // 8. Cross-Reference Anchor Jump + Clickable Diagram Section Jumps (data-jump)
  (function initXrefs() {
    document.querySelectorAll('.article-main a[href^="#"]').forEach(a => {
      const id = (a.getAttribute('href') || '').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      if (!a.getAttribute('title')) {
        const hintEl = target.querySelector('.fig-title, .eq-label, h2, h3, caption');
        if (hintEl) a.setAttribute('title', hintEl.textContent.replace(/\s+/g, ' ').trim());
      }
      a.addEventListener('click', (e) => {
        e.preventDefault();
        jumpToElement(target, true);
      });
    });

    // Interactive section/target jumps inside overview flowcharts & mind maps
    document.querySelectorAll('[data-jump]').forEach(el => {
      const raw = (el.getAttribute('data-jump') || '').trim();
      const id = raw.startsWith('#') ? raw.slice(1) : raw;
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      el.classList.add('pdr-jump-node');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      if (!el.getAttribute('role')) el.setAttribute('role', 'link');
      const activate = (e) => {
        e.stopPropagation();
        jumpToElement(target, true);
      };
      el.addEventListener('click', activate);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(e);
        }
      });
    });
  })();

  // 9. Unified Selection Notes, Figure Annotations & Right-Margin Marginalia + Markdown Export
  (function initNotesAndAnnotations() {
    const STORAGE_KEY = 'pdr-notes:' + DOC_KEY;
    const shell = document.querySelector('.page-shell');
    const article = document.querySelector('.article-main');
    if (!article) return;

    // Assign deterministic block IDs for precise anchoring across reloads (even across <code>/KaTeX)
    const blockSelector = 'p, li, blockquote, h2, h3, .eq-box, figure.fig-frame, .table-wrap, .audit-card, .transfer-card, .exec-summary, .live-card';
    Array.from(article.querySelectorAll(blockSelector)).forEach((b, i) => {
      if (!b.dataset.pdrBlk) b.dataset.pdrBlk = 'blk_' + i;
    });

    // Create quiet right-margin rail (hidden when <1340px or when 0 notes)
    let rail = shell ? shell.querySelector('.margin-rail') : null;
    if (shell && !rail) {
      rail = document.createElement('aside');
      rail.className = 'margin-rail';
      rail.setAttribute('aria-label', isZh ? '页边批注' : 'Margin notes');
      shell.appendChild(rail);
    }

    let notes = [];
    function loadNotes() {
      try {
        const parsed = JSON.parse(lsGet(STORAGE_KEY, '[]'));
        notes = Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        notes = [];
      }
    }
    loadNotes();

    let notesPill = null;
    function syncNotesPill() {
      if (!mastheadTools) return;
      if (!notesPill) {
        notesPill = document.createElement('button');
        notesPill.type = 'button';
        notesPill.className = 'mh-btn is-accent';
        notesPill.addEventListener('click', openNotesModal);
        mastheadTools.prepend(notesPill);
      }
      notesPill.hidden = notes.length === 0;
      notesPill.textContent = ui.notesBtn(notes.length);
    }

    function persistAndRender() {
      lsSet(STORAGE_KEY, JSON.stringify(notes));
      syncNotesPill();
      renderMarginalia();
      if (modalOverlay && modalOverlay.classList.contains('is-open')) renderNotesModal();
    }

    // Extract clean quote text without duplicated .katex-mathml nodes
    function extractCleanQuote(range) {
      const frag = range.cloneContents();
      frag.querySelectorAll('.katex-mathml, script, style').forEach(el => el.remove());
      return (frag.textContent || '').replace(/\s+/g, ' ').trim();
    }

    // Walk visible text units inside a block (skipping .katex-mathml / UI buttons / SVG)
    function collectTextSegments(scope) {
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const p = node.parentElement;
          if (!p || p.closest('.katex-mathml, svg, button, script, style, .fig-actions, .tbl-tools, .steps-bar')) {
            return NodeFilter.FILTER_REJECT;
          }
          return node.nodeValue ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        },
      });
      const segments = [];
      let full = '';
      let n;
      while ((n = walker.nextNode())) {
        const raw = n.nodeValue;
        for (let i = 0; i < raw.length; i++) {
          const ch = raw[i];
          const isWs = /\s/.test(ch);
          if (isWs && (full.endsWith(' ') || full.length === 0)) continue;
          segments.push({ node: n, offset: i });
          full += isWs ? ' ' : ch;
        }
      }
      return { segments, full };
    }

    function unwrapHighlights() {
      article.querySelectorAll('.pdr-hl-katex').forEach(el => {
        el.classList.remove('pdr-hl-katex', 'is-ask', 'is-linked', 'is-hl', 'hl-amber', 'hl-sage', 'hl-rose');
        delete el.dataset.noteId;
      });
      article.querySelectorAll('mark.pdr-hl').forEach(mk => {
        const parent = mk.parentNode;
        if (!parent) return;
        while (mk.firstChild) parent.insertBefore(mk.firstChild, mk);
        parent.removeChild(mk);
        parent.normalize();
      });
    }

    const HL_COLORS = [
      { key: 'amber', cls: 'hl-amber', title: ui.hlAmber, pill: 'pill-ochre' },
      { key: 'sage', cls: 'hl-sage', title: ui.hlSage, pill: 'pill-sage' },
      { key: 'rose', cls: 'hl-rose', title: ui.hlRose, pill: 'pill-terra' },
    ];

    function highlightNote(note) {
      if (!note.quote || note.quote.length < 2) return null;
      let scope =
        (note.anchorBlk && article.querySelector('[data-pdr-blk="' + note.anchorBlk + '"]')) ||
        (note.targetId && document.getElementById(note.targetId)) ||
        article;
      let { segments, full } = collectTextSegments(scope);
      const q = note.quote.replace(/\s+/g, ' ').trim();
      let hit = full.indexOf(q);
      if (hit === -1 && scope !== article) {
        scope = article;
        ({ segments, full } = collectTextSegments(scope));
        hit = full.indexOf(q);
      }
      if (hit === -1) return null;

      const katexHits = new Set();
      const perNode = new Map();
      for (let k = hit; k < hit + q.length && k < segments.length; k++) {
        const seg = segments[k];
        const pEl = seg.node.parentElement;
        const kSpan = pEl && pEl.closest('.katex');
        if (kSpan) {
          katexHits.add(kSpan);
          continue;
        }
        if (pEl && pEl.closest('mark.pdr-hl')) continue;
        const cur = perNode.get(seg.node);
        if (!cur) perNode.set(seg.node, { start: seg.offset, end: seg.offset + 1 });
        else cur.end = seg.offset + 1;
      }

      const hlExtra = note.kind === 'ask'
        ? ['is-ask']
        : (note.kind === 'hl' ? ['is-hl', 'hl-' + (note.color || 'amber')] : []);

      let firstEl = null;
      katexHits.forEach(ks => {
        ks.classList.add('pdr-hl-katex', ...hlExtra);
        ks.dataset.noteId = note.id;
        if (!firstEl) firstEl = ks;
      });

      Array.from(perNode.entries()).reverse().forEach(([textNode, span]) => {
        try {
          const r = document.createRange();
          r.setStart(textNode, span.start);
          r.setEnd(textNode, span.end);
          const mk = document.createElement('mark');
          mk.className = ['pdr-hl', ...hlExtra].join(' ');
          mk.dataset.noteId = note.id;
          r.surroundContents(mk);
          firstEl = mk;
        } catch (_) {}
      });
      return firstEl;
    }

    function setLinked(noteId, on, isAsk) {
      if (rail) {
        const card = rail.querySelector('.mn-card[data-note-id="' + noteId + '"]');
        if (card) card.classList.toggle('is-linked', on);
      }
      const hls = article.querySelectorAll('[data-note-id="' + noteId + '"]');
      hls.forEach(el => el.classList.toggle('is-linked', on));
      if (!hls.length) {
        const item = notes.find(n => n.id === noteId);
        if (item && item.targetId) {
          const fig = document.getElementById(item.targetId);
          if (fig && fig.classList.contains('fig-frame')) {
            fig.classList.toggle(isAsk ? 'is-mn-linked-ask' : 'is-mn-linked', on);
          }
        }
      }
    }

    let marginEntries = [];
    let marginRaf = 0;
    function layoutMarginCards() {
      marginRaf = 0;
      if (!rail || !marginEntries.length || window.innerWidth < 1340) return;
      // Strict read phase first (zero layout thrashing!)
      const rTop = rail.getBoundingClientRect().top;
      const items = [];
      for (let i = 0; i < marginEntries.length; i++) {
        const e = marginEntries[i];
        if (!e.anchor || !document.body.contains(e.anchor)) continue;
        items.push({
          card: e.card,
          y: Math.max(0, e.anchor.getBoundingClientRect().top - rTop),
          h: e.card.offsetHeight,
        });
      }
      items.sort((a, b) => a.y - b.y);
      // Strict write phase using GPU-composited translate3d
      let cursor = 0;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const top = Math.max(item.y, cursor);
        item.card.style.transform = 'translate3d(0,' + top.toFixed(0) + 'px,0)';
        cursor = top + item.h + 14;
      }
    }
    function scheduleLayoutMarginCards() {
      if (!rail || !marginEntries.length || window.innerWidth < 1340) return;
      if (!marginRaf) marginRaf = requestAnimationFrame(layoutMarginCards);
    }

    let hlPop = null;
    function closeHlPop() { if (hlPop) { hlPop.remove(); hlPop = null; } }
    function openHlPop(note, anchorEl) {
      closeSelPop();
      closeHlPop();
      hlPop = document.createElement('div');
      hlPop.className = 'pdr-hl-pop';

      HL_COLORS.forEach(c => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'pdr-hl-dot ' + c.cls + ((note.color || 'amber') === c.key ? ' is-current' : '');
        dot.title = c.title;
        dot.setAttribute('aria-label', c.title);
        dot.addEventListener('click', (ev) => {
          ev.stopPropagation();
          note.color = c.key;
          closeHlPop();
          persistAndRender();
        });
        hlPop.appendChild(dot);
      });

      const sep = document.createElement('span');
      sep.className = 'pdr-pop-sep';
      hlPop.appendChild(sep);

      const bAdd = document.createElement('button');
      bAdd.type = 'button';
      bAdd.textContent = ui.hlAddNote;
      bAdd.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const r = anchorEl.getBoundingClientRect();
        closeHlPop();
        openComposer({
          kind: 'note',
          ctx: note.ctx,
          quote: note.quote,
          targetId: note.targetId,
          anchorBlk: note.anchorBlk,
          anchorRect: r,
          upgradeId: note.id,
        });
      });

      const bDel = document.createElement('button');
      bDel.type = 'button';
      bDel.textContent = ui.del;
      bDel.addEventListener('click', (ev) => {
        ev.stopPropagation();
        notes = notes.filter(x => x.id !== note.id);
        closeHlPop();
        persistAndRender();
      });

      hlPop.append(bAdd, bDel);
      document.body.appendChild(hlPop);
      const rect = anchorEl.getBoundingClientRect();
      const sw = hlPop.offsetWidth;
      const left = Math.max(10, Math.min(rect.left + window.scrollX + rect.width / 2 - sw / 2, window.scrollX + window.innerWidth - sw - 10));
      const top = Math.max(8, rect.top + window.scrollY - hlPop.offsetHeight - 8);
      hlPop.style.left = left.toFixed(0) + 'px';
      hlPop.style.top = top.toFixed(0) + 'px';
    }

    function renderMarginalia() {
      unwrapHighlights();
      closeHlPop();
      marginEntries = [];
      if (rail) rail.innerHTML = '';
      if (!notes.length) return;

      notes.forEach(n => {
        const hl = highlightNote(n);
        const anchor =
          hl ||
          (n.anchorBlk ? article.querySelector('[data-pdr-blk="' + n.anchorBlk + '"]') : null) ||
          (n.targetId ? document.getElementById(n.targetId) : null);

        const hls = article.querySelectorAll('[data-note-id="' + n.id + '"]');
        if (n.kind === 'hl') {
          // Pure color highlights stay inline (no right-margin clutter); click opens recolor/upgrade/delete bar
          hls.forEach(el => {
            el.addEventListener('click', (ev) => {
              ev.stopPropagation();
              openHlPop(n, el);
            });
          });
          return;
        }

        hls.forEach(el => {
          el.addEventListener('mouseenter', () => setLinked(n.id, true, n.kind === 'ask'));
          el.addEventListener('mouseleave', () => setLinked(n.id, false, n.kind === 'ask'));
          el.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (window.innerWidth < 1340) {
              openNotesModal();
            } else if (rail) {
              const c = rail.querySelector('.mn-card[data-note-id="' + n.id + '"]');
              if (c) { c.classList.toggle('is-expanded'); layoutMarginCards(); }
            }
          });
        });

        if (!rail || !anchor) return;
        const card = document.createElement('div');
        card.className = 'mn-card' + (n.kind === 'ask' ? ' is-ask' : '');
        card.dataset.noteId = n.id;

        const shortCtx = n.ctx ? n.ctx.split('·')[0].trim() : '';
        const head = document.createElement('div');
        head.className = 'mn-head';
        const dot = document.createElement('span');
        dot.className = 'mn-dot';
        const kindSpan = document.createElement('span');
        kindSpan.className = 'mn-kind';
        kindSpan.textContent = n.kind === 'ask' ? ui.tagAsk : ui.tagNote;
        head.append(dot, kindSpan);
        if (shortCtx) {
          const ctxSpan = document.createElement('span');
          ctxSpan.className = 'mn-ctx';
          ctxSpan.textContent = shortCtx;
          ctxSpan.title = n.ctx;
          head.appendChild(ctxSpan);
        }
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'mn-del';
        delBtn.textContent = '×';
        delBtn.title = ui.del;
        delBtn.setAttribute('aria-label', ui.del);
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          notes = notes.filter(x => x.id !== n.id);
          persistAndRender();
        });
        head.appendChild(delBtn);

        const body = document.createElement('p');
        body.className = 'mn-body';
        body.textContent = n.text;

        card.append(head, body);
        card.addEventListener('mouseenter', () => setLinked(n.id, true, n.kind === 'ask'));
        card.addEventListener('mouseleave', () => setLinked(n.id, false, n.kind === 'ask'));
        card.addEventListener('click', (e) => {
          if (e.target.closest('.mn-del')) return;
          card.classList.toggle('is-expanded');
          layoutMarginCards();
        });

        rail.appendChild(card);
        marginEntries.push({ card, anchor });
      });

      layoutMarginCards();
    }

    syncNotesPill();

    // Add quiet note trigger on every figure frame
    document.querySelectorAll('.fig-frame').forEach((frame, idx) => {
      if (!frame.id) frame.id = 'pdr-fig-' + (idx + 1);
      const actions = frame.querySelector('.fig-actions');
      if (!actions || actions.querySelector('.fig-note-btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fig-note-btn';
      btn.textContent = '✎';
      btn.title = ui.figNoteTitle;
      btn.setAttribute('aria-label', ui.figNoteTitle);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const titleEl = frame.querySelector('.fig-title');
        const ctx = titleEl ? titleEl.textContent.trim() : frame.id;
        openComposer({
          kind: 'note',
          ctx: ctx,
          quote: '',
          targetId: frame.id,
          anchorBlk: frame.dataset.pdrBlk || '',
          anchorRect: btn.getBoundingClientRect(),
        });
      });
      const zoomBtn = actions.querySelector('[data-zoom-btn]');
      if (zoomBtn) actions.insertBefore(btn, zoomBtn);
      else actions.appendChild(btn);
    });

    // Selection mini popover & composer
    let selPop = null;
    let notePop = null;
    function closeSelPop() { if (selPop) { selPop.remove(); selPop = null; } }
    function closeNotePop() { if (notePop) { notePop.remove(); notePop = null; } }

    function findAnchorBlock(node) {
      const el = node && node.nodeType === 1 ? node : (node && node.parentElement);
      if (!el) return null;
      const fig = el.closest('figure.fig-frame');
      if (fig) return fig;
      const eq = el.closest('.eq-box');
      if (eq) return eq;
      return el.closest('[data-pdr-blk]') || el.closest('section') || null;
    }

    function contextFromBlock(blk) {
      if (!blk) return { ctx: document.title, targetId: '', anchorBlk: '' };
      const fig = blk.closest('figure.fig-frame');
      if (fig) {
        const ft = fig.querySelector('.fig-title');
        return { ctx: ft ? ft.textContent.trim() : fig.id, targetId: fig.id || '', anchorBlk: fig.dataset.pdrBlk || '' };
      }
      const eq = blk.closest('.eq-box');
      if (eq) {
        const elbl = eq.querySelector('.eq-label > span:first-child') || eq.querySelector('.eq-label');
        return { ctx: elbl ? elbl.textContent.replace(/\s+/g, ' ').trim() : eq.id, targetId: eq.id || '', anchorBlk: eq.dataset.pdrBlk || '' };
      }
      const sec = blk.closest('section');
      const h2 = sec && sec.querySelector('h2');
      return {
        ctx: h2 ? h2.textContent.replace(/\s+/g, ' ').trim() : document.title,
        targetId: (sec && sec.id) || '',
        anchorBlk: blk.dataset.pdrBlk || '',
      };
    }

    function openComposer({ kind, ctx, quote, targetId, anchorBlk, anchorRect, upgradeId }) {
      closeSelPop();
      closeHlPop();
      closeNotePop();

      let curKind = kind || 'note';
      notePop = document.createElement('div');
      notePop.className = 'pdr-note-pop';
      notePop.setAttribute('role', 'dialog');

      const topRow = document.createElement('div');
      topRow.className = 'pdr-note-kind-row';
      const ctxEl = document.createElement('div');
      ctxEl.className = 'pdr-note-ctx';
      ctxEl.textContent = ctx;

      const kSw = document.createElement('span');
      kSw.className = 'pdr-kind-switch';
      const kNote = document.createElement('button');
      kNote.type = 'button';
      kNote.dataset.k = 'note';
      kNote.textContent = ui.tagNote;
      const kAsk = document.createElement('button');
      kAsk.type = 'button';
      kAsk.dataset.k = 'ask';
      kAsk.textContent = ui.tagAsk;
      kSw.append(kNote, kAsk);
      topRow.append(ctxEl, kSw);
      notePop.appendChild(topRow);

      if (quote) {
        const qEl = document.createElement('blockquote');
        qEl.className = 'pdr-note-quote';
        qEl.textContent = quote;
        notePop.appendChild(qEl);
      }

      const ta = document.createElement('textarea');
      notePop.appendChild(ta);

      function syncKindUi() {
        kNote.classList.toggle('is-active', curKind === 'note');
        kAsk.classList.toggle('is-active', curKind === 'ask');
        ta.placeholder = curKind === 'ask' ? ui.askPlaceholder : ui.notePlaceholder;
      }
      kNote.addEventListener('click', () => { curKind = 'note'; syncKindUi(); ta.focus(); });
      kAsk.addEventListener('click', () => { curKind = 'ask'; syncKindUi(); ta.focus(); });
      syncKindUi();

      const act = document.createElement('div');
      act.className = 'pdr-note-actions';
      const btnCancel = document.createElement('button');
      btnCancel.type = 'button';
      btnCancel.className = 'btn';
      btnCancel.textContent = ui.cancel;
      btnCancel.addEventListener('click', closeNotePop);

      const btnSave = document.createElement('button');
      btnSave.type = 'button';
      btnSave.className = 'btn btn-primary';
      btnSave.textContent = ui.save;
      function doSave() {
        const txt = ta.value.trim();
        if (!txt) { closeNotePop(); return; }
        const existing = upgradeId ? notes.find(x => x.id === upgradeId) : null;
        if (existing) {
          existing.kind = curKind;
          existing.text = txt;
          delete existing.color;
          existing.ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
        } else {
          notes.push({
            id: 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            kind: curKind,
            ctx: ctx,
            quote: quote,
            text: txt,
            targetId: targetId,
            anchorBlk: anchorBlk || '',
            ts: new Date().toISOString().slice(0, 16).replace('T', ' '),
          });
        }
        closeNotePop();
        persistAndRender();
        showToast(ui.noteSaved);
      }
      btnSave.addEventListener('click', doSave);
      ta.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') doSave();
        if (e.key === 'Escape') closeNotePop();
      });
      act.append(btnCancel, btnSave);
      notePop.appendChild(act);
      document.body.appendChild(notePop);

      const pw = notePop.offsetWidth;
      const ph = notePop.offsetHeight;
      let left = anchorRect ? (anchorRect.left + anchorRect.width / 2 - pw / 2) : (window.innerWidth - pw) / 2;
      left = Math.max(12, Math.min(left, window.innerWidth - pw - 12));
      let top = anchorRect ? (anchorRect.bottom + 10) : 96;
      if (top + ph > window.innerHeight - 12) top = Math.max(16, (anchorRect ? anchorRect.top - ph - 10 : 80));
      notePop.style.left = left.toFixed(0) + 'px';
      notePop.style.top = top.toFixed(0) + 'px';
      ta.focus();
    }

    function handleSelection(e) {
      if (e && e.target && e.target.closest && e.target.closest('button, input, textarea, select, .pdr-sel-pop, .pdr-hl-pop, .pdr-note-pop, .pdr-sym-pop, .pdr-sym-float, .pdr-modal-overlay, .tbl-tools, .steps-bar, .margin-rail')) return;
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) { closeSelPop(); return; }
        const range = sel.getRangeAt(0);
        const intersects =
          article.contains(range.commonAncestorContainer) ||
          article.contains(range.startContainer) ||
          article.contains(range.endContainer);
        if (!intersects) { closeSelPop(); return; }

        const text = extractCleanQuote(range);
        if (text.length < 2 || text.length > 1200) { closeSelPop(); return; }

        const rects = Array.from(range.getClientRects()).filter(r => r.width > 0 && r.height > 0);
        const rect = rects[0] || range.getBoundingClientRect();
        if (!rect || (!rect.width && !rect.height)) return;

        const blk = findAnchorBlock(range.startContainer) || findAnchorBlock(range.commonAncestorContainer);
        const info = contextFromBlock(blk);

        closeSelPop();
        closeHlPop();
        selPop = document.createElement('div');
        selPop.className = 'pdr-sel-pop';

        // 1-click 3-color Morandi highlight swatches
        HL_COLORS.forEach(c => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'pdr-hl-dot ' + c.cls;
          dot.title = c.title;
          dot.setAttribute('aria-label', c.title);
          dot.addEventListener('mousedown', (ev) => ev.preventDefault());
          dot.addEventListener('click', (ev) => {
            ev.stopPropagation();
            notes.push({
              id: 'h_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
              kind: 'hl',
              color: c.key,
              ctx: info.ctx,
              quote: text,
              text: '',
              targetId: info.targetId,
              anchorBlk: info.anchorBlk,
              ts: new Date().toISOString().slice(0, 16).replace('T', ' '),
            });
            try { window.getSelection().removeAllRanges(); } catch (_) {}
            closeSelPop();
            persistAndRender();
            showToast(ui.hlAdded);
          });
          selPop.appendChild(dot);
        });

        const sep = document.createElement('span');
        sep.className = 'pdr-pop-sep';
        selPop.appendChild(sep);

        const bNote = document.createElement('button');
        bNote.type = 'button';
        bNote.textContent = ui.selNote;
        bNote.addEventListener('mousedown', (ev) => ev.preventDefault());
        bNote.addEventListener('click', (ev) => {
          ev.stopPropagation();
          openComposer({ kind: 'note', ctx: info.ctx, quote: text, targetId: info.targetId, anchorBlk: info.anchorBlk, anchorRect: rect });
        });
        const bAsk = document.createElement('button');
        bAsk.type = 'button';
        bAsk.textContent = ui.selAsk;
        bAsk.addEventListener('mousedown', (ev) => ev.preventDefault());
        bAsk.addEventListener('click', (ev) => {
          ev.stopPropagation();
          openComposer({ kind: 'ask', ctx: info.ctx, quote: text, targetId: info.targetId, anchorBlk: info.anchorBlk, anchorRect: rect });
        });
        selPop.append(bNote, bAsk);
        document.body.appendChild(selPop);
        const sw = selPop.offsetWidth;
        const left = Math.max(10, Math.min(rect.left + window.scrollX + rect.width / 2 - sw / 2, window.scrollX + window.innerWidth - sw - 10));
        const top = Math.max(8, rect.top + window.scrollY - selPop.offsetHeight - 8);
        selPop.style.left = left.toFixed(0) + 'px';
        selPop.style.top = top.toFixed(0) + 'px';
      }, 20);
    }

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', (e) => {
      if (e.shiftKey) handleSelection(e);
    });
    document.addEventListener('mousedown', (e) => {
      if (selPop && !selPop.contains(e.target)) closeSelPop();
      if (hlPop && !hlPop.contains(e.target)) closeHlPop();
      if (notePop && !notePop.contains(e.target) && !e.target.closest('.fig-note-btn, .pdr-sel-pop, .pdr-hl-pop')) closeNotePop();
    });

    window.addEventListener('load', () => {
      if (notes.length) setTimeout(renderMarginalia, 60);
    });
    window.addEventListener('resize', scheduleLayoutMarginCards, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(scheduleLayoutMarginCards).observe(article);
    }

    function buildNotesMarkdown() {
      const lines = ['# ' + (document.title || 'Paper Reading Notes'), ''];
      notes.forEach((item, i) => {
        const tag = item.kind === 'ask' ? ui.tagAsk : (item.kind === 'hl' ? ui.tagHl : ui.tagNote);
        lines.push('## ' + (i + 1) + '. [' + tag + '] ' + item.ctx + ' (' + item.ts + ')');
        if (item.quote) lines.push('> ' + item.quote);
        if (item.text) lines.push('', item.text);
        lines.push('');
      });
      return lines.join('\n');
    }

    let modalOverlay = null;
    let modalFilter = 'all';
    function openNotesModal() {
      if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.className = 'pdr-modal-overlay';
        modalOverlay.setAttribute('role', 'dialog');
        modalOverlay.setAttribute('aria-modal', 'true');
        modalOverlay.innerHTML =
          '<div class="pdr-modal">' +
            '<div class="pdr-modal-head">' +
              '<span class="pdr-modal-title">' + ui.notesModalTitle + '</span>' +
              '<div class="pdr-modal-tabs" id="pdr-nm-tabs" hidden>' +
                '<button type="button" class="pdr-modal-tab is-active" data-nm-tab="all">' + ui.tabAll + '</button>' +
                '<button type="button" class="pdr-modal-tab" data-nm-tab="notes">' + ui.tabNotes + '</button>' +
                '<button type="button" class="pdr-modal-tab" data-nm-tab="hl">' + ui.tabHls + '</button>' +
              '</div>' +
              '<button type="button" class="btn" id="pdr-nm-close">' + ui.close + '</button>' +
            '</div>' +
            '<div class="pdr-modal-body" id="pdr-nm-body"></div>' +
            '<div class="pdr-modal-foot">' +
              '<button type="button" class="btn" id="pdr-nm-clear">' + ui.clearAll + '</button>' +
              '<div style="display:flex;gap:0.4rem;">' +
                '<button type="button" class="btn" id="pdr-nm-dl">' + ui.downloadMd + '</button>' +
                '<button type="button" class="btn btn-primary" id="pdr-nm-copy">' + ui.copyMd + '</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        document.body.appendChild(modalOverlay);
        modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeNotesModal(); });
        document.getElementById('pdr-nm-close').addEventListener('click', closeNotesModal);
        document.getElementById('pdr-nm-tabs').addEventListener('click', (e) => {
          const btn = e.target.closest('[data-nm-tab]');
          if (!btn) return;
          modalFilter = btn.getAttribute('data-nm-tab') || 'all';
          modalOverlay.querySelectorAll('[data-nm-tab]').forEach(b => b.classList.toggle('is-active', b === btn));
          renderNotesModal();
        });
        document.getElementById('pdr-nm-copy').addEventListener('click', () => {
          copyText(buildNotesMarkdown()).then(() => showToast(ui.mdCopied));
        });
        document.getElementById('pdr-nm-dl').addEventListener('click', () => {
          const blob = new Blob([buildNotesMarkdown()], { type: 'text/markdown;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = (document.title || 'paper-notes').replace(/[\\/:*?"<>|]+/g, '_') + '.md';
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
        document.getElementById('pdr-nm-clear').addEventListener('click', () => {
          if (!notes.length || window.confirm(ui.confirmClear)) {
            notes = [];
            persistAndRender();
          }
        });
      }
      renderNotesModal();
      modalOverlay.classList.add('is-open');
    }
    function closeNotesModal() {
      if (modalOverlay) modalOverlay.classList.remove('is-open');
    }
    function renderNotesModal() {
      const body = document.getElementById('pdr-nm-body');
      const tabsEl = document.getElementById('pdr-nm-tabs');
      if (!body) return;
      body.innerHTML = '';
      const hasHl = notes.some(x => x.kind === 'hl');
      const hasWritten = notes.some(x => x.kind !== 'hl');
      if (tabsEl) {
        tabsEl.hidden = !(hasHl && hasWritten);
        if (tabsEl.hidden) modalFilter = 'all';
      }
      const list = notes.filter(x => {
        if (modalFilter === 'hl') return x.kind === 'hl';
        if (modalFilter === 'notes') return x.kind !== 'hl';
        return true;
      });
      if (!list.length) {
        const p = document.createElement('p');
        p.style.color = 'var(--muted)';
        p.style.margin = '0.4rem 0';
        p.textContent = ui.notesEmpty;
        body.appendChild(p);
        return;
      }
      list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'pdr-note-item';
        const head = document.createElement('div');
        head.className = 'pdr-note-item-head';
        const left = document.createElement('span');
        let pillCls = 'pill-teal';
        let tagText = ui.tagNote;
        if (item.kind === 'ask') {
          pillCls = 'pill-terra';
          tagText = ui.tagAsk;
        } else if (item.kind === 'hl') {
          const cObj = HL_COLORS.find(c => c.key === item.color) || HL_COLORS[0];
          pillCls = cObj.pill;
          tagText = cObj.title;
        }
        left.innerHTML = '<span class="pill ' + pillCls + '"></span> <strong></strong>';
        left.querySelector('.pill').textContent = tagText;
        left.querySelector('strong').textContent = item.ctx;

        const right = document.createElement('span');
        right.style.display = 'inline-flex';
        right.style.gap = '0.35rem';
        const locEl =
          (item.anchorBlk && article.querySelector('[data-pdr-blk="' + item.anchorBlk + '"]')) ||
          (item.targetId && document.getElementById(item.targetId));
        if (locEl) {
          const bLoc = document.createElement('button');
          bLoc.type = 'button';
          bLoc.className = 'tbl-btn';
          bLoc.textContent = ui.locate;
          bLoc.addEventListener('click', () => {
            closeNotesModal();
            jumpToElement(locEl, false);
          });
          right.appendChild(bLoc);
        }
        if (item.kind === 'hl') {
          const bUp = document.createElement('button');
          bUp.type = 'button';
          bUp.className = 'tbl-btn';
          bUp.textContent = ui.hlAddNote;
          bUp.addEventListener('click', () => {
            closeNotesModal();
            openComposer({
              kind: 'note',
              ctx: item.ctx,
              quote: item.quote,
              targetId: item.targetId,
              anchorBlk: item.anchorBlk,
              anchorRect: null,
              upgradeId: item.id,
            });
          });
          right.appendChild(bUp);
        }
        const bDel = document.createElement('button');
        bDel.type = 'button';
        bDel.className = 'tbl-btn';
        bDel.textContent = ui.del;
        bDel.addEventListener('click', () => {
          notes = notes.filter(x => x.id !== item.id);
          persistAndRender();
        });
        right.appendChild(bDel);
        head.append(left, right);
        card.appendChild(head);

        if (item.quote) {
          const q = document.createElement('blockquote');
          q.className = 'pdr-note-quote';
          q.textContent = item.quote;
          card.appendChild(q);
        }
        if (item.text) {
          const t = document.createElement('p');
          t.className = 'pdr-note-item-text';
          t.textContent = item.text;
          card.appendChild(t);
        }
        body.appendChild(card);
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-open')) closeNotesModal();
    });
  })();

  // 10. Fullscreen Two-Stage Vector Pan & Zoom Lightbox (Interactive Stepper & View-Switch Preserved)
  (function initLightbox() {
    let overlay = null;
    let titleEl = null;
    let canvasEl = null;
    let stageEl = null;
    let footEl = null;
    let zoomValEl = null;
    let activeFrame = null;
    let activeCleanup = null;

    const MIN_SCALE = 0.5;
    const MAX_SCALE = 5.0;
    let baseW = 900;
    let baseH = 520;
    let scale = 1.0;
    let committedScale = 1.0;
    let tx = 0;
    let ty = 0;
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTx = 0;
    let dragStartTy = 0;
    let aspectRatio = 16 / 9;
    let rafId = 0;
    let crispTimer = 0;

    function applyGpuTransform() {
      rafId = 0;
      const liveRatio = scale / committedScale;
      canvasEl.style.transform =
        'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + liveRatio.toFixed(4) + ')';
      zoomValEl.textContent = Math.round(scale * 100) + '%';
    }
    function scheduleGpu() {
      if (!rafId) rafId = requestAnimationFrame(applyGpuTransform);
    }
    function commitCrispVector() {
      crispTimer = 0;
      committedScale = scale;
      canvasEl.style.width = Math.max(120, baseW * committedScale).toFixed(1) + 'px';
      canvasEl.style.height = Math.max(80, baseH * committedScale).toFixed(1) + 'px';
      canvasEl.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(1)';
      zoomValEl.textContent = Math.round(scale * 100) + '%';
    }
    function scheduleCrispCommit() {
      if (crispTimer) clearTimeout(crispTimer);
      crispTimer = setTimeout(commitCrispVector, 130);
    }
    function fitToStage() {
      if (!stageEl) return;
      if (crispTimer) { clearTimeout(crispTimer); crispTimer = 0; }
      const sw = Math.max(320, stageEl.clientWidth - 48);
      const sh = Math.max(240, stageEl.clientHeight - 48);
      if (sw / sh > aspectRatio) {
        baseH = sh;
        baseW = sh * aspectRatio;
      } else {
        baseW = sw;
        baseH = sw / aspectRatio;
      }
      scale = 1.0;
      tx = (stageEl.clientWidth - baseW) / 2;
      ty = (stageEl.clientHeight - baseH) / 2;
      commitCrispVector();
    }
    function zoomAt(nextScale, pivotX, pivotY) {
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
      if (Math.abs(clamped - scale) < 0.001) return;
      const cx = (pivotX - tx) / scale;
      const cy = (pivotY - ty) / scale;
      scale = clamped;
      tx = pivotX - cx * scale;
      ty = pivotY - cy * scale;
      scheduleGpu();
      scheduleCrispCommit();
    }
    function zoomCenter(factor) {
      if (!stageEl) return;
      zoomAt(scale * factor, stageEl.clientWidth / 2, stageEl.clientHeight / 2);
    }
    function detectAspectRatio(el) {
      if (el.tagName.toLowerCase() === 'svg') {
        const vb = el.getAttribute('viewBox');
        if (vb) {
          const parts = vb.trim().split(/[\s,]+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) return parts[2] / parts[3];
        }
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) return rect.width / rect.height;
      } else if (el.naturalWidth > 0 && el.naturalHeight > 0) {
        return el.naturalWidth / el.naturalHeight;
      }
      return 16 / 9;
    }

    function pickVisibleGraphic(frame) {
      const candidates = Array.from(frame.querySelectorAll('.fig-svg-wrap svg, svg, img.fig-img, img.fig-zoomable, img'));
      for (let i = 0; i < candidates.length; i++) {
        const el = candidates[i];
        if (!el.closest('.is-view-hidden') && !el.classList.contains('is-view-hidden')) return el;
      }
      return candidates[0] || null;
    }

    function closeLightbox() {
      if (!overlay) return;
      if (crispTimer) { clearTimeout(crispTimer); crispTimer = 0; }
      if (activeCleanup) { activeCleanup(); activeCleanup = null; }
      activeFrame = null;
      canvasEl.classList.remove('fig-steps', 'is-still', 'is-full');
      if (footEl) { footEl.innerHTML = ''; footEl.hidden = true; }
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      dragging = false;
      stageEl.classList.remove('is-dragging');
    }

    function ensureLightbox() {
      if (overlay) return;
      overlay = document.getElementById('fig-lightbox');
      if (!overlay) {
        const tpl = document.createElement('div');
        tpl.innerHTML =
          '<div class="lightbox-overlay" id="fig-lightbox" role="dialog" aria-modal="true" aria-label="' + ui.lbTitle + '">' +
            '<div class="lightbox-dialog">' +
              '<div class="lightbox-bar">' +
                '<span class="lightbox-title" id="lb-title">' + ui.lbTitle + '</span>' +
                '<div class="lightbox-controls">' +
                  '<span class="lightbox-hint">' + ui.lbHint + '</span>' +
                  '<button class="btn" type="button" id="lb-out" aria-label="' + ui.lbOut + '">−</button>' +
                  '<span class="lightbox-zoom-val" id="lb-zoom-val">100%</span>' +
                  '<button class="btn" type="button" id="lb-in" aria-label="' + ui.lbIn + '">＋</button>' +
                  '<button class="btn" type="button" id="lb-fit" aria-label="' + ui.lbFitAria + '">' + ui.lbFit + '</button>' +
                  '<button class="btn btn-primary" type="button" id="lb-close" aria-label="' + ui.lbCloseAria + '">' + ui.close + '</button>' +
                '</div>' +
              '</div>' +
              '<div class="lightbox-stage" id="lb-stage">' +
                '<div class="lightbox-canvas" id="lb-canvas"></div>' +
              '</div>' +
              '<div class="lightbox-foot" id="lb-foot" hidden></div>' +
            '</div>' +
          '</div>';
        document.body.appendChild(tpl.firstElementChild);
        overlay = document.getElementById('fig-lightbox');
      }
      titleEl = document.getElementById('lb-title');
      canvasEl = document.getElementById('lb-canvas');
      stageEl = document.getElementById('lb-stage');
      footEl = document.getElementById('lb-foot');
      zoomValEl = document.getElementById('lb-zoom-val');

      stageEl.addEventListener('wheel', (e) => {
        if (!overlay.classList.contains('is-open')) return;
        e.preventDefault();
        const rect = stageEl.getBoundingClientRect();
        const factor = e.deltaY < 0 ? 1.14 : (1 / 1.14);
        zoomAt(scale * factor, e.clientX - rect.left, e.clientY - rect.top);
      }, { passive: false });

      let dragMoved = false;
      let justDragged = false;
      let capturedPointerId = null;

      stageEl.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        dragging = true;
        dragMoved = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartTx = tx;
        dragStartTy = ty;
        capturedPointerId = null;
      });
      stageEl.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        if (!dragMoved) {
          if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) <= 4) return;
          dragMoved = true;
          stageEl.classList.add('is-dragging');
          if (stageEl.setPointerCapture) {
            try { stageEl.setPointerCapture(e.pointerId); capturedPointerId = e.pointerId; } catch (_) {}
          }
          if (activeFrame && activeFrame._pdrStepper) activeFrame._pdrStepper.clearPreview();
        }
        tx = dragStartTx + (e.clientX - dragStartX);
        ty = dragStartTy + (e.clientY - dragStartY);
        scheduleGpu();
      });
      function endDrag() {
        if (!dragging) return;
        const moved = dragMoved;
        dragging = false;
        dragMoved = false;
        stageEl.classList.remove('is-dragging');
        if (capturedPointerId !== null && stageEl.hasPointerCapture && stageEl.hasPointerCapture(capturedPointerId)) {
          stageEl.releasePointerCapture(capturedPointerId);
        }
        capturedPointerId = null;
        if (moved) {
          justDragged = true;
          setTimeout(() => { justDragged = false; }, 0);
        }
      }
      stageEl.addEventListener('pointerup', endDrag);
      stageEl.addEventListener('pointercancel', endDrag);

      stageEl.addEventListener('dblclick', (e) => {
        if (e.target && e.target.closest && e.target.closest('.is-step-card')) return;
        const rect = stageEl.getBoundingClientRect();
        if (Math.abs(scale - 1.0) < 0.08) zoomAt(2.2, e.clientX - rect.left, e.clientY - rect.top);
        else fitToStage();
      });
      stageEl._pdrDragState = {
        isDragging: () => dragging && dragMoved,
        wasDragged: () => justDragged,
      };
      window.addEventListener('resize', () => {
        if (overlay && overlay.classList.contains('is-open')) fitToStage();
      }, { passive: true });
      document.getElementById('lb-in').addEventListener('click', () => zoomCenter(1.25));
      document.getElementById('lb-out').addEventListener('click', () => zoomCenter(1 / 1.25));
      document.getElementById('lb-fit').addEventListener('click', fitToStage);
      document.getElementById('lb-close').addEventListener('click', closeLightbox);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
      document.addEventListener('keydown', (e) => {
        if (!overlay || !overlay.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === '+' || e.key === '=') zoomCenter(1.25);
        else if (e.key === '-') zoomCenter(1 / 1.25);
        else if (e.key === '0') fitToStage();
        else if (activeFrame && activeFrame._pdrStepper) {
          if (e.key === 'ArrowLeft') { e.preventDefault(); activeFrame._pdrStepper.go(-1); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); activeFrame._pdrStepper.go(1); }
          else if (e.key === ' ' && !(e.target && e.target.closest && e.target.closest('button, input'))) {
            e.preventDefault();
            activeFrame._pdrStepper.togglePlay();
          }
        }
      });
    }

    function mountGraphicClone(srcEl, frame) {
      const isSvg = srcEl.tagName.toLowerCase() === 'svg';
      aspectRatio = detectAspectRatio(srcEl);
      canvasEl.innerHTML = '';
      canvasEl.classList.toggle('is-diag-canvas', isSvg && srcEl.classList.contains('diag-svg'));
      const clone = srcEl.cloneNode(true);
      if (isSvg) {
        clone.classList.remove('svg-dimmed');
        clone.querySelectorAll('.is-highlighted').forEach(n => n.classList.remove('is-highlighted'));
        clone.querySelectorAll('circle.flow-dot').forEach(dot => dot.remove());
        clone.removeAttribute('width');
        clone.removeAttribute('height');
      }
      canvasEl.appendChild(clone);
      if (frame && frame._pdrStepper) {
        canvasEl.classList.add('fig-steps');
        frame._pdrStepper.applyTo(canvasEl);
      } else {
        canvasEl.classList.remove('fig-steps', 'is-still', 'is-full');
      }
    }

    function openFromFrame(frame) {
      if (!frame) return;
      const srcEl = pickVisibleGraphic(frame);
      if (!srcEl) return;
      ensureLightbox();
      if (activeCleanup) { activeCleanup(); activeCleanup = null; }
      activeFrame = frame;

      mountGraphicClone(srcEl, frame);

      // Build interactive footer dock when figure has stepper and/or view-switch controls
      const stepper = frame._pdrStepper || null;
      const viewCtl = frame._pdrView || null;
      const cleanups = [];
      if (footEl) {
        footEl.innerHTML = '';
        if (stepper || viewCtl) {
          const barRow = document.createElement('div');
          barRow.className = 'lb-foot-bar';

          if (viewCtl && viewCtl.views.length) {
            const vWrap = document.createElement('div');
            vWrap.className = 'view-switch';
            vWrap.setAttribute('role', 'group');
            const vBtns = viewCtl.views.map(v => {
              const b = document.createElement('button');
              b.type = 'button';
              b.className = 'view-btn' + (viewCtl.getActive() === v.key ? ' is-active' : '');
              b.textContent = v.label;
              b.setAttribute('aria-pressed', viewCtl.getActive() === v.key ? 'true' : 'false');
              b.addEventListener('click', () => viewCtl.setView(v.key));
              vWrap.appendChild(b);
              return { key: v.key, btn: b };
            });
            barRow.appendChild(vWrap);

            const onViewChange = (ev) => {
              const key = (ev && ev.detail && ev.detail.view) || viewCtl.getActive();
              vBtns.forEach(item => {
                const on = item.key === key;
                item.btn.classList.toggle('is-active', on);
                item.btn.setAttribute('aria-pressed', on ? 'true' : 'false');
              });
              const innerPanels = Array.from(canvasEl.querySelectorAll('[data-view-panel]'));
              if (innerPanels.length) {
                innerPanels.forEach(p => {
                  const allowed = (p.getAttribute('data-view-panel') || '').trim().split(/\s+/);
                  setViewPanelVisible(p, allowed.includes(key));
                });
              } else {
                const nextSrc = pickVisibleGraphic(frame);
                if (nextSrc) {
                  mountGraphicClone(nextSrc, frame);
                  fitToStage();
                }
              }
            };
            frame.addEventListener('pdr:view', onViewChange);
            cleanups.push(() => frame.removeEventListener('pdr:view', onViewChange));
          }

          let noteBox = null;
          if (stepper) {
            const bPrev = document.createElement('button');
            bPrev.type = 'button';
            bPrev.className = 'btn';
            bPrev.textContent = ui.prev;
            bPrev.addEventListener('click', () => stepper.go(-1));

            const bPlay = document.createElement('button');
            bPlay.type = 'button';
            bPlay.className = 'btn btn-primary';
            bPlay.textContent = stepper.isPlaying() ? ui.pause : ui.play;
            bPlay.addEventListener('click', () => stepper.togglePlay());

            const rng = document.createElement('input');
            rng.type = 'range';
            rng.className = 'player-range';
            rng.min = '0';
            rng.max = String(stepper.count - 1);
            rng.value = String(stepper.getIndex());
            rng.setAttribute('aria-label', 'Step');
            rng.addEventListener('input', () => {
              stepper.stop();
              stepper.show(Number(rng.value), false);
            });

            const bNext = document.createElement('button');
            bNext.type = 'button';
            bNext.className = 'btn';
            bNext.textContent = ui.next;
            bNext.addEventListener('click', () => stepper.go(1));

            const bdg = document.createElement('span');
            bdg.className = 'step-badge';
            bdg.textContent = (stepper.getIndex() + 1) + ' / ' + stepper.count;

            const hint = document.createElement('span');
            hint.className = 'lb-step-hint';
            hint.textContent = ui.lbStepHint;

            barRow.append(bPrev, bPlay, rng, bNext, bdg, hint);

            noteBox = document.createElement('div');
            noteBox.className = 'lb-step-note';

            const syncLbStep = () => {
              stepper.applyTo(canvasEl);
              const isPrev = stepper.isPreviewing();
              const activeIdx = stepper.getActiveIndex();
              const committedIdx = stepper.getIndex();
              rng.value = String(committedIdx);
              bdg.textContent = isPrev ? ui.stepPreview(activeIdx + 1, stepper.count) : ((committedIdx + 1) + ' / ' + stepper.count);
              bdg.classList.toggle('is-preview', isPrev);
              bPlay.textContent = stepper.isPlaying() ? ui.pause : ui.play;
              noteBox.classList.toggle('is-preview', isPrev);
              noteBox.innerHTML = '';
              const srcLi = stepper.getNoteEl(activeIdx);
              if (srcLi) {
                Array.from(srcLi.childNodes).forEach(node => noteBox.appendChild(node.cloneNode(true)));
              }
            };
            syncLbStep();
            const unbindLbCards = stepper.bindStepCards(canvasEl, stageEl._pdrDragState);
            frame.addEventListener('pdr:step', syncLbStep);
            cleanups.push(() => {
              unbindLbCards();
              frame.removeEventListener('pdr:step', syncLbStep);
              stepper.clearPreview();
              stepper.stop();
            });
          }

          footEl.appendChild(barRow);
          if (noteBox) footEl.appendChild(noteBox);
          footEl.hidden = false;
        } else {
          footEl.hidden = true;
        }
      }
      activeCleanup = () => cleanups.forEach(fn => fn());

      const t = frame.getAttribute('data-lightbox-title')
        || (frame.querySelector('.fig-title') ? frame.querySelector('.fig-title').textContent.trim() : ui.lbTitle);
      titleEl.textContent = t;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(fitToStage);
    }

    document.querySelectorAll('[data-zoom-btn]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openFromFrame(btn.closest('.fig-frame'));
      });
    });

    document.querySelectorAll('.fig-frame .fig-zoomable, .fig-frame img').forEach(el => {
      if (el.dataset.zoomBound) return;
      el.dataset.zoomBound = '1';
      el.style.cursor = 'zoom-in';
      el.addEventListener('click', (e) => {
        if (e.target && e.target.closest && e.target.closest('.is-step-card, [data-jump]')) return;
        openFromFrame(el.closest('.fig-frame'));
      });
    });
  })();
})();
