import { LastSeenHelper } from '../../../src/app/features/support/helpers/last-seen.helper';
import { LAST_SEEN_SPEC as T } from '../../constants/last-seen.constant';

const agoBy = (ms: number): string => new Date(Date.now() - ms).toISOString();

describe('LastSeenHelper.label', () => {
  beforeEach(() => {
    const noon = new Date();
    noon.setHours(T.NOON_HOUR, 0, 0, 0);
    jest.useFakeTimers({ now: noon });
  });

  afterEach(() => jest.useRealTimers());

  it('says offline when nobody has ever been seen', () => {
    expect(LastSeenHelper.label({ iso: null })).toBe(T.OFFLINE);
  });

  it('gives the clock time even a minute ago, the way WhatsApp does', () => {
    const label = LastSeenHelper.label({ iso: agoBy(T.MINUTE_MS) });

    expect(label.startsWith(T.TODAY)).toBe(true);
    expect(label).toMatch(T.TIME);
  });

  it('says yesterday with the time', () => {
    const label = LastSeenHelper.label({ iso: agoBy(T.DAY_MS) });

    expect(label.startsWith(T.YESTERDAY)).toBe(true);
    expect(label).toMatch(T.TIME);
  });

  it('gives the date and the time for older visits', () => {
    const label = LastSeenHelper.label({ iso: agoBy(T.DAY_MS * 3) });

    expect(label.startsWith(T.PREFIX)).toBe(true);
    expect(label).not.toContain(T.YESTERDAY);
    expect(label).toContain(T.AT);
    expect(label).toMatch(T.TIME);
  });

  it('adds the year once the visit is from another year', () => {
    const seen = new Date();
    seen.setFullYear(seen.getFullYear() - T.YEARS_AGO);

    expect(LastSeenHelper.label({ iso: seen.toISOString() })).toContain(String(seen.getFullYear()));
  });
});
