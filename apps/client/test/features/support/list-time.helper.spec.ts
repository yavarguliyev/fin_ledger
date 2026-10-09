import { ListTimeHelper } from '../../../src/app/features/support/helpers/list-time.helper';
import { LIST_TIME_SPEC as T } from '../../constants/list-time.constant';

const agoBy = (ms: number): string => new Date(Date.now() - ms).toISOString();

describe('ListTimeHelper.label', () => {
  beforeEach(() => {
    const noon = new Date();
    noon.setHours(T.NOON_HOUR, 0, 0, 0);
    jest.useFakeTimers({ now: noon });
  });

  afterEach(() => jest.useRealTimers());

  it('shows only the clock time for today', () => {
    expect(ListTimeHelper.label({ iso: agoBy(T.HOUR_MS) })).toMatch(T.TIME);
  });

  it('says Yesterday for the day before', () => {
    expect(ListTimeHelper.label({ iso: agoBy(T.DAY_MS) })).toBe(T.YESTERDAY);
  });

  it('names the weekday within the last week', () => {
    const label = ListTimeHelper.label({ iso: agoBy(T.DAY_MS * T.THREE_DAYS) });

    expect(label).not.toMatch(T.TIME);
    expect(label).not.toMatch(T.DATE);
  });

  it('falls back to the full date for older chats', () => {
    expect(ListTimeHelper.label({ iso: agoBy(T.DAY_MS * T.TEN_DAYS) })).toMatch(T.DATE);
  });
});
