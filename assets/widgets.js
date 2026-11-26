/* paper-deep-reader: Zero-Dependency Interactive Widgets (v1.2)
 * 1. rAF-throttled GPU scroll progress bar + left TOC scroll-spy
 * 2. Prose-to-SVG linked highlighting (data-ref <-> data-ref-node)
 * 3. Two-stage 120fps GPU + debounced crisp vector Pan & Zoom Lightbox
 */
(function initPaperDeepReaderWidgets() {
  // 1. Navigation Progress & Sticky TOC Scroll-Spy
  (function initNavigation() {
    const bar = document.getElementById('scroll-progress');
    const tocLinks = Array.from(document.querySelectorAll('#toc-list a'));
    const sections = tocLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
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
      if (window.scrollY >= 180) {
        for (let i = 0; i < sections.length; i++) {
          if (sections[i].getBoundingClientRect().top <= 160) nextIdx = i;
        }
      }
      if (nextIdx !== activeIdx) {
        if (tocLinks[activeIdx]) tocLinks[activeIdx].classList.remove('active');
        if (tocLinks[nextIdx]) tocLinks[nextIdx].classList.add('active');
        activeIdx = nextIdx;
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

  // 2. Prose-to-SVG Linked Highlighting
  (function initLinkedHighlights() {
    const terms = document.querySelectorAll('.ref-term[data-ref]');
    terms.forEach(term => {
      const ids = term.getAttribute('data-ref').trim().split(/\s+/).filter(Boolean);
      const nodes = [];
      ids.forEach(id => {
        document.querySelectorAll('.svg-node[data-ref-node="' + id + '"]').forEach(n => nodes.push(n));
      });
      if (!nodes.length) return;
      const svgs = Array.from(new Set(nodes.map(n => n.closest('svg')))).filter(Boolean);
      if (!term.hasAttribute('tabindex')) term.setAttribute('tabindex', '0');

      function activate() {
        term.classList.add('is-active');
        svgs.forEach(s => s.classList.add('svg-dimmed'));
        nodes.forEach(n => n.classList.add('is-highlighted'));
      }
      function deactivate() {
        term.classList.remove('is-active');
        svgs.forEach(s => s.classList.remove('svg-dimmed'));
        nodes.forEach(n => n.classList.remove('is-highlighted'));
      }
      term.addEventListener('mouseenter', activate);
      term.addEventListener('mouseleave', deactivate);
      term.addEventListener('focus', activate);
      term.addEventListener('blur', deactivate);
    });
  })();

  // 3. Fullscreen Two-Stage Vector Pan & Zoom Lightbox
  (function initLightbox() {
    const isZh = /^zh\b/i.test((document.documentElement.getAttribute('lang') || 'zh-CN').trim());
    const ui = isZh
      ? {
          title: '图表放大查看',
          hint: '滚轮缩放 · 拖拽平移 · 双击还原',
          zoomOut: '缩小',
          zoomIn: '放大',
          fit: '复位',
          fitAria: '复位适应窗口',
          close: '✕ 关闭',
          closeAria: '关闭放大视图',
        }
      : {
          title: 'Inspect Figure',
          hint: 'Wheel to zoom · Drag to pan · Double-click to reset',
          zoomOut: 'Zoom out',
          zoomIn: 'Zoom in',
          fit: 'Reset',
          fitAria: 'Fit to window',
          close: '✕ Close',
          closeAria: 'Close fullscreen viewer',
        };

    let overlay = document.getElementById('fig-lightbox');
    if (!overlay) {
      const tpl = document.createElement('div');
      tpl.innerHTML =
        '<div class="lightbox-overlay" id="fig-lightbox" role="dialog" aria-modal="true" aria-label="' + ui.title + '">' +
          '<div class="lightbox-dialog">' +
            '<div class="lightbox-bar">' +
              '<span class="lightbox-title" id="lb-title">' + ui.title + '</span>' +
              '<div class="lightbox-controls">' +
                '<span class="lightbox-hint">' + ui.hint + '</span>' +
                '<button class="btn" type="button" id="lb-out" aria-label="' + ui.zoomOut + '">−</button>' +
                '<span class="lightbox-zoom-val" id="lb-zoom-val">100%</span>' +
                '<button class="btn" type="button" id="lb-in" aria-label="' + ui.zoomIn + '">＋</button>' +
                '<button class="btn" type="button" id="lb-fit" aria-label="' + ui.fitAria + '">' + ui.fit + '</button>' +
                '<button class="btn btn-primary" type="button" id="lb-close" aria-label="' + ui.closeAria + '">' + ui.close + '</button>' +
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

    function openFromFrame(frame) {
      if (!frame) return;
      const svg = frame.querySelector('.fig-svg-wrap svg') || frame.querySelector('svg');
      const img = frame.querySelector('img.fig-img') || frame.querySelector('img.fig-zoomable') || frame.querySelector('img');
      const srcEl = svg || img;
      if (!srcEl) return;
      const isSvg = srcEl.tagName.toLowerCase() === 'svg';

      aspectRatio = detectAspectRatio(srcEl);
      canvasEl.innerHTML = '';
      const clone = srcEl.cloneNode(true);
      if (isSvg) {
        clone.classList.remove('svg-dimmed');
        clone.querySelectorAll('.is-highlighted').forEach(n => n.classList.remove('is-highlighted'));
        clone.removeAttribute('width');
        clone.removeAttribute('height');
      }
      canvasEl.appendChild(clone);

      const t = frame.getAttribute('data-lightbox-title')
        || (frame.querySelector('.fig-title') ? frame.querySelector('.fig-title').textContent.trim() : ui.title);
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
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.14 : (1 / 1.14);
      zoomAt(scale * factor, mx, my);
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
      if (Math.abs(scale - 1.0) < 0.08) {
        zoomAt(2.2, e.clientX - rect.left, e.clientY - rect.top);
      } else {
        fitToStage();
      }
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
      el.addEventListener('click', () => {
        openFromFrame(el.closest('.fig-frame'));
      });
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
