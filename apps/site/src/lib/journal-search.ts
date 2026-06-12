// Client-side journal search over the Pagefind static index.
// The index only exists after `pagefind --site dist` (production/preview build);
// in `astro dev` the dynamic import fails and search degrades to a quiet no-op.

let pf: PagefindRuntime | null = null;
let failed = false;

interface PagefindResultData { url: string; excerpt: string; meta?: { title?: string } }
interface PagefindRuntime {
  options?: (o: Record<string, unknown>) => Promise<void>;
  search: (q: string) => Promise<{ results: { data: () => Promise<PagefindResultData> }[] }>;
}

async function getPagefind(): Promise<PagefindRuntime | null> {
  if (pf || failed) return pf;
  try {
    const base = import.meta.env.BASE_URL || '/';
    pf = (await import(/* @vite-ignore */ `${base}pagefind/pagefind.js`)) as PagefindRuntime;
    await pf.options?.({ baseUrl: base });
    return pf;
  } catch {
    failed = true;
    return null;
  }
}

export function initJournalSearch(): void {
  const w = window as unknown as { __journalSearch?: boolean };
  if (w.__journalSearch) return;
  w.__journalSearch = true;
  document.addEventListener('astro:page-load', setup);
}

function setup(): void {
  const feed = document.querySelector<HTMLElement>('[data-feed]');
  const input = document.querySelector<HTMLInputElement>('[data-search-input]');
  const panel = document.querySelector<HTMLElement>('[data-search-results]');
  if (!feed || !input || !panel) return;
  const noResults = panel.getAttribute('data-noresults') || 'No results';

  let timer: number | undefined;

  const showFeed = () => {
    feed.style.display = '';
    panel.style.display = 'none';
    panel.innerHTML = '';
  };

  const render = (items: PagefindResultData[]) => {
    feed.style.display = 'none';
    panel.style.display = '';
    panel.innerHTML = items.length
      ? items
          .map(
            (d) =>
              `<a href="${d.url}" data-search-result class="atl-row block border-t border-line py-4">` +
              `<span class="block font-display text-[17px] font-medium leading-[1.16] text-ink">${d.meta?.title ?? ''}</span>` +
              `<span class="atl-meta mt-1.5 block text-ink2" style="font-size:13px;line-height:1.5">${d.excerpt}</span>` +
              `</a>`,
          )
          .join('')
      : `<p class="atl-meta py-6 text-faint" style="font-size:12.5px">${noResults}</p>`;
  };

  const run = async (q: string) => {
    if (!q.trim()) { showFeed(); return; }
    const lib = await getPagefind();
    if (!lib) { render([]); return; }
    const search = await lib.search(q);
    const items = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));
    render(items);
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => run(input.value), 200);
  });

  showFeed();
}
