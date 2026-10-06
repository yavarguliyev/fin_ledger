import { PaginatedResponse } from '../http/paginated-response.interface';
import { Transaction } from '../../types/wallet/transaction.type';
import { WalletTransactionSummary } from './wallet-transaction-summary.interface';

export interface WalletOverview {
  summary: WalletTransactionSummary[];
  recent: PaginatedResponse<Transaction>;
}
