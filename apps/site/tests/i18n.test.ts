import { describe, it, expect } from 'vitest';
import { getLangFromUrl, useTranslations } from '../src/i18n/utils';

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
