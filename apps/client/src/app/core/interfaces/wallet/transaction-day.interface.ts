import { Transaction } from '../../types/wallet/transaction.type';

export interface TransactionDay {
  key: string;
  date: string;
  items: Transaction[];
}
