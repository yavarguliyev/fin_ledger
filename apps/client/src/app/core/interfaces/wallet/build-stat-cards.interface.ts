import { WalletTransactionSummary } from './wallet-transaction-summary.interface';
import { SparkSeries } from './spark-series.interface';

export interface BuildStatCardsDto {
  summary: WalletTransactionSummary;
  series?: SparkSeries;
}
