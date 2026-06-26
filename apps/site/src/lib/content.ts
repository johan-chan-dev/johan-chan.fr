import { getCollection, getEntry, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { Article, Project, Series } from './content-utils';

const seriesCovers = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/series/*.{webp,png,jpg,jpeg}',
  { eager: true },
);
function seriesCover(id: string): ImageMetadata | undefined {
  const hit = Object.entries(seriesCovers).find(
    ([p]) => p.split('/').pop()?.replace(/\.[^.]+$/, '') === id,
  );
  return hit?.[1].default;
}
import type { SeriesIndexEntry } from './content-utils';
import { byDateDesc, localeOf, slugOf, seriesChapters, seriesIndex } from './content-utils';
import type { Lang } from '../i18n/ui';
export type { Article, Project, Series } from './content-utils';

type ArticleEntry = CollectionEntry<'articles'>;
type ProjectEntry = CollectionEntry<'projects'>;

async function toArticle(entry: ArticleEntry): Promise<Article> {
  const d = entry.data;
  let series: Article['series'];
  if (d.series) {
    const s = await getEntry(d.series);
    if (s) series = { id: s.data.id, title: s.data.title };
  }
  return {
    slug: slugOf(entry.id), title: d.title, registre: d.registre, date: d.date,
    tags: d.tags, readingTime: d.readingTime, live: d.live,
    series, order: d.order, repo: d.repo,
    image: d.image, imageFocus: d.imageFocus, excerpt: d.excerpt,
  };
}

function toProject(entry: ProjectEntry): Project {
  const d = entry.data;
  return {
    slug: slugOf(entry.id), name: d.name, year: d.year, role: d.role, oneliner: d.oneliner,
    stack: d.stack, demo: d.demo, relatedArticles: d.relatedArticles.map((r) => r.id),
    image: d.image,
    imageFocus: d.imageFocus,
  };
}

export async function getArticles(lang: Lang): Promise<Article[]> {
  // `draft` is a publish gate: drafts stay visible in dev (so they can be reviewed)
  // but are excluded from the production build — no feed entry, no list, no prerendered page.
  const entries = (await getCollection('articles')).filter(
    (e) => localeOf(e.id) === lang && (import.meta.env.DEV || !e.data.draft),
  );
  return byDateDesc(await Promise.all(entries.map(toArticle)));
}

export async function getArticleEntry(slug: string, lang: Lang) {
  const entry = await getEntry('articles', lang === 'en' ? `${slug}/en` : slug);
  if (!entry) throw new Error(`Article not found: ${slug} (${lang})`);
  const [article, rendered] = await Promise.all([toArticle(entry), render(entry)]);
  return { article, Content: rendered.Content };
}

export async function getProjects(lang: Lang): Promise<Project[]> {
  return (await getCollection('projects')).filter((e) => localeOf(e.id) === lang).map(toProject);
}

export async function getProjectEntry(slug: string, lang: Lang) {
  const entry = await getEntry('projects', lang === 'en' ? `${slug}/en` : slug);
  if (!entry) throw new Error(`Project not found: ${slug} (${lang})`);
  const { Content } = await render(entry);
  return { project: toProject(entry), Content };
}

export async function getSeries(id: string): Promise<Series | undefined> {
  const entry = await getEntry('series', id);
  return entry?.data;
}

export async function hasTranslation(slug: string, lang: Lang, collection: 'articles' | 'projects'): Promise<boolean> {
  const otherId = lang === 'fr' ? `${slug}/en` : slug;
  return Boolean(await getEntry(collection, otherId));
}

export interface SeriesCard extends SeriesIndexEntry {
  description: string;
}

export async function getSeriesList(lang: Lang): Promise<SeriesCard[]> {
  const articles = await getArticles(lang);
  const entries = seriesIndex(articles);
  return Promise.all(
    entries.map(async (e) => {
      const meta = await getSeries(e.id);
      return { ...e, description: meta?.description ?? '' };
    }),
  );
}

export async function getSeriesEntry(slug: string, lang: Lang) {
  const meta = await getSeries(slug);
  const chapters = seriesChapters(slug, await getArticles(lang));
  if (!meta || chapters.length === 0) throw new Error(`Series not found: ${slug} (${lang})`);
  return { series: meta, chapters, cover: seriesCover(slug) };
}
