import { LastSeenHelper } from '../../../src/app/features/support/helpers/last-seen.helper';
import { LAST_SEEN_SPEC } from '../../constants/last-seen.constant';

const agoBy = (ms: number): string => new Date(Date.now() - ms).toISOString();

describe('LastSeenHelper.label', () => {
  beforeEach(() => {
    const noon = new Date();
    noon.setHours(LAST_SEEN_SPEC.NOON_HOUR, 0, 0, 0);
    jest.useFakeTimers({ now: noon });
  });

  afterEach(() => jest.useRealTimers());

  it('says offline when nobody has ever been seen', () => {
    expect(LastSeenHelper.label({ iso: null })).toBe(LAST_SEEN_SPEC.OFFLINE);
  });

  it('treats the last couple of minutes as just now', () => {
    expect(LastSeenHelper.label({ iso: agoBy(LAST_SEEN_SPEC.MINUTE_MS) })).toBe(LAST_SEEN_SPEC.JUST_NOW);
  });

  it('counts minutes within the hour', () => {
    expect(LastSeenHelper.label({ iso: agoBy(LAST_SEEN_SPEC.MINUTE_MS * 20) })).toBe(`${LAST_SEEN_SPEC.PREFIX} 20m ago`);
  });

  it('switches to a clock time later the same day', () => {
    const label = LastSeenHelper.label({ iso: agoBy(LAST_SEEN_SPEC.HOUR_MS * 3) });

    expect(label.startsWith(`${LAST_SEEN_SPEC.PREFIX} at `)).toBe(true);
    expect(label).not.toContain('m ago');
  });

  it('shows a date once it is no longer today', () => {
    const label = LastSeenHelper.label({ iso: agoBy(LAST_SEEN_SPEC.DAY_MS * 3) });

    expect(label.startsWith(LAST_SEEN_SPEC.PREFIX)).toBe(true);
    expect(label).not.toContain(' at ');
  });
});
