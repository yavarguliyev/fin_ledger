import { StatCard } from '../../../core/interfaces/ui/stat-card.interface';
import { TableColumn } from '../../../core/interfaces/ui/table-column.interface';
import { WalletTransactionSummary } from '../../../core/interfaces/wallet/wallet-transaction-summary.interface';
import { DASHBOARD_STATS } from '../constants/dashboard-stats.constant';
import { Transaction } from '../../../core/types/wallet/transaction.type';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { TransactionHelper } from '../../../core/helpers/wallet/transaction.helper';
import { TABLE } from '../../../core/constants/ui/table.constant';
import { AMOUNT_CLASS } from '../../../core/constants/ui/amount-class.constant';

export class DashboardHelper {
  static buildStatCards ({ summary }: { summary: WalletTransactionSummary }): StatCard[] {
    const { DEPOSITS, WITHDRAWALS, BETS, WINNINGS } = DASHBOARD_STATS;

    const money = (amountMinor: number): string => CurrencyHelper.formatCurrency({ amountMinor, currency: summary.currency });
    return [
      { label: DEPOSITS.LABEL, value: money(summary.totalDepositsMinor), icon: DEPOSITS.ICON, toneClass: DEPOSITS.TONE },
      { label: WITHDRAWALS.LABEL, value: money(summary.totalWithdrawalsMinor), icon: WITHDRAWALS.ICON, toneClass: WITHDRAWALS.TONE },
      { label: BETS.LABEL, value: String(summary.betsCount), icon: BETS.ICON, toneClass: BETS.TONE },
      { label: WINNINGS.LABEL, value: money(summary.totalWinningsMinor), icon: WINNINGS.ICON, toneClass: WINNINGS.TONE }
    ];
  }

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
        format: ({ value }): string => (value && typeof value === 'string' ? value : TABLE.EMPTY_CELL)
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
        format: ({ value }): string => CurrencyHelper.formatCurrency({ amountMinor: value as number, currency }),
        badgeClass: ({ row }): string => (row.amountMinor < 0 ? AMOUNT_CLASS.NEGATIVE : AMOUNT_CLASS.POSITIVE)
      },
      {
        key: 'status',
        label: 'Status',
        type: 'badge',
        align: 'center',
        mobileVisible: true,
        badgeClass: ({ value }): string => TransactionHelper.statusClass(value as string)
      }
    ];
  }
}
