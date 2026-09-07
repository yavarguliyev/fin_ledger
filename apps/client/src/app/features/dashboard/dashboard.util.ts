import { TableColumn } from '../../core/models/data-table.model';
import { Transaction } from '../../core/models/wallet.model';
import { typeIcon, typeClass, formatType, statusClass } from '../../core/utils/transaction.util';
import { formatCurrency } from '../../core/utils/currency.util';

export const getDashboardTableColumns = (currency: string): TableColumn<Transaction>[] => {
  return [
    {
      key: 'type',
      label: 'Type',
      type: 'custom',
      align: 'center',
      mobileVisible: true
    },
    {
      key: 'reference',
      label: 'Reference',
      type: 'text',
      align: 'center',
      mobileVisible: false,
      format: (value: unknown): string => (value && typeof value === 'string' ? value : '—')
    },
    {
      key: 'createdAt',
      label: 'Date',
      type: 'date',
      align: 'center',
      mobileVisible: true
    },
    {
      key: 'amountMinor',
      label: 'Amount',
      type: 'currency',
      align: 'center',
      mobileVisible: true,
      format: (value: unknown): string => formatCurrency(value as number, currency),
      badgeClass: (_value: unknown, row: Transaction): string => (row.amountMinor < 0 ? 'text-danger font-semibold' : 'text-success font-semibold')
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      align: 'center',
      mobileVisible: true,
      badgeClass: (value: unknown) => statusClass(value as string)
    }
  ];
};

export { typeIcon, typeClass, formatType, statusClass };
