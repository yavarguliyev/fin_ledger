import { DashboardHelper } from '../../../src/app/features/dashboard/helpers/dashboard.helper';
import { DASHBOARD_STATS } from '../../../src/app/features/dashboard/constants/dashboard-stats.constant';
import { DASHBOARD_GREETING } from '../../../src/app/features/dashboard/constants/dashboard-greeting.constant';
import { DASHBOARD_LIVE_NOW } from '../../../src/app/features/dashboard/constants/dashboard-live-now.constant';
import { GameEvent } from '../../../src/app/core/interfaces/betting/game-event.interface';
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


describe('DashboardHelper.greeting', () => {
  it('greets by the part of the day', () => {
    expect(DashboardHelper.greeting({ hour: 9, name: 'Player 1' })).toBe(`${DASHBOARD_GREETING.MORNING}, Player 1`);
    expect(DashboardHelper.greeting({ hour: 14, name: 'Player 1' })).toBe(`${DASHBOARD_GREETING.AFTERNOON}, Player 1`);
    expect(DashboardHelper.greeting({ hour: 22, name: undefined })).toBe(`${DASHBOARD_GREETING.EVENING}, ${DASHBOARD_GREETING.FALLBACK_NAME}`);
  });
});

describe('DashboardHelper.subtitle', () => {
  it('mentions winnings only when there are some', () => {
    expect(DashboardHelper.subtitle({ summary })).toBe(DASHBOARD_GREETING.QUIET);
    expect(DashboardHelper.subtitle({ summary: { ...summary, totalWinningsMinor: 193 } })).toContain(DASHBOARD_GREETING.WON_PREFIX);
  });
});

describe('DashboardHelper.liveNow', () => {
  it('lists live fixtures first, then scheduled ones, up to the limit', () => {
    const event = (id: string, status: GameEvent['status']): GameEvent => ({ id, label: id, odds: 2, status, createdAt: '', updatedAt: '' });
    const events = [event('a', 'SCHEDULED'), event('b', 'SETTLED'), event('c', 'LIVE'), event('d', 'SCHEDULED'), event('e', 'SCHEDULED')];

    expect(DashboardHelper.liveNow({ events }).map(entry => entry.id)).toEqual(['c', 'a', 'd'].slice(0, DASHBOARD_LIVE_NOW.LIMIT));
  });
});
