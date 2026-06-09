import { describe, it, expect } from 'vitest';
import { byDateDesc, allTags, relatedArticles, articlesBySlugs, type Article } from '../src/lib/content-utils';

const A = (over: Partial<Article>): Article => ({
  slug: 'x', title: 't', registre: 'refl', date: '2026-01-01', tags: [], readingTime: 5, live: false, ...over,
});

describe('byDateDesc', () => {
  it('sorts newest first', () => {
    const r = byDateDesc([A({ slug: 'a', date: '2026-01-01' }), A({ slug: 'b', date: '2026-05-01' })]);
    expect(r.map((x) => x.slug)).toEqual(['b', 'a']);
  });
});
describe('allTags', () => {
  it('unique + sorted', () => {
    const r = allTags([A({ tags: ['Z', 'a'] }), A({ tags: ['a', 'M'] })]);
    expect(r).toEqual(['a', 'M', 'Z'].sort((x, y) => x.localeCompare(y)));
    expect(new Set(r).size).toBe(r.length);
  });
});
describe('relatedArticles', () => {
  it('≤2, excludes source, prefers shared tag', () => {
    const src = A({ slug: 's', tags: ['Cache'] });
    const all = [src, A({ slug: 'm', tags: ['Cache'] }), A({ slug: 'n', tags: ['Other'] }), A({ slug: 'o', tags: ['Other'] })];
    const r = relatedArticles(src, all);
    expect(r.length).toBe(2);
    expect(r.some((x) => x.slug === 's')).toBe(false);
    expect(r[0].slug).toBe('m');
  });
});
describe('articlesBySlugs', () => {
  it('resolves in given order, skips missing', () => {
    const all = [A({ slug: 'a' }), A({ slug: 'b' })];
    expect(articlesBySlugs(['b', 'zzz', 'a'], all).map((x) => x.slug)).toEqual(['b', 'a']);
  });
});
