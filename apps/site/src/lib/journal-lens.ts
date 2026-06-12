import { parseLens, lensToParams, type LensState } from './content-utils';

// Idempotent across the ClientRouter: register the page-load listener once.
export function initJournalLens(): void {
  const w = window as unknown as { __journalLens?: boolean };
  if (w.__journalLens) return;
  w.__journalLens = true;
  document.addEventListener('astro:page-load', setup);
}

function setup(): void {
  const root = document.querySelector<HTMLElement>('[data-lens]');
  const feed = document.querySelector<HTMLElement>('[data-feed]');
  if (!root || !feed) return;

  const countEl = root.querySelector<HTMLElement>('[data-count]');
  const total = Number(countEl?.getAttribute('data-total') ?? '0');
  const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
  const word = (n: number) => (lang === 'fr' ? (n > 1 ? 'articles' : 'article') : 'articles');

  const children = () => [...feed.children] as HTMLElement[];

  const apply = (state: LensState) => {
    let visible = 0;
    for (const el of children()) {
      if (el.hasAttribute('data-year')) continue;
      const isSeries = el.hasAttribute('data-series-row');
      const isChapter = el.hasAttribute('data-chapter');
      let show = false;
      if (state.lens === 'temps') show = isSeries || !isChapter;
      else if (state.lens === 'reg') show = !isSeries && el.getAttribute('data-kind') === state.value;
      else if (state.lens === 'tag') show = !isSeries && (el.getAttribute('data-tags') || '').split('|').includes(state.value);
      el.style.display = show ? '' : 'none';
      if (show && !isSeries) visible++;
    }
    const kids = children();
    kids.forEach((el, i) => {
      if (!el.hasAttribute('data-year')) return;
      if (state.lens !== 'temps') { el.style.display = 'none'; return; }
      let any = false;
      for (let j = i + 1; j < kids.length && !kids[j].hasAttribute('data-year'); j++) {
        if (kids[j].style.display !== 'none') { any = true; break; }
      }
      el.style.display = any ? '' : 'none';
    });
    const n = state.lens === 'temps' ? total : visible;
    if (countEl) countEl.textContent = `${n} ${word(n)}`;
    root.querySelectorAll<HTMLElement>('[data-lens-btn]').forEach((b) => {
      const t = b.getAttribute('data-lens-btn');
      const v = b.getAttribute('data-lens-val');
      const on =
        (state.lens === 'temps' && t === 'temps') ||
        (state.lens === 'reg' && t === 'reg' && v === state.value) ||
        (state.lens === 'tag' && t === 'tag' && v === state.value);
      b.setAttribute('aria-pressed', String(on));
      b.style.background = on ? 'var(--ink)' : 'transparent';
      b.style.color = on ? 'var(--bg)' : 'var(--ink2)';
      b.style.borderColor = on ? 'var(--ink)' : 'var(--line)';
    });
    const themeBtn = root.querySelector<HTMLElement>('[data-theme-toggle]');
    if (themeBtn) themeBtn.setAttribute('aria-pressed', String(state.lens === 'tag'));
  };

  const go = (state: LensState) => {
    history.pushState({}, '', location.pathname + lensToParams(state));
    apply(state);
  };

  root.querySelectorAll<HTMLElement>('[data-lens-btn]').forEach((b) => {
    b.addEventListener('click', () => {
      const t = b.getAttribute('data-lens-btn');
      const v = b.getAttribute('data-lens-val') ?? undefined;
      const cur = parseLens(new URLSearchParams(location.search));
      let next: LensState;
      if (t === 'reg' && (v === 'refl' || v === 'design' || v === 'impl')) {
        next = cur.lens === 'reg' && cur.value === v ? { lens: 'temps' } : { lens: 'reg', value: v };
      } else if (t === 'tag' && v) {
        next = cur.lens === 'tag' && cur.value === v ? { lens: 'temps' } : { lens: 'tag', value: v };
      } else {
        next = { lens: 'temps' };
      }
      go(next);
    });
  });

  const tray = root.querySelector<HTMLElement>('[data-tag-tray]');
  root.querySelector<HTMLElement>('[data-theme-toggle]')?.addEventListener('click', () => {
    tray?.toggleAttribute('hidden');
  });

  window.addEventListener('popstate', () => apply(parseLens(new URLSearchParams(location.search))));
  apply(parseLens(new URLSearchParams(location.search)));
}
