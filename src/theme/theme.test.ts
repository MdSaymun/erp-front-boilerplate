import { describe, expect, it } from 'vitest';

import { buildTheme, resolveBrandColor } from '@/theme/theme';

describe('theme branding', () => {
  it('applies a valid tenant colour and ignores unsafe values', () => {
    expect(resolveBrandColor({ primaryColor: '#ff6600' })).toBe('#ff6600');
    expect(resolveBrandColor({ primaryColor: 'red' })).toBeUndefined();
    expect(resolveBrandColor({ primaryColor: 'url(javascript:alert(1))' })).toBeUndefined();

    expect(buildTheme('light', { primaryColor: '#ff6600' }).token?.colorPrimary).toBe('#ff6600');
    expect(buildTheme('dark').token?.colorPrimary).toBe('#1d5fb4');
  });
});
