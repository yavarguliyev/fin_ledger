import { StatCardHelper } from '../../../src/app/features/admin/helpers/stat-card.helper';
import { ADMIN_TABLE } from '../../../src/app/core/constants/admin/admin-table.constant';
import { DashboardStats } from '../../../src/app/core/interfaces/admin/dashboard-stats.interface';
import { ADMIN_STAT_CARDS_TEST as T } from '../../constants/admin-stat-cards.constant';

const stats: DashboardStats = {
  totalUsers: T.TOTAL_USERS,
  activeWallets: T.TOTAL_USERS,
  pending: 0,
  volumes: [
    { currency: T.EUR, amountMinor: T.EUR_MINOR },
    { currency: T.USD, amountMinor: T.USD_MINOR }
  ]
};

describe('Admin stat cards', () => {
  it('shows total volume per currency instead of one sum across currencies', () => {
    const volume = StatCardHelper.build({ stats })[T.VOLUME_INDEX];

    expect(volume?.label).toBe(ADMIN_TABLE.VOLUME_LABEL);
    expect(volume?.value).toContain(T.EUR_TEXT);
    expect(volume?.value).toContain(T.USD_TEXT);
    expect(volume?.value).not.toContain(T.JOINED_SUM_TEXT);
  });

  it('falls back to zero values before the stats arrive', () => {
    const cards = StatCardHelper.build({ stats: null });

    expect(cards.map(card => card.value)).toEqual([ADMIN_TABLE.ZERO_COUNT, ADMIN_TABLE.ZERO_COUNT, ADMIN_TABLE.ZERO_VOLUME, ADMIN_TABLE.ZERO_COUNT]);
  });
});
