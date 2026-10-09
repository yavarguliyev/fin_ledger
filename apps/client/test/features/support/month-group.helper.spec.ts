import { MonthGroupHelper } from '../../../src/app/features/support/helpers/month-group.helper';
import { CHAT_FRESHNESS_TEST as T } from '../../constants/chat-freshness.constant';

describe('MonthGroupHelper', () => {
  it('labels this year by month and older items by month and year, keeping their order', () => {
    const items = [...T.THIS_YEAR_DATES, T.LAST_YEAR_DATE].map(createdAt => ({ createdAt }));

    const groups = MonthGroupHelper.group({ items, now: new Date(T.NOW) });

    expect(groups.map(group => group.label)).toEqual([T.OCTOBER, T.JULY, T.DECEMBER_LAST_YEAR]);
    expect(groups[0]?.items).toHaveLength(2);
  });
});
