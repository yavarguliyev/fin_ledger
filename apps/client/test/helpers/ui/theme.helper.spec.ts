import { THEME } from '../../../src/app/core/constants/ui/theme.constant';
import { ThemeHelper } from '../../../src/app/core/helpers/ui/theme.helper';

describe('ThemeHelper.initial', () => {
  it('starts in dark mode when the user has not chosen a theme', () => {
    expect(ThemeHelper.initial({ stored: null })).toBe(THEME.DARK);
  });

  it('keeps the theme the user chose', () => {
    expect(ThemeHelper.initial({ stored: THEME.LIGHT })).toBe(THEME.LIGHT);
    expect(ThemeHelper.initial({ stored: THEME.DARK })).toBe(THEME.DARK);
  });

  it('falls back to dark mode for an unknown stored value', () => {
    expect(ThemeHelper.initial({ stored: THEME.STORAGE_KEY })).toBe(THEME.DARK);
  });
});
