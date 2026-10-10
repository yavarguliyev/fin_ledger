import { Transaction } from '../../../core/types/wallet/transaction.type';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { TransactionHelper } from '../../../core/helpers/wallet/transaction.helper';
import { WALLET_VIEW } from '../../../core/constants/wallet/wallet-view.constant';
import { TransactionDay } from '../../../core/interfaces/wallet/transaction-day.interface';
import { GroupTransactionsDto } from '../../../core/interfaces/wallet/group-transactions.interface';
import { FilterTransactionsDto } from '../../../core/interfaces/wallet/filter-transactions.interface';

export class WalletHelper {
  static filter ({ transactions, filter }: FilterTransactionsDto): Transaction[] {
    const types = WALLET_VIEW.FILTERS.find(option => option.id === filter)?.types ?? [];
    return types.length === 0 ? transactions : transactions.filter(tx => types.includes(tx.type));
  }

  static groupByDay ({ transactions }: GroupTransactionsDto): TransactionDay[] {
    const days = new Map<string, TransactionDay>();
    transactions.forEach(tx => {
      const key = new Date(tx.createdAt).toDateString();
      const day = days.get(key) ?? { key, date: tx.createdAt, items: [] };
      day.items.push(tx);
      days.set(key, day);
    });
    return [...days.values()];
  }

  static exportTransactionsToCsv (transactions: Transaction[]): void {
    const header = 'Date,Type,Amount,Status,Reference\n';
    const rows = transactions
      .map(
        t =>
          `${t.createdAt},${TransactionHelper.formatType(t.type)},${CurrencyHelper.fromMinor({ amountMinor: t.amountMinor, currency: t.currency })},${t.status},"${t.reference ?? ''}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }
}
