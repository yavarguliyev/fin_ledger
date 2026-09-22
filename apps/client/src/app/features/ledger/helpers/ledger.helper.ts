import { TableColumn } from '../../../core/interfaces/ui/table-column.interface';
import { LedgerEntry } from '../../../core/interfaces/ledger/ledger-entry.interface';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';

export class LedgerHelper {
  static getLedgerTableColumns (): TableColumn<LedgerEntry>[] {
    return [
      {
        key: 'transactionId',
        label: 'Transaction ID',
        type: 'text',
        align: 'center',
        mobileVisible: false,
        cellClass: 'font-mono text-xs truncate max-w-[120px]'
      },
      {
        key: 'entryType',
        label: 'Entry Type',
        type: 'badge',
        align: 'center',
        mobileVisible: true,
        badgeClass: (value: unknown): string => (value === 'DEBIT' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success')
      },
      {
        key: 'amountMinor',
        label: 'Amount',
        type: 'currency',
        align: 'center',
        mobileVisible: true,
        format: (value: unknown, row: LedgerEntry): string => CurrencyHelper.formatCurrency(value as number, row.currency)
      },
      { key: 'description', label: 'Description', type: 'text', align: 'center', mobileVisible: true },
      {
        key: 'reference',
        label: 'Reference',
        type: 'text',
        align: 'center',
        mobileVisible: false,
        format: (value: unknown): string => (value && typeof value === 'string' ? value : '—')
      },
      { key: 'createdAt', label: 'Date', type: 'date', align: 'center', mobileVisible: true }
    ];
  }
}
