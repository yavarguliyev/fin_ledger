import { StatCard } from '../../../core/interfaces/ui/stat-card.interface';
import { WalletTransactionSummary } from '../../../core/interfaces/wallet/wallet-transaction-summary.interface';
import { DASHBOARD_STATS } from '../constants/dashboard-stats.constant';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';

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

}
