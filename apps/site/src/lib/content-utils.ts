import type { ImageMetadata } from 'astro';

export type Registre = 'refl' | 'design' | 'impl';

export interface Article {
  slug: string;
  title: string;
  registre: Registre;
  date: string; // YYYY-MM-DD
  tags: string[];
  readingTime: number;
  live: boolean;
  series?: { id: string; title: string };
  order?: number;
  repo?: string;
  image?: ImageMetadata;
  imageFocus?: 'center' | 'top' | 'bottom';
  excerpt?: string;
}
export interface Project {
  slug: string;
  name: string;
  year: string;
  role: string;
  oneliner: string;
  stack: string[];
  demo: boolean;
  relatedArticles: string[]; // article slugs
}
export interface Series { id: string; title: string; description: string }

export function byDateDesc(articles: Article[]): Article[] {
  return articles.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function allTags(articles: Article[]): string[] {
  const s = new Set<string>();
  articles.forEach((a) => a.tags.forEach((t) => s.add(t)));
  return [...s].sort((a, b) => a.localeCompare(b));
}

export function relatedArticles(src: Article, all: Article[]): Article[] {
  let related = all.filter((a) => a.slug !== src.slug && (
    (src.series && a.series && a.series.id === src.series.id) ||
    a.tags.some((t) => src.tags.includes(t))
  ));
  if (related.length < 2) {
    const extra = all
      .filter((a) => a.slug !== src.slug && !related.includes(a))
      .sort((a) => (a.registre === src.registre ? -1 : 1));
    related = related.concat(extra);
  }
  return related.slice(0, 2);
}

export function articlesBySlugs(slugs: string[], all: Article[]): Article[] {
  return slugs.map((s) => all.find((a) => a.slug === s)).filter((a): a is Article => Boolean(a));
}

export const localeOf = (id: string): 'fr' | 'en' => (id.endsWith('/en') ? 'en' : 'fr');
export const slugOf = (id: string): string => id.replace(/\/en$/, '');

export interface SeriesIndexEntry {
  id: string;
  title: string;
  count: number;
  first: string; // earliest chapter date (YYYY-MM-DD)
  latest: string; // most recent chapter date
}

export function seriesChapters(seriesId: string, articles: Article[]): Article[] {
  return articles
    .filter((a) => a.series?.id === seriesId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function seriesIndex(articles: Article[]): SeriesIndexEntry[] {
  const map = new Map<string, SeriesIndexEntry>();
  for (const a of articles) {
    if (!a.series) continue;
    const e = map.get(a.series.id);
    if (!e) {
      map.set(a.series.id, { id: a.series.id, title: a.series.title, count: 1, first: a.date, latest: a.date });
    } else {
      e.count++;
      if (a.date < e.first) e.first = a.date;
      if (a.date > e.latest) e.latest = a.date;
    }
  }
  return [...map.values()].sort((x, y) => (x.latest < y.latest ? 1 : x.latest > y.latest ? -1 : 0));
}

export type FeedItem =
  | { kind: 'article'; date: string; article: Article }
  | { kind: 'series'; date: string; series: SeriesIndexEntry };

export interface FeedRow {
  item: FeedItem;
  year: number;
  firstOfYear: boolean;
}

// Temp render-list: every article (date-desc, as given) plus one series item
// injected immediately before that series' most-recent chapter.
export function journalFeed(articles: Article[]): FeedItem[] {
  const byId = new Map(seriesIndex(articles).map((e) => [e.id, e]));
  const seen = new Set<string>();
  const items: FeedItem[] = [];
  for (const a of articles) {
    if (a.series) {
      const entry = byId.get(a.series.id);
      if (entry && !seen.has(a.series.id)) {
        items.push({ kind: 'series', date: entry.latest, series: entry });
        seen.add(a.series.id);
      }
    }
    items.push({ kind: 'article', date: a.date, article: a });
  }
  return items;
}

export function groupByYear(items: FeedItem[]): FeedRow[] {
  let last: number | null = null;
  return items.map((item) => {
    const year = Number(item.date.slice(0, 4));
    const firstOfYear = year !== last;
    last = year;
    return { item, year, firstOfYear };
  });
}

export type LensState =
  | { lens: 'temps' }
  | { lens: 'reg'; value: Registre }
  | { lens: 'tag'; value: string };

export function parseLens(params: URLSearchParams): LensState {
  const reg = params.get('reg');
  if (reg === 'refl' || reg === 'design' || reg === 'impl') return { lens: 'reg', value: reg };
  const tag = params.get('tag');
  if (tag) return { lens: 'tag', value: tag };
  return { lens: 'temps' };
}

export function lensToParams(state: LensState): string {
  if (state.lens === 'reg') return `?reg=${state.value}`;
  if (state.lens === 'tag') return `?tag=${encodeURIComponent(state.value)}`;
  return '';
}
