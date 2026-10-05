import { ReferenceHelper } from '../../../core/helpers/common/reference.helper';
import { TableColumn } from '../../../core/interfaces/ui/table-column.interface';
import { LedgerEntry } from '../../../core/interfaces/ledger/ledger-entry.interface';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { LEDGER_TABLE } from '../../../core/constants/ui/ledger-table.constant';

export class LedgerHelper {
  static getLedgerTableColumns (): TableColumn<LedgerEntry>[] {
    return [
      {
        key: 'transactionId',
        label: 'Transaction ID',
        type: 'text',
        align: 'center',
        mobileVisible: false,
        cellClass: 'font-mono text-xs',
        format: ({ value }): string => ReferenceHelper.short({ reference: value })
      },
      {
        key: 'entryType',
        label: 'Entry Type',
        type: 'badge',
        align: 'center',
        mobileVisible: true,
        badgeClass: ({ value }): string => (value === LEDGER_TABLE.DEBIT ? LEDGER_TABLE.DEBIT_CLASS : LEDGER_TABLE.CREDIT_CLASS)
      },
      {
        key: 'amountMinor',
        label: 'Amount',
        type: 'currency',
        align: 'center',
        mobileVisible: true,
        format: ({ value, row }): string => CurrencyHelper.formatCurrency({ amountMinor: value as number, currency: row.currency })
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        align: 'center',
        mobileVisible: true,
        format: ({ value }): string => ReferenceHelper.short({ reference: value })
      },
      {
        key: 'reference',
        label: 'Reference',
        type: 'text',
        align: 'center',
        mobileVisible: false,
        format: ({ value }): string => ReferenceHelper.short({ reference: value })
      },
      { key: 'createdAt', label: 'Date', type: 'date', align: 'center', mobileVisible: true }
    ];
  }
}
