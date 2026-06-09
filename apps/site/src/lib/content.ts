import { getCollection, getEntry, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Article, Project, Series } from './content-utils';
import { byDateDesc } from './content-utils';
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
    slug: entry.id, title: d.title, registre: d.registre, date: d.date,
    tags: d.tags, readingTime: d.readingTime, live: d.live,
    series, order: d.order, repo: d.repo,
  };
}

function toProject(entry: ProjectEntry): Project {
  const d = entry.data;
  return {
    slug: entry.id, name: d.name, year: d.year, role: d.role, oneliner: d.oneliner,
    stack: d.stack, demo: d.demo, relatedArticles: d.relatedArticles.map((r) => r.id),
  };
}

export async function getArticles(): Promise<Article[]> {
  const entries = await getCollection('articles');
  return byDateDesc(await Promise.all(entries.map(toArticle)));
}

export async function getArticleEntry(slug: string) {
  const entry = await getEntry('articles', slug);
  if (!entry) throw new Error(`Article not found: ${slug}`);
  const [article, rendered] = await Promise.all([toArticle(entry), render(entry)]);
  return { article, Content: rendered.Content };
}

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).map(toProject);
}

export async function getProjectEntry(slug: string) {
  const entry = await getEntry('projects', slug);
  if (!entry) throw new Error(`Project not found: ${slug}`);
  const { Content } = await render(entry);
  return { project: toProject(entry), Content };
}

export async function getSeries(id: string): Promise<Series | undefined> {
  const entry = await getEntry('series', id);
  return entry?.data;
}
