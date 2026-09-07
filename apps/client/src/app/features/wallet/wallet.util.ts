import { TableColumn, FilterOption } from '../../core/models/data-table.model';
import { Transaction } from '../../core/models/wallet.model';
import { formatType, statusClass } from '../../core/utils/transaction.util';
import { formatCurrency } from '../../core/utils/currency.util';

export const getWalletTableColumns = (): TableColumn<Transaction>[] => {
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
      format: (value: unknown, row: Transaction): string => formatCurrency(value as number, row.currency),
      badgeClass: (_value: unknown, row: Transaction): string => (row.amountMinor < 0 ? 'text-danger font-semibold' : 'text-success font-semibold')
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      align: 'center',
      mobileVisible: true,
      badgeClass: (value: unknown) => statusClass(value as string)
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
};

export const getTransactionFilterOptions = (): FilterOption[] => {
  return [
    { label: 'All types', value: 'ALL' },
    { label: 'Deposit', value: 'DEPOSIT' },
    { label: 'Withdrawal', value: 'WITHDRAWAL' },
    { label: 'Bet', value: 'BET' },
    { label: 'Winning', value: 'WINNING' },
    { label: 'Conversion In', value: 'CONVERSION_IN' },
    { label: 'Conversion Out', value: 'CONVERSION_OUT' }
  ];
};

export const exportTransactionsToCsv = (transactions: Transaction[]): void => {
  const header = 'Date,Type,Amount,Status,Reference\n';
  const rows = transactions.map(t => `${t.createdAt},${formatType(t.type)},${t.amountMinor / 100},${t.status},"${t.reference ?? ''}"`).join('\n');

  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();

  URL.revokeObjectURL(url);
};
