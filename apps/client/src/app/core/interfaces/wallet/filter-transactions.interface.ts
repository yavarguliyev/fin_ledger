import { Transaction } from '../../types/wallet/transaction.type';

export interface FilterTransactionsDto {
  transactions: Transaction[];
  filter: string;
}
