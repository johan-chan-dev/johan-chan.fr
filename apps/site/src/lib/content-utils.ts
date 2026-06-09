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
