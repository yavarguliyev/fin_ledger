import { BuildSparkSeriesDto } from '../../../core/interfaces/wallet/build-spark-series.interface';
import { SparkSeries } from '../../../core/interfaces/wallet/spark-series.interface';
import { DASHBOARD_SPARK } from '../constants/dashboard-spark.constant';

export class SparkSeriesHelper {
  static build ({ transactions, now }: BuildSparkSeriesDto): SparkSeries {
    const { DAYS, DAY_MS, TYPES } = DASHBOARD_SPARK;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const start = today - (DAYS - 1) * DAY_MS;
    const daily: SparkSeries = { deposits: [], withdrawals: [], bets: [], winnings: [] };
    (Object.keys(daily) as (keyof SparkSeries)[]).forEach(key => (daily[key] = Array.from({ length: DAYS }, () => 0)));

    transactions.forEach(tx => {
      const index = Math.floor((new Date(tx.createdAt).getTime() - start) / DAY_MS);
      if (index < 0 || index >= DAYS) return;

      const amount = Math.abs(tx.amountMinor);
      if (tx.type === TYPES.DEPOSIT) daily.deposits[index] = (daily.deposits[index] ?? 0) + amount;
      if (tx.type === TYPES.WITHDRAWAL) daily.withdrawals[index] = (daily.withdrawals[index] ?? 0) + amount;
      if (tx.type === TYPES.BET_STAKE) daily.bets[index] = (daily.bets[index] ?? 0) + 1;
      if (tx.type === TYPES.BET_PAYOUT) daily.winnings[index] = (daily.winnings[index] ?? 0) + amount;
    });

    return {
      deposits: SparkSeriesHelper.cumulative(daily.deposits),
      withdrawals: SparkSeriesHelper.cumulative(daily.withdrawals),
      bets: SparkSeriesHelper.cumulative(daily.bets),
      winnings: SparkSeriesHelper.cumulative(daily.winnings)
    };
  }

  private static cumulative (values: number[]): number[] {
    let total = 0;
    return values.map(value => (total += value));
  }
}
