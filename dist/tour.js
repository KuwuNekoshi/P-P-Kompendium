(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PPTour = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Keep the explanation beside its target whenever there is room. Otherwise
  // dock it below and let reveal() scroll the target into the remaining space.
  function placement(rect, width, height, viewportWidth, viewportHeight) {
    const gap = 18, edge = 12;
    const clamp = (value, max) => Math.max(edge, Math.min(value, max - edge));
    const beside = clamp(rect.top + (rect.height - height) / 2, viewportHeight - height);
    const across = clamp(rect.left + (rect.width - width) / 2, viewportWidth - width);
    if (viewportWidth >= 760) {
      if (rect.left - gap - width >= edge) return {left:rect.left - gap - width, top:beside, docked:false};
      if (rect.right + gap + width <= viewportWidth - edge) return {left:rect.right + gap, top:beside, docked:false};
      if (rect.bottom + gap + height <= viewportHeight - edge) return {left:across, top:rect.bottom + gap, docked:false};
      if (rect.top - gap - height >= edge) return {left:across, top:rect.top - gap - height, docked:false};
    }
    return {left:clamp((viewportWidth - width) / 2, viewportWidth - width), top:Math.max(edge, viewportHeight - height - edge), docked:true};
  }

  function start({steps, prepare, finish, help}) {
    const dialog = document.createElement('dialog');
    dialog.className = 'tour-dialog';
    dialog.setAttribute('aria-labelledby', 'tour-title');
    dialog.setAttribute('aria-describedby', 'tour-description');
    dialog.innerHTML = '<div class="tour-spotlight" aria-hidden="true"></div><section class="tour-card"><header class="tour-header"><span class="tour-counter"></span><button class="icon-button" data-tour="close" aria-label="Afslut introduktionen" title="Afslut introduktionen">×</button></header><div class="tour-progress" aria-hidden="true"><span></span></div><div class="tour-content"><h2 id="tour-title" tabindex="-1"></h2><div id="tour-description"></div></div><footer class="tour-footer"><div class="tour-navigation"><button class="button outline" data-tour="previous">Forrige</button><button class="button primary" data-tour="next">Næste →</button></div><div class="tour-footnote"><button class="text-button" data-tour="help">Læs hjælpen som tekst</button><span>Esc afslutter</span></div></footer></section>';
    const find = selector => dialog.querySelector(selector);
    const card = find('.tour-card'), spotlight = find('.tour-spotlight');
    const spacer = document.createElement('div');
    spacer.className = 'tour-scroll-space';
    spacer.setAttribute('aria-hidden', 'true');
    document.body.append(spacer, dialog);
    document.body.classList.add('tour-running');
    let index = 0, target = null, resolveTarget = null, frame = 0, ended = false;

    function visibleRect(element) {
      const original = element.getBoundingClientRect();
      let left = Math.max(6, original.left - 6), top = Math.max(6, original.top - 6);
      let right = Math.min(innerWidth - 6, original.right + 6), bottom = Math.min(innerHeight - 6, original.bottom + 6);
      for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const style = getComputedStyle(parent), rect = parent.getBoundingClientRect();
        if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) { top = Math.max(top, rect.top); bottom = Math.min(bottom, rect.bottom); }
        if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) { left = Math.max(left, rect.left); right = Math.min(right, rect.right); }
      }
      return {left, top, right, bottom, width:Math.max(0, right-left), height:Math.max(0, bottom-top)};
    }
    function dimensions() {
      const rect = target.getBoundingClientRect();
      return placement(rect, card.offsetWidth, card.offsetHeight, innerWidth, innerHeight);
    }
    function position() {
      frame = 0;
      target = resolveTarget?.();
      if (ended || !target?.isConnected) return;
      const pos = dimensions(), rect = visibleRect(target);
      Object.assign(card.style, {left:pos.left+'px', top:pos.top+'px'});
      if (pos.docked) rect.height = Math.max(0, Math.min(rect.bottom, pos.top - 12) - rect.top);
      Object.assign(spotlight.style, {left:rect.left+'px', top:rect.top+'px', width:rect.width+'px', height:rect.height+'px'});
    }
    function schedule() { if (!ended && !frame) frame = requestAnimationFrame(position); }
    function reveal() {
      target = resolveTarget?.();
      if (ended || !target) return;
      document.body.style.setProperty('--tour-card-height', card.offsetHeight+'px');
      target.scrollIntoView({block:'center', inline:'nearest', behavior:'instant'});
      if (dimensions().docked) {
        const bottom = innerHeight - card.offsetHeight - 30;
        const rect = target.getBoundingClientRect();
        const desired = Math.max(12, (bottom - Math.min(rect.height, bottom - 12)) / 2);
        let remaining = rect.top - desired;
        for (let parent = target.parentElement; parent && parent !== document.body && parent !== document.documentElement; parent = parent.parentElement) {
          if (!/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) continue;
          const before = parent.scrollTop;
          parent.scrollTop += remaining;
          remaining -= parent.scrollTop - before;
        }
        window.scrollBy({top:remaining, behavior:'instant'});
      }
      position();
    }
    function show(next) {
      if (ended || next < 0 || next >= steps.length) return;
      index = next;
      const step = steps[index];
      try { resolveTarget = prepare(step); target = resolveTarget(); }
      catch (error) { end(); throw error; }
      find('.tour-counter').textContent = `TRIN ${index+1} AF ${steps.length} · ${step.section}`;
      find('#tour-title').textContent = step.title;
      find('#tour-description').innerHTML = step.body;
      find('.tour-content').scrollTop = 0;
      find('.tour-progress span').style.width = ((index+1)/steps.length*100)+'%';
      find('[data-tour="previous"]').disabled = index === 0;
      find('[data-tour="next"]').textContent = index === steps.length-1 ? 'Afslut introduktion' : 'Næste →';
      if (!dialog.open) dialog.showModal();
      // Focusing the heading announces each step and leaves Tab inside the modal.
      find('#tour-title').focus({preventScroll:true});
      reveal();
    }
    function end(readHelp = false) {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(frame);
      document.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', reveal);
      window.visualViewport?.removeEventListener('resize', reveal);
      document.body.classList.remove('tour-running');
      document.body.style.removeProperty('--tour-card-height');
      dialog.close(); dialog.remove(); spacer.remove();
      finish();
      if (readHelp) help();
    }
    dialog.addEventListener('click', event => {
      const button = event.target.closest('[data-tour]');
      if (!button) return;
      event.stopPropagation();
      if (button.dataset.tour === 'close') end();
      else if (button.dataset.tour === 'help') end(true);
      else if (button.dataset.tour === 'previous') show(index-1);
      else if (index === steps.length-1) end();
      else show(index+1);
    });
    dialog.addEventListener('cancel', event => { event.preventDefault(); end(); });
    dialog.addEventListener('close', () => end());
    dialog.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(index-1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); if(index < steps.length-1) show(index+1); }
      else if ((event.key === 'Enter' || event.key === ' ') && event.target === find('#tour-title')) {
        event.preventDefault(); if(index === steps.length-1) end(); else show(index+1);
      }
    });
    document.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', reveal);
    window.visualViewport?.addEventListener('resize', reveal);
    try { show(0); } catch (error) { end(); throw error; }
    return {close:() => end()};
  }
  return {start, placement};
});
