import { TableColumn } from '../../../core/interfaces/ui/table-column.interface';
import { Transaction } from '../../../core/interfaces/wallet/transaction.interface';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { TransactionHelper } from '../../../core/helpers/wallet/transaction.helper';

export class DashboardHelper {
  static getDashboardTableColumns (currency: string): TableColumn<Transaction>[] {
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
        format: (value: unknown): string => CurrencyHelper.formatCurrency(value as number, currency),
        badgeClass: (_value: unknown, row: Transaction): string => (row.amountMinor < 0 ? 'text-danger font-semibold' : 'text-success font-semibold')
      },
      {
        key: 'status',
        label: 'Status',
        type: 'badge',
        align: 'center',
        mobileVisible: true,
        badgeClass: (value: unknown) => TransactionHelper.statusClass(value as string)
      }
    ];
  }
}
