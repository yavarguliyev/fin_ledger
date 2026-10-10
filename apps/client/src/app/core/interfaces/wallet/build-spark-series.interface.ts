import { Transaction } from '../../types/wallet/transaction.type';

export interface BuildSparkSeriesDto {
  transactions: Transaction[];
  now: Date;
}
