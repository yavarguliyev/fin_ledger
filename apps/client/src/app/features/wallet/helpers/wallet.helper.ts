import { FilterOption } from '../../../core/interfaces/ui/filter-option.interface';
import { TableColumn } from '../../../core/interfaces/ui/table-column.interface';
import { Transaction } from '../../../core/interfaces/wallet/transaction.interface';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { TransactionHelper } from '../../../core/helpers/wallet/transaction.helper';

export class WalletHelper {
  static getWalletTableColumns (): TableColumn<Transaction>[] {
    return [
      {
        key: 'createdAt',
        label: 'Date',
        type: 'date',
        align: 'center',
        mobileVisible: false
      },
      {
        key: 'type',
        label: 'Type',
        type: 'custom',
        align: 'center',
        mobileVisible: true
      },
      {
        key: 'amountMinor',
        label: 'Amount',
        type: 'currency',
        align: 'center',
        mobileVisible: true,
        format: (value: unknown, row: Transaction): string => CurrencyHelper.formatCurrency(value as number, row.currency),
        badgeClass: (_value: unknown, row: Transaction): string => (row.amountMinor < 0 ? 'text-danger font-semibold' : 'text-success font-semibold')
      },
      {
        key: 'status',
        label: 'Status',
        type: 'badge',
        align: 'center',
        mobileVisible: true,
        badgeClass: (value: unknown) => TransactionHelper.statusClass(value as string)
      },
      {
        key: 'reference',
        label: 'Reference',
        type: 'text',
        align: 'center',
        mobileVisible: false,
        format: (value: unknown): string => (value && typeof value === 'string' ? value : '—')
      }
    ];
  }

  static getTransactionFilterOptions (): FilterOption[] {
    return [
      { label: 'All types', value: 'ALL' },
      { label: 'Deposit', value: 'DEPOSIT' },
      { label: 'Withdrawal', value: 'WITHDRAWAL' },
      { label: 'Bet', value: 'BET' },
      { label: 'Winning', value: 'WINNING' }
    ];
  }

  static exportTransactionsToCsv (transactions: Transaction[]): void {
    const header = 'Date,Type,Amount,Status,Reference\n';
    const rows = transactions.map(t => `${t.createdAt},${TransactionHelper.formatType(t.type)},${CurrencyHelper.fromMinor(t.amountMinor, t.currency)},${t.status},"${t.reference ?? ''}"`).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }
}
