import { SparkSeriesHelper } from '../../../src/app/features/dashboard/helpers/spark-series.helper';
import { DASHBOARD_SPARK } from '../../../src/app/features/dashboard/constants/dashboard-spark.constant';
import { Transaction } from '../../../src/app/core/types/wallet/transaction.type';

const NOW = new Date(2026, 9, 10, 12);
const tx = (type: Transaction['type'], amountMinor: number, daysAgo: number): Transaction => ({
  id: `${type}-${daysAgo}`,
  walletId: 'w',
  type,
  amountMinor,
  currency: 'USD',
  status: 'COMPLETED',
  reference: null,
  externalReference: null,
  balanceAfterMinor: null,
  idempotencyKey: null,
  ledgerTransactionId: null,
  createdAt: new Date(NOW.getTime() - daysAgo * DASHBOARD_SPARK.DAY_MS).toISOString()
});

describe('SparkSeriesHelper.build', () => {
  it('builds one running total per day for each tile', () => {
    const series = SparkSeriesHelper.build({ transactions: [tx('DEPOSIT', 500, 3), tx('DEPOSIT', 200, 0), tx('BET_STAKE', -100, 1)], now: NOW });

    expect(series.deposits).toHaveLength(DASHBOARD_SPARK.DAYS);
    expect(series.deposits.at(-1)).toBe(700);
    expect(series.deposits.at(-2)).toBe(500);
    expect(series.bets.at(-1)).toBe(1);
    expect(series.withdrawals.every(value => value === 0)).toBe(true);
  });

  it('ignores transactions older than the window', () => {
    const series = SparkSeriesHelper.build({ transactions: [tx('WITHDRAWAL', -300, DASHBOARD_SPARK.DAYS + 2)], now: NOW });

    expect(series.withdrawals.at(-1)).toBe(0);
  });
});
