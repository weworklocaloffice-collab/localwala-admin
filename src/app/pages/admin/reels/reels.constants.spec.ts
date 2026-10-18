import { REEL_TARGETS_BY_VERTICAL, REEL_VERTICALS, isTargetAllowed, suggestReelCta } from './reels.constants';

describe('reels.constants (mirrors backend docs §16)', () => {
  it('suggests the documented CTA for every vertical+target pairing', () => {
    expect(suggestReelCta('FOOD', 'PRODUCT')).toBe('ORDER NOW');
    expect(suggestReelCta('FOOD', 'RESTAURANT')).toBe('ORDER NOW');
    expect(suggestReelCta('DAIRY', 'PRODUCT')).toBe('SUBSCRIBE');
    expect(suggestReelCta('SERVICES', 'SERVICE')).toBe('BOOK NOW');
    expect(suggestReelCta('SERVICES', 'VENDOR')).toBe('BOOK NOW');
    expect(suggestReelCta('REAL_ESTATE', 'PROPERTY')).toBe('VIEW PROPERTY');
  });

  it('falls back for unknown pairings', () => {
    expect(suggestReelCta('FOOD', 'PROPERTY')).toBe('VIEW MORE');
  });

  it('every vertical allows at least one target', () => {
    for (const vertical of REEL_VERTICALS) {
      expect(REEL_TARGETS_BY_VERTICAL[vertical].length).toBeGreaterThan(0);
    }
  });

  it('rejects cross-vertical pairings the backend would 400', () => {
    expect(isTargetAllowed('FOOD', 'PROPERTY')).toBe(false);
    expect(isTargetAllowed('REAL_ESTATE', 'PRODUCT')).toBe(false);
    expect(isTargetAllowed('DAIRY', 'PRODUCT')).toBe(true);
  });
});
