import { describe, it, expect } from 'vitest';
import { fmtDate, kindLabel, kindClass } from '../src/lib/copy';

describe('fmtDate', () => {
  it('FR day-first', () => expect(fmtDate('2026-05-28', 'fr')).toBe('28 mai 2026'));
  it('EN month-first', () => expect(fmtDate('2026-05-28', 'en')).toBe('May 28, 2026'));
});
describe('kind maps', () => {
  it('labels FR', () => expect(kindLabel.fr.impl).toBe('Implémentation'));
  it('classes', () => expect(kindClass.design).toBe('kind-design'));
});
