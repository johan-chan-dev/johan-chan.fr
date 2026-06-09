import { describe, it, expect } from 'vitest';
import { getLangFromUrl, useTranslations, getSiblingLocalePath } from '../src/i18n/utils';

describe('useTranslations', () => {
  it('returns the FR string for a known key', () => {
    expect(useTranslations('fr')('nav.about')).toBe('À propos');
  });
  it('falls back to the default lang (FR) when a key is missing in EN', () => {
    expect(useTranslations('en')('site.tagline')).toBe("Ce que je pense. Ce que j’apprends.");
  });
});

describe('getLangFromUrl', () => {
  it('detects "en" from an /en/ path', () => {
    expect(getLangFromUrl(new URL('http://x/en/about'))).toBe('en');
  });
  it('defaults to "fr" for an unprefixed path', () => {
    expect(getLangFromUrl(new URL('http://x/about'))).toBe('fr');
  });
});

describe('getSiblingLocalePath', () => {
  it('FR root → EN root', () => { expect(getSiblingLocalePath(new URL('http://x/'), 'en')).toBe('/en/'); });
  it('EN root → FR root', () => { expect(getSiblingLocalePath(new URL('http://x/en/'), 'fr')).toBe('/'); });
  it('FR subpath → EN subpath', () => { expect(getSiblingLocalePath(new URL('http://x/journal'), 'en')).toBe('/en/journal'); });
  it('EN subpath → FR subpath', () => { expect(getSiblingLocalePath(new URL('http://x/en/journal'), 'fr')).toBe('/journal'); });
  it('FR → FR is identity', () => { expect(getSiblingLocalePath(new URL('http://x/about'), 'fr')).toBe('/about'); });
});
