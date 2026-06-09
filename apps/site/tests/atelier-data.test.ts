import { describe, it, expect } from 'vitest';
import { pieces, projects, fmtDate, allTags, relatedPieces } from '../src/data/atelier';

describe('atelier data', () => {
  it('every piece has a unique slug', () => {
    const slugs = pieces.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((s) => /^[a-z0-9-]+$/.test(s))).toBe(true);
  });
  it('every project relatedId resolves to a known piece', () => {
    const ids = new Set(pieces.map((p) => p.id));
    projects.forEach((pr) => pr.relatedIds.forEach((id) => expect(ids.has(id)).toBe(true)));
  });
});

describe('fmtDate', () => {
  it('formats FR day-first', () => { expect(fmtDate('2026-05-28', 'fr')).toBe('28 mai 2026'); });
  it('formats EN month-first', () => { expect(fmtDate('2026-05-28', 'en')).toBe('May 28, 2026'); });
});

describe('allTags', () => {
  it('returns sorted unique tags for a lang', () => {
    const tags = allTags('en');
    expect(tags).toEqual([...tags].sort((a, b) => a.localeCompare(b)));
    expect(new Set(tags).size).toBe(tags.length);
  });
});

describe('relatedPieces', () => {
  it('returns up to 2 pieces, excluding the source', () => {
    const src = pieces[0];
    const rel = relatedPieces(src, 'fr');
    expect(rel.length).toBeLessThanOrEqual(2);
    expect(rel.some((p) => p.id === src.id)).toBe(false);
  });
});
