import { DashboardHelper } from '../../../src/app/features/dashboard/helpers/dashboard.helper';
import { DASHBOARD_STATS } from '../../../src/app/features/dashboard/constants/dashboard-stats.constant';
import { WalletTransactionSummary } from '../../../src/app/core/interfaces/wallet/wallet-transaction-summary.interface';

const summary: WalletTransactionSummary = {
  currency: 'EUR',
  totalDepositsMinor: 50_000,
  totalWithdrawalsMinor: 100,
  totalWinningsMinor: 0,
  betsCount: 3
};

describe('DashboardHelper.buildStatCards', () => {
  it('builds one card per headline figure', () => {
    const cards = DashboardHelper.buildStatCards({ summary });

    expect(cards.map(card => card.label)).toEqual([
      DASHBOARD_STATS.DEPOSITS.LABEL,
      DASHBOARD_STATS.WITHDRAWALS.LABEL,
      DASHBOARD_STATS.BETS.LABEL,
      DASHBOARD_STATS.WINNINGS.LABEL
    ]);
  });

  it('formats money in the summary currency and leaves counts plain', () => {
    const [deposits, , bets] = DashboardHelper.buildStatCards({ summary });

    expect(deposits?.value).toContain('500');
    expect(bets?.value).toBe('3');
  });

  it('shows no trend badge, because the summary carries no period to compare against', () => {
    DashboardHelper.buildStatCards({ summary }).forEach(card => expect(card.trend).toBeUndefined());
  });
});
