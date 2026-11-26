/* paper-deep-reader: Zero-Dependency Declarative Interactive Engine (v1.3.0)
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
        foldFigs: '本篇图表',
        foldEqs: '核心公式',
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
        symJump: '定位到符号表 ↗',
        jumpBack: '↩ 返回阅读处',
        tblSearch: '筛选行…',
        tblRows: (v, t) => v + ' / ' + t + ' 行',
        tblExtrema: '极值高亮',
        tblCsv: '复制 CSV',
        copied: '已复制 ✓',
        figNoteTitle: '对此图记批注或提问',
        selNote: '✎ 批注',
        selAsk: '? 提问',
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
        lbOut: '缩小',
        lbIn: '放大',
        lbFit: '复位',
        lbFitAria: '复位适应窗口',
        lbCloseAria: '关闭放大视图',
      }
    : {
        outlineCap: 'Contents',
        foldFigs: 'Figures',
        foldEqs: 'Equations',
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
        symJump: 'Jump to symbol table ↗',
        jumpBack: '↩ Back to reading',
        tblSearch: 'Filter rows…',
        tblRows: (v, t) => v + ' / ' + t + ' rows',
        tblExtrema: 'Highlight extrema',
        tblCsv: 'Copy CSV',
        copied: 'Copied ✓',
        figNoteTitle: 'Annotate or ask about this figure',
        selNote: '✎ Note',
        selAsk: '? Ask',
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
    const tocList = document.getElementById('toc-list');
    const tocLinks = tocList ? Array.from(tocList.querySelectorAll('a')) : [];
    const sections = tocLinks.map(a => {
      const href = a.getAttribute('href') || '';
      return href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
    }).filter(Boolean);

    let footerPos = null;
    let miniFill = null;
    const tocCard = tocList ? tocList.closest('.toc-card') : null;
    if (tocCard && tocList) {
      const heading = tocCard.querySelector('.toc-heading');
      if (heading && !heading.textContent.trim()) heading.textContent = ui.outlineCap;

      const figs = Array.from(document.querySelectorAll('.article-main figure.fig-frame'));
      const eqs = Array.from(document.querySelectorAll('.article-main .eq-box'));
      figs.forEach((f, i) => { if (!f.id) f.id = 'pdr-fig-' + (i + 1); });
      eqs.forEach((e, i) => { if (!e.id) e.id = 'pdr-eq-' + (i + 1); });

      if (figs.length || eqs.length) {
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
            return { el: f, text: titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : ('Fig. ' + (i + 1)) };
          });
          foldGroup.appendChild(buildFold(ui.foldFigs, figItems));
        }
        if (eqs.length) {
          const eqItems = eqs.map((eq, i) => {
            const lbl = eq.querySelector('.eq-label > span:first-child') || eq.querySelector('.eq-label');
            return { el: eq, text: lbl ? lbl.textContent.replace(/\s+/g, ' ').trim() : ('Eq. ' + (i + 1)) };
          });
          foldGroup.appendChild(buildFold(ui.foldEqs, eqItems));
        }
        tocList.insertAdjacentElement('afterend', foldGroup);
      }

      // Reading progress bar & estimated reading time footer
      const mainEl = document.querySelector('.article-main');
      const rawTxt = mainEl ? mainEl.textContent || '' : '';
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

    function updateNav() {
      rafPending = false;
      if (bar) {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      }
      if (!sections.length) return;
      let nextIdx = 0;
      if (window.scrollY >= 160) {
        for (let i = 0; i < sections.length; i++) {
          if (sections[i].getBoundingClientRect().top <= 170) nextIdx = i;
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
    window.addEventListener('scroll', () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateNav);
      }
    }, { passive: true });
    updateNav();
  })();

  // 3. Bidirectional Prose <-> SVG Linked Highlighting
  (function initLinkedHighlights() {
    const allLinked = Array.from(document.querySelectorAll('[data-ref], [data-ref-node]'));
    if (!allLinked.length) return;

    function keysOf(el) {
      const a = (el.getAttribute('data-ref') || '').trim();
      const b = (el.getAttribute('data-ref-node') || '').trim();
      return (a + ' ' + b).trim().split(/\s+/).filter(Boolean);
    }

    const byKey = new Map();
    allLinked.forEach(el => {
      const ks = keysOf(el);
      ks.forEach(k => {
        if (!byKey.has(k)) byKey.set(k, []);
        byKey.get(k).push(el);
      });
      if (!el.closest('svg') && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    });

    let activeKeys = [];
    function paint(keys) {
      activeKeys = keys;
      const litSvgs = new Set();
      allLinked.forEach(el => {
        const hit = keys.length > 0 && keysOf(el).some(k => keys.includes(k));
        const inSvg = !!el.closest('svg');
        if (inSvg) {
          el.classList.toggle('is-highlighted', hit);
          if (hit) litSvgs.add(el.closest('svg'));
        } else {
          el.classList.toggle('is-active', hit);
        }
      });
      document.querySelectorAll('svg').forEach(svg => {
        svg.classList.toggle('svg-dimmed', litSvgs.has(svg));
      });
    }

    allLinked.forEach(el => {
      const ks = keysOf(el);
      if (!ks.length) return;
      el.addEventListener('mouseenter', () => paint(ks));
      el.addEventListener('mouseleave', () => { if (activeKeys === ks) paint([]); });
      el.addEventListener('focus', () => paint(ks));
      el.addEventListener('blur', () => { if (activeKeys === ks) paint([]); });
    });
  })();

  // 4. Auto-Indexed Symbol Hover Quick-Card (data-sym, live KaTeX DOM cloning)
  (function initSymbolCards() {
    const refs = Array.from(document.querySelectorAll('[data-sym]'));
    if (!refs.length) return;

    const symMap = new Map();
    function cleanKey(s) {
      return (s || '').replace(/\$/g, '').replace(/\s+/g, ' ').trim();
    }
    function indexRow(tr, explicitKeys) {
      const cells = Array.from(tr.querySelectorAll('td'));
      if (cells.length < 2) return;
      const symText = cleanKey(cells[0].textContent);
      const entry = { rowEl: tr, cells: cells };
      const keys = (explicitKeys || symText).split(',').map(cleanKey).filter(Boolean);
      keys.forEach(k => { if (!symMap.has(k)) symMap.set(k, entry); });
    }

    document.querySelectorAll('tr[data-sym-def]').forEach(tr => indexRow(tr, tr.getAttribute('data-sym-def')));
    document.querySelectorAll('table[data-sym-table] tbody tr').forEach(tr => {
      indexRow(tr, tr.getAttribute('data-sym-def') || '');
    });

    let pop = null;
    let activeRef = null;
    let hideTimer = 0;

    function closePop() {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = 0; }
      if (pop) { pop.remove(); pop = null; }
      if (activeRef) { activeRef.classList.remove('is-sym-open'); activeRef = null; }
    }
    function scheduleClose() {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(closePop, 150);
    }

    function openPop(el) {
      const rawKey = cleanKey(el.getAttribute('data-sym'));
      const tip = (el.getAttribute('data-sym-tip') || '').trim();
      const entry = symMap.get(rawKey) || null;
      if (!entry && !tip) return;

      closePop();
      activeRef = el;
      el.classList.add('is-sym-open');

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
        Array.from(el.childNodes).forEach(n => keyEl.appendChild(n.cloneNode(true)));
      }
      head.appendChild(keyEl);

      if (entry && entry.cells.length >= 3) {
        const domEl = document.createElement('span');
        domEl.className = 'pdr-sym-domain';
        Array.from(entry.cells[1].childNodes).forEach(n => domEl.appendChild(n.cloneNode(true)));
        head.appendChild(domEl);
      } else if (!entry && el.getAttribute('data-sym-domain')) {
        const domEl = document.createElement('span');
        domEl.className = 'pdr-sym-domain';
        domEl.textContent = el.getAttribute('data-sym-domain');
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
        body.textContent = tip;
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

      // Guarantee KaTeX rendering even for inline data-sym-tip or early hover before initial auto-render
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

      const rect = el.getBoundingClientRect();
      const pw = pop.offsetWidth;
      const ph = pop.offsetHeight;
      let left = rect.left + rect.width / 2 - pw / 2;
      left = Math.max(12, Math.min(left, window.innerWidth - pw - 12));
      let top = rect.bottom + 8;
      if (top + ph > window.innerHeight - 12) top = Math.max(12, rect.top - ph - 8);
      pop.style.left = left.toFixed(0) + 'px';
      pop.style.top = top.toFixed(0) + 'px';
    }

    refs.forEach(el => {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      el.addEventListener('mouseenter', () => openPop(el));
      el.addEventListener('mouseleave', scheduleClose);
      el.addEventListener('focus', () => openPop(el));
      el.addEventListener('blur', scheduleClose);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeRef === el) closePop();
        else openPop(el);
      });
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(); });
    document.addEventListener('click', (e) => { if (pop && !pop.contains(e.target) && e.target !== activeRef) closePop(); });
  })();

  // 5. Declarative Flowchart Stepper & Proportional Flow Dots (.fig-steps)
  (function initDeclarativeSteppers() {
    document.querySelectorAll('.fig-steps').forEach(root => {
      const notes = Array.from(root.querySelectorAll('.steps-notes > li'));
      const n = notes.length;
      if (!n) return;

      const stepEls = Array.from(root.querySelectorAll('[data-step]')).filter(el => !el.closest('.steps-notes') && !el.closest('.step-vals'));
      const valGroups = Array.from(root.querySelectorAll('.step-vals'));

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
      let timer = 0;

      function parseSteps(el) {
        return (el.getAttribute('data-step') || '').trim().split(/\s+/).map(tok => {
          if (tok === 'final') return n;
          const v = Number(tok);
          return Number.isFinite(v) ? v : -1;
        }).filter(v => v >= 0);
      }

      function show(k, stillMode) {
        idx = Math.max(0, Math.min(n - 1, k));
        const cur = idx + 1;
        root.classList.toggle('is-still', !!stillMode);
        root.classList.toggle('is-full', idx === n - 1);

        stepEls.forEach(el => {
          const nums = parseSteps(el);
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

        valGroups.forEach(grp => {
          const kids = Array.from(grp.querySelectorAll('[data-step]'));
          let best = null;
          let bestStep = -1;
          kids.forEach(kid => {
            const nums = parseSteps(kid);
            nums.forEach(s => {
              if (s <= cur && s >= bestStep) { bestStep = s; best = kid; }
            });
          });
          kids.forEach(kid => kid.classList.toggle('is-val-active', kid === best));
        });

        notes.forEach((li, j) => { li.hidden = j !== idx; });
        if (range) range.value = String(idx);
        if (badge) badge.textContent = cur + ' / ' + n;
        root.dispatchEvent(new CustomEvent('pdr:step', { detail: { step: cur, total: n } }));
      }

      function stop() {
        if (timer) { clearInterval(timer); timer = 0; }
        if (playBtn) playBtn.textContent = ui.play;
      }

      bar.addEventListener('click', (e) => {
        const go = e.target.closest('[data-step-go]');
        if (go) {
          stop();
          show(idx + Number(go.getAttribute('data-step-go')), false);
          return;
        }
        if (e.target.closest('[data-step-play]')) {
          if (timer) { stop(); return; }
          if (idx === n - 1) show(0, false);
          if (playBtn) playBtn.textContent = ui.pause;
          timer = setInterval(() => {
            if (idx < n - 1) show(idx + 1, false);
            else stop();
          }, 2800);
        }
      });

      if (range) {
        range.addEventListener('input', () => {
          stop();
          show(Number(range.value), false);
        });
      }

      show(n - 1, true);
      window.addEventListener('beforeprint', () => { stop(); show(n - 1, true); });
    });

    // Proportional Flow Dots (respects prefers-reduced-motion & viewport visibility)
    if (!prefersReducedMotion && typeof IntersectionObserver !== 'undefined') {
      document.querySelectorAll('svg').forEach(svg => {
        const layer = svg.querySelector('.flow-dots');
        const routeEls = Array.from(svg.querySelectorAll('path[data-flow]'));
        if (!layer || !routeEls.length) return;
        const stepper = svg.closest('.fig-steps');
        const routes = routeEls.map(p => ({
          p: p,
          len: p.getTotalLength ? p.getTotalLength() : 0,
          every: Math.max(250, Number(p.getAttribute('data-every')) || 1200),
          cls: 'flow-dot ' + (p.getAttribute('data-flow') || 'teal'),
          next: 0,
        })).filter(r => r.len > 10);
        if (!routes.length) return;

        let dots = [];
        let visible = false;
        let running = false;

        function isLive() {
          return visible && (!stepper || stepper.classList.contains('is-full'));
        }
        function tick(t) {
          if (!isLive()) {
            running = false;
            dots.forEach(d => d.c.remove());
            dots = [];
            return;
          }
          routes.forEach(r => {
            if (t >= r.next) {
              r.next = t + r.every;
              const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              c.setAttribute('r', '3.5');
              c.setAttribute('class', r.cls);
              layer.appendChild(c);
              dots.push({ c: c, r: r, t0: t });
            }
          });
          dots = dots.filter(d => {
            const dist = (t - d.t0) * 0.16;
            if (dist > d.r.len) { d.c.remove(); return false; }
            const pt = d.r.p.getPointAtLength(dist);
            d.c.setAttribute('cx', pt.x.toFixed(1));
            d.c.setAttribute('cy', pt.y.toFixed(1));
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
        new IntersectionObserver((entries) => {
          visible = !!(entries[0] && entries[0].isIntersecting);
          start();
        }, { threshold: 0.1 }).observe(svg);
      });
    }
  })();

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
          p.classList.toggle('is-view-hidden', !allowed.includes(key));
        });
      }

      btns.forEach(b => {
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          applyView(b.getAttribute('data-set-view'));
        });
      });

      const initial = frame.getAttribute('data-view')
        || (btns.find(b => b.classList.contains('is-active')) || btns[0]).getAttribute('data-set-view');
      if (initial) applyView(initial);
    });
  })();

  // 7. Declarative Interactive Data Tables (table[data-interactive])
  (function initInteractiveTables() {
    function parseNum(raw) {
      const s = (raw || '').replace(/,/g, '').replace(/[−–—]/g, '-').trim();
      if (!s || /^(-|n\/a|na|—|–)$/i.test(s)) return null;
      const m = s.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/);
      return m ? Number(m[0]) : null;
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

      // Detect numeric columns for extrema highlight
      const numericCols = [];
      if (!hasBodySpan && ths.length) {
        ths.forEach((th, colIdx) => {
          let nums = 0;
          dataRows.forEach(r => {
            const td = r.children[colIdx];
            if (td && parseNum(td.textContent) !== null) nums++;
          });
          if (nums >= Math.max(3, Math.ceil(dataRows.length * 0.6))) numericCols.push(colIdx);
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
      if (numericCols.length && dataRows.length >= 4) {
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
        numericCols.forEach(colIdx => {
          const vals = visibleRows.map(r => ({ td: r.children[colIdx], v: parseNum(r.children[colIdx] && r.children[colIdx].textContent) })).filter(x => x.v !== null);
          if (vals.length < 2) return;
          const minV = Math.min(...vals.map(x => x.v));
          const maxV = Math.max(...vals.map(x => x.v));
          if (minV === maxV) return;
          const lowBetter = ths[colIdx] && ths[colIdx].getAttribute('data-better') === 'low';
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
            else { sortCol = colIdx; sortDir = numericCols.includes(colIdx) ? -1 : 1; }

            ths.forEach((h, j) => {
              h.classList.toggle('is-sorted', j === sortCol);
              const si = h.querySelector('.sort-ind');
              if (si) si.textContent = j === sortCol ? (sortDir > 0 ? '↑' : '↓') : '⇅';
            });

            dataRows.sort((a, b) => {
              const ta = (a.children[colIdx] ? a.children[colIdx].textContent : '').trim();
              const tb = (b.children[colIdx] ? b.children[colIdx].textContent : '').trim();
              const na = parseNum(ta);
              const nb = parseNum(tb);
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

  // 8. Cross-Reference Anchor Jump + Auto Title Hint
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
  })();

  // 9. Zero-Clutter Selection Notes & Figure Annotations + Markdown Export
  (function initNotesAndAnnotations() {
    const STORAGE_KEY = 'pdr-notes:' + DOC_KEY;
    let notes = [];
    try {
      const raw = lsGet(STORAGE_KEY, '[]');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) notes = parsed;
    } catch (_) {
      notes = [];
    }

    function persist() {
      lsSet(STORAGE_KEY, JSON.stringify(notes));
      syncNotesPill();
    }

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
        openComposer({ kind: 'note', ctx: ctx, quote: '', targetId: frame.id, anchorRect: btn.getBoundingClientRect() });
      });
      const zoomBtn = actions.querySelector('[data-zoom-btn]');
      if (zoomBtn) actions.insertBefore(btn, zoomBtn);
      else actions.appendChild(btn);
    });

    // Selection mini popover
    let selPop = null;
    let notePop = null;
    function closeSelPop() { if (selPop) { selPop.remove(); selPop = null; } }
    function closeNotePop() { if (notePop) { notePop.remove(); notePop = null; } }

    function nearestContext(node) {
      const el = node && node.nodeType === 1 ? node : (node && node.parentElement);
      if (!el) return { ctx: document.title, targetId: '' };
      const fig = el.closest('figure.fig-frame');
      if (fig) {
        const ft = fig.querySelector('.fig-title');
        return { ctx: ft ? ft.textContent.trim() : fig.id, targetId: fig.id || '' };
      }
      const sec = el.closest('section');
      if (sec) {
        const h2 = sec.querySelector('h2');
        return { ctx: h2 ? h2.textContent.replace(/\s+/g, ' ').trim() : sec.id, targetId: sec.id || '' };
      }
      return { ctx: document.title, targetId: '' };
    }

    function openComposer({ kind, ctx, quote, targetId, anchorRect }) {
      closeSelPop();
      closeNotePop();

      notePop = document.createElement('div');
      notePop.className = 'pdr-note-pop';
      notePop.setAttribute('role', 'dialog');

      const ctxEl = document.createElement('div');
      ctxEl.className = 'pdr-note-ctx';
      ctxEl.textContent = (kind === 'ask' ? ui.tagAsk : ui.tagNote) + ' · ' + ctx;
      notePop.appendChild(ctxEl);

      if (quote) {
        const qEl = document.createElement('blockquote');
        qEl.className = 'pdr-note-quote';
        qEl.textContent = quote;
        notePop.appendChild(qEl);
      }

      const ta = document.createElement('textarea');
      ta.placeholder = kind === 'ask' ? ui.askPlaceholder : ui.notePlaceholder;
      notePop.appendChild(ta);

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
        notes.push({
          id: 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          kind: kind,
          ctx: ctx,
          quote: quote,
          text: txt,
          targetId: targetId,
          ts: new Date().toISOString().slice(0, 16).replace('T', ' '),
        });
        persist();
        closeNotePop();
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

    const article = document.querySelector('.article-main');
    if (article) {
      article.addEventListener('mouseup', (e) => {
        if (e.target.closest('button, input, textarea, select, .pdr-sel-pop, .pdr-note-pop, .tbl-tools, .steps-bar')) return;
        setTimeout(() => {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed || !sel.rangeCount) { closeSelPop(); return; }
          const text = sel.toString().replace(/\s+/g, ' ').trim();
          if (text.length < 4 || text.length > 520) { closeSelPop(); return; }
          const range = sel.getRangeAt(0);
          if (!article.contains(range.commonAncestorContainer)) { closeSelPop(); return; }
          const rect = range.getBoundingClientRect();
          if (!rect || (!rect.width && !rect.height)) return;

          closeSelPop();
          const info = nearestContext(range.commonAncestorContainer);
          selPop = document.createElement('div');
          selPop.className = 'pdr-sel-pop';
          const bNote = document.createElement('button');
          bNote.type = 'button';
          bNote.textContent = ui.selNote;
          bNote.addEventListener('click', (ev) => {
            ev.stopPropagation();
            openComposer({ kind: 'note', ctx: info.ctx, quote: text, targetId: info.targetId, anchorRect: rect });
          });
          const bAsk = document.createElement('button');
          bAsk.type = 'button';
          bAsk.textContent = ui.selAsk;
          bAsk.addEventListener('click', (ev) => {
            ev.stopPropagation();
            openComposer({ kind: 'ask', ctx: info.ctx, quote: text, targetId: info.targetId, anchorRect: rect });
          });
          selPop.append(bNote, bAsk);
          document.body.appendChild(selPop);
          const sw = selPop.offsetWidth;
          const left = Math.max(10, Math.min(rect.left + window.scrollX + rect.width / 2 - sw / 2, window.scrollX + window.innerWidth - sw - 10));
          const top = Math.max(8, rect.top + window.scrollY - selPop.offsetHeight - 8);
          selPop.style.left = left.toFixed(0) + 'px';
          selPop.style.top = top.toFixed(0) + 'px';
        }, 12);
      });
    }

    document.addEventListener('mousedown', (e) => {
      if (selPop && !selPop.contains(e.target)) closeSelPop();
      if (notePop && !notePop.contains(e.target) && !e.target.closest('.fig-note-btn')) closeNotePop();
    });

    function buildNotesMarkdown() {
      const lines = ['# ' + (document.title || 'Paper Reading Notes'), ''];
      notes.forEach((item, i) => {
        const tag = item.kind === 'ask' ? ui.tagAsk : ui.tagNote;
        lines.push('## ' + (i + 1) + '. [' + tag + '] ' + item.ctx + ' (' + item.ts + ')');
        if (item.quote) lines.push('> ' + item.quote);
        lines.push('', item.text, '');
      });
      return lines.join('\n');
    }

    let modalOverlay = null;
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
            persist();
            renderNotesModal();
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
      if (!body) return;
      body.innerHTML = '';
      if (!notes.length) {
        const p = document.createElement('p');
        p.style.color = 'var(--muted)';
        p.style.margin = '0.4rem 0';
        p.textContent = ui.notesEmpty;
        body.appendChild(p);
        return;
      }
      notes.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'pdr-note-item';
        const head = document.createElement('div');
        head.className = 'pdr-note-item-head';
        const left = document.createElement('span');
        left.innerHTML = '<span class="pill ' + (item.kind === 'ask' ? 'pill-terra' : 'pill-teal') + '">' + (item.kind === 'ask' ? ui.tagAsk : ui.tagNote) + '</span> ' +
          '<strong></strong>';
        left.querySelector('strong').textContent = item.ctx;
        const right = document.createElement('span');
        right.style.display = 'inline-flex';
        right.style.gap = '0.35rem';
        if (item.targetId && document.getElementById(item.targetId)) {
          const bLoc = document.createElement('button');
          bLoc.type = 'button';
          bLoc.className = 'tbl-btn';
          bLoc.textContent = ui.locate;
          bLoc.addEventListener('click', () => {
            closeNotesModal();
            jumpToElement(document.getElementById(item.targetId), false);
          });
          right.appendChild(bLoc);
        }
        const bDel = document.createElement('button');
        bDel.type = 'button';
        bDel.className = 'tbl-btn';
        bDel.textContent = ui.del;
        bDel.addEventListener('click', () => {
          notes.splice(idx, 1);
          persist();
          renderNotesModal();
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
        const t = document.createElement('p');
        t.className = 'pdr-note-item-text';
        t.textContent = item.text;
        card.appendChild(t);
        body.appendChild(card);
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-open')) closeNotesModal();
    });
  })();

  // 10. Fullscreen Two-Stage Vector Pan & Zoom Lightbox
  (function initLightbox() {
    let overlay = document.getElementById('fig-lightbox');
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
          '</div>' +
        '</div>';
      document.body.appendChild(tpl.firstElementChild);
      overlay = document.getElementById('fig-lightbox');
    }

    const titleEl = document.getElementById('lb-title');
    const canvasEl = document.getElementById('lb-canvas');
    const stageEl = document.getElementById('lb-stage');
    const zoomValEl = document.getElementById('lb-zoom-val');
    const btnIn = document.getElementById('lb-in');
    const btnOut = document.getElementById('lb-out');
    const btnFit = document.getElementById('lb-fit');
    const btnClose = document.getElementById('lb-close');

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

    function openFromFrame(frame) {
      if (!frame) return;
      const srcEl = pickVisibleGraphic(frame);
      if (!srcEl) return;
      const isSvg = srcEl.tagName.toLowerCase() === 'svg';

      aspectRatio = detectAspectRatio(srcEl);
      canvasEl.innerHTML = '';
      canvasEl.classList.toggle('is-diag-canvas', isSvg && srcEl.classList.contains('diag-svg'));
      const clone = srcEl.cloneNode(true);
      if (isSvg) {
        clone.classList.remove('svg-dimmed');
        clone.querySelectorAll('.is-highlighted').forEach(n => n.classList.remove('is-highlighted'));
        clone.removeAttribute('width');
        clone.removeAttribute('height');
      }
      canvasEl.appendChild(clone);

      const t = frame.getAttribute('data-lightbox-title')
        || (frame.querySelector('.fig-title') ? frame.querySelector('.fig-title').textContent.trim() : ui.lbTitle);
      titleEl.textContent = t;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(fitToStage);
    }

    function closeLightbox() {
      if (crispTimer) { clearTimeout(crispTimer); crispTimer = 0; }
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      dragging = false;
      stageEl.classList.remove('is-dragging');
    }

    stageEl.addEventListener('wheel', (e) => {
      if (!overlay.classList.contains('is-open')) return;
      e.preventDefault();
      const rect = stageEl.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.14 : (1 / 1.14);
      zoomAt(scale * factor, e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });

    stageEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartTx = tx;
      dragStartTy = ty;
      stageEl.classList.add('is-dragging');
      stageEl.setPointerCapture(e.pointerId);
    });
    stageEl.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      tx = dragStartTx + (e.clientX - dragStartX);
      ty = dragStartTy + (e.clientY - dragStartY);
      scheduleGpu();
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      stageEl.classList.remove('is-dragging');
      if (e && stageEl.hasPointerCapture && stageEl.hasPointerCapture(e.pointerId)) {
        stageEl.releasePointerCapture(e.pointerId);
      }
    }
    stageEl.addEventListener('pointerup', endDrag);
    stageEl.addEventListener('pointercancel', endDrag);

    stageEl.addEventListener('dblclick', (e) => {
      const rect = stageEl.getBoundingClientRect();
      if (Math.abs(scale - 1.0) < 0.08) zoomAt(2.2, e.clientX - rect.left, e.clientY - rect.top);
      else fitToStage();
    });

    window.addEventListener('resize', () => {
      if (overlay.classList.contains('is-open')) fitToStage();
    });

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
      el.addEventListener('click', () => openFromFrame(el.closest('.fig-frame')));
    });

    btnIn.addEventListener('click', () => zoomCenter(1.25));
    btnOut.addEventListener('click', () => zoomCenter(1 / 1.25));
    btnFit.addEventListener('click', fitToStage);
    btnClose.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === '+' || e.key === '=') zoomCenter(1.25);
      else if (e.key === '-') zoomCenter(1 / 1.25);
      else if (e.key === '0') fitToStage();
    });
  })();
})();
