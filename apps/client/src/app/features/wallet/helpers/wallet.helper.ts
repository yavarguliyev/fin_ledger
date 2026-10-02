import { FilterOption } from '../../../core/interfaces/ui/filter-option.interface';
import { DataTableConfig } from '../../../core/interfaces/ui/data-table-config.interface';
import { TableColumn } from '../../../core/interfaces/ui/table-column.interface';
import { Transaction } from '../../../core/types/wallet/transaction.type';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { TransactionHelper } from '../../../core/helpers/wallet/transaction.helper';
import { TABLE } from '../../../core/constants/ui/table.constant';
import { AMOUNT_CLASS } from '../../../core/constants/ui/amount-class.constant';
import { RECEIPT } from '../../../core/constants/payment/receipt.constant';

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
        format: ({ value, row }): string => CurrencyHelper.formatCurrency({ amountMinor: value as number, currency: row.currency }),
        badgeClass: ({ row }): string => (row.amountMinor < 0 ? AMOUNT_CLASS.NEGATIVE : AMOUNT_CLASS.POSITIVE)
      },
      {
        key: 'status',
        label: 'Status',
        type: 'badge',
        align: 'center',
        mobileVisible: true,
        badgeClass: ({ value }): string => TransactionHelper.statusClass(value as string)
      },
      {
        key: 'reference',
        label: 'Reference',
        type: 'text',
        align: 'center',
        mobileVisible: false,
        format: ({ value }): string => (value && typeof value === 'string' ? value : TABLE.EMPTY_CELL)
      },
      {
        key: RECEIPT.COLUMN_KEY,
        label: RECEIPT.SHORT_LABEL,
        type: 'custom',
        align: 'center',
        mobileVisible: false
      }
    ];
  }

  static transactionTable (): DataTableConfig<Transaction> {
    return {
      title: 'Transaction History',
      columns: WalletHelper.getWalletTableColumns(),
      showFilters: true,
      filterOptions: WalletHelper.getTransactionFilterOptions(),
      showExport: true,
      exportLabel: 'Export CSV',
      emptyMessage: 'No transactions'
    };
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
