import { describe, it, expect } from 'vitest';
import { fmtDate, kindLabel, kindClass, copy } from '../src/lib/copy';

describe('fmtDate', () => {
  it('FR day-first', () => expect(fmtDate('2026-05-28', 'fr')).toBe('28 mai 2026'));
  it('EN month-first', () => expect(fmtDate('2026-05-28', 'en')).toBe('May 28, 2026'));
});
describe('kind maps', () => {
  it('labels FR', () => expect(kindLabel.fr.impl).toBe('Implémentation'));
  it('classes', () => expect(kindClass.design).toBe('kind-design'));
});

describe('call (booking) copy', () => {
  it('FR booking copy', () => {
    expect(copy.fr.call.kicker).toBe('Réserver un appel');
    expect(copy.fr.call.lede).toBe('Réservons un moment.');
    expect(copy.fr.call.intro).toBe(
      'Choisissez le créneau qui vous convient pour notre échange de 30 minutes.'
    );
  });
  it('EN booking copy keeps a typographic apostrophe', () => {
    expect(copy.en.call.kicker).toBe('Book a call');
    expect(copy.en.call.lede).toBe('Let’s find a moment.');
    expect(copy.en.call.lede).toContain('’'); // U+2019, not a straight quote
    expect(copy.en.call.intro).toBe(
      'Pick the slot that works for you for our 30-minute conversation.'
    );
  });
});
