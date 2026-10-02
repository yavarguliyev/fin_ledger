import { StalenessHelper } from '../../../src/app/features/support/helpers/staleness.helper';
import { STALENESS_TEST as T } from '../../constants/staleness.constant';

describe('StalenessHelper', () => {
  it('keeps data refreshed within the window', () => {
    expect(StalenessHelper.isStale({ lastAt: T.NOW - T.MAX_AGE_MS + T.JUST_UNDER_MS, now: T.NOW, maxAgeMs: T.MAX_AGE_MS })).toBe(false);
  });

  it('treats data as stale once the window has passed', () => {
    expect(StalenessHelper.isStale({ lastAt: T.NOW - T.MAX_AGE_MS, now: T.NOW, maxAgeMs: T.MAX_AGE_MS })).toBe(true);
  });
});
