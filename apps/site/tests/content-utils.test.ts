import { describe, it, expect } from 'vitest';
import { byDateDesc, allTags, relatedArticles, articlesBySlugs, localeOf, slugOf, seriesChapters, seriesIndex, journalFeed, groupByYear, parseLens, lensToParams, type Article } from '../src/lib/content-utils';

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

describe('localeOf / slugOf', () => {
  it('FR id → fr + same slug', () => {
    expect(localeOf('editeur-wasm')).toBe('fr');
    expect(slugOf('editeur-wasm')).toBe('editeur-wasm');
  });
  it('EN id → en + stripped slug', () => {
    expect(localeOf('editeur-wasm/en')).toBe('en');
    expect(slugOf('editeur-wasm/en')).toBe('editeur-wasm');
  });
});

describe('seriesChapters', () => {
  it('returns only the series members, ordered by order asc', () => {
    const all = [
      A({ slug: 'b', series: { id: 's', title: 'S' }, order: 2 }),
      A({ slug: 'a', series: { id: 's', title: 'S' }, order: 1 }),
      A({ slug: 'x' }),
      A({ slug: 'c', series: { id: 's', title: 'S' }, order: 3 }),
    ];
    expect(seriesChapters('s', all).map((c) => c.slug)).toEqual(['a', 'b', 'c']);
  });
});

describe('seriesIndex', () => {
  it('groups by series with count + date range, latest series first', () => {
    const all = [
      A({ slug: 'a', series: { id: 's1', title: 'One' }, order: 1, date: '2026-01-01' }),
      A({ slug: 'b', series: { id: 's1', title: 'One' }, order: 2, date: '2026-03-01' }),
      A({ slug: 'c', series: { id: 's2', title: 'Two' }, order: 1, date: '2026-02-01' }),
      A({ slug: 'd' }),
    ];
    const idx = seriesIndex(all);
    expect(idx.map((e) => e.id)).toEqual(['s1', 's2']);
    expect(idx[0]).toMatchObject({ id: 's1', title: 'One', count: 2, first: '2026-01-01', latest: '2026-03-01' });
  });
});

describe('journalFeed', () => {
  it('injects a series item right before the series most-recent chapter, keeps standalones', () => {
    const all = [
      A({ slug: 'standalone-new', date: '2026-05-01' }),
      A({ slug: 'ch2', series: { id: 's', title: 'S' }, order: 2, date: '2026-04-01' }),
      A({ slug: 'ch1', series: { id: 's', title: 'S' }, order: 1, date: '2026-02-01' }),
      A({ slug: 'standalone-old', date: '2026-01-01' }),
    ];
    const items = journalFeed(all);
    const kinds = items.map((i) => (i.kind === 'series' ? `series:${i.series.id}` : `art:${i.article.slug}`));
    expect(kinds).toEqual(['art:standalone-new', 'series:s', 'art:ch2', 'art:ch1', 'art:standalone-old']);
    const s = items.find((i) => i.kind === 'series');
    expect(s && s.kind === 'series' && s.series.latest).toBe('2026-04-01');
  });
});

describe('groupByYear', () => {
  it('flags the first item of each year', () => {
    const all = [
      A({ slug: 'a', date: '2026-05-01' }),
      A({ slug: 'b', date: '2026-02-01' }),
      A({ slug: 'c', date: '2025-11-01' }),
    ];
    const rows = groupByYear(journalFeed(all));
    expect(rows.map((r) => [r.year, r.firstOfYear])).toEqual([[2026, true], [2026, false], [2025, true]]);
  });
});

describe('parseLens / lensToParams', () => {
  it('defaults to temps when no params', () => {
    expect(parseLens(new URLSearchParams(''))).toEqual({ lens: 'temps' });
    expect(lensToParams({ lens: 'temps' })).toBe('');
  });
  it('reads/writes a register', () => {
    expect(parseLens(new URLSearchParams('reg=refl'))).toEqual({ lens: 'reg', value: 'refl' });
    expect(lensToParams({ lens: 'reg', value: 'design' })).toBe('?reg=design');
  });
  it('reads/writes a tag (url-encoded)', () => {
    expect(parseLens(new URLSearchParams('tag=craft'))).toEqual({ lens: 'tag', value: 'craft' });
    expect(lensToParams({ lens: 'tag', value: 'craft' })).toBe('?tag=craft');
  });
  it('ignores an invalid register', () => {
    expect(parseLens(new URLSearchParams('reg=bogus'))).toEqual({ lens: 'temps' });
  });
});
