import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const registre = z.enum(['refl', 'design', 'impl']);

const articles = defineCollection({
  loader: glob({
    pattern: '*/index*.{md,mdx}',
    base: './src/content/articles',
    generateId: ({ entry }) =>
      entry.replace(/\/index\.en\.mdx?$/, '/en').replace(/\/index\.mdx?$/, ''),
  }),
  schema: ({ image }) => z.object({
    title: z.string().min(1),
    registre,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tags: z.array(z.string()).default([]),
    readingTime: z.number().int().positive(),
    live: z.boolean().default(false),
    series: reference('series').optional(),
    order: z.number().int().positive().optional(),
    repo: z.string().optional(),
    translationId: z.string().optional(),
    image: image().optional(),
    imageFocus: z.enum(['center', 'top', 'bottom']).default('center'),
    excerpt: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({
    pattern: '*/index*.{md,mdx}',
    base: './src/content/projects',
    generateId: ({ entry }) =>
      entry.replace(/\/index\.en\.mdx?$/, '/en').replace(/\/index\.mdx?$/, ''),
  }),
  schema: z.object({
    name: z.string().min(1),
    year: z.string(),
    role: z.string(),
    oneliner: z.string(),
    stack: z.array(z.string()).default([]),
    demo: z.boolean().default(false),
    relatedArticles: z.array(reference('articles')).default([]),
    translationId: z.string().optional(),
  }),
});

const series = defineCollection({
  loader: file('./src/content/series.json'),
  schema: z.object({ id: z.string(), title: z.string(), description: z.string() }),
});

export const collections = { articles, projects, series };
