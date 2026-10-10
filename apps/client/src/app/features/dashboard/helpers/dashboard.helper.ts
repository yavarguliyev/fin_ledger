import { StatCard } from '../../../core/interfaces/ui/stat-card.interface';
import { BuildStatCardsDto } from '../../../core/interfaces/wallet/build-stat-cards.interface';
import { GreetingDto } from '../../../core/interfaces/ui/greeting.interface';
import { DASHBOARD_GREETING } from '../constants/dashboard-greeting.constant';
import { DASHBOARD_STATS } from '../constants/dashboard-stats.constant';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { DASHBOARD_LIVE_NOW } from '../constants/dashboard-live-now.constant';
import { DashboardSubtitleDto } from '../../../core/interfaces/wallet/dashboard-subtitle.interface';
import { LiveNowDto } from '../../../core/interfaces/betting/live-now.interface';
import { GameEvent } from '../../../core/interfaces/betting/game-event.interface';

export class DashboardHelper {
  static buildStatCards ({ summary, series }: BuildStatCardsDto): StatCard[] {
    const { DEPOSITS, WITHDRAWALS, BETS, WINNINGS } = DASHBOARD_STATS;

    const money = (amountMinor: number): string => CurrencyHelper.formatCurrency({ amountMinor, currency: summary.currency });
    return [
      { label: DEPOSITS.LABEL, value: money(summary.totalDepositsMinor), icon: DEPOSITS.ICON, toneClass: DEPOSITS.TONE, sparkClass: DEPOSITS.SPARK, ...(series && { spark: series.deposits }) },
      { label: WITHDRAWALS.LABEL, value: money(summary.totalWithdrawalsMinor), icon: WITHDRAWALS.ICON, toneClass: WITHDRAWALS.TONE, sparkClass: WITHDRAWALS.SPARK, ...(series && { spark: series.withdrawals }) },
      { label: BETS.LABEL, value: String(summary.betsCount), icon: BETS.ICON, toneClass: BETS.TONE, sparkClass: BETS.SPARK, ...(series && { spark: series.bets }) },
      { label: WINNINGS.LABEL, value: money(summary.totalWinningsMinor), icon: WINNINGS.ICON, toneClass: WINNINGS.TONE, sparkClass: WINNINGS.SPARK, ...(series && { spark: series.winnings }) }
    ];
  }

  static greeting ({ hour, name }: GreetingDto): string {
    const { MORNING_FROM_HOUR, AFTERNOON_FROM_HOUR, EVENING_FROM_HOUR, MORNING, AFTERNOON, EVENING, FALLBACK_NAME } = DASHBOARD_GREETING;
    const part = hour >= MORNING_FROM_HOUR && hour < AFTERNOON_FROM_HOUR ? MORNING : hour >= AFTERNOON_FROM_HOUR && hour < EVENING_FROM_HOUR ? AFTERNOON : EVENING;
    return `${part}, ${name ?? FALLBACK_NAME}`;
  }

  static subtitle ({ summary }: DashboardSubtitleDto): string {
    const { QUIET, WON_PREFIX, WON_SUFFIX } = DASHBOARD_GREETING;
    if (!summary || summary.totalWinningsMinor <= 0) return QUIET;
    return `${WON_PREFIX}${CurrencyHelper.formatCurrency({ amountMinor: summary.totalWinningsMinor, currency: summary.currency })}${WON_SUFFIX}`;
  }

  static liveNow ({ events }: LiveNowDto): GameEvent[] {
    const { LIVE_STATUS, SCHEDULED_STATUS, LIMIT } = DASHBOARD_LIVE_NOW;
    const live = events.filter(event => event.status === LIVE_STATUS);
    const scheduled = events.filter(event => event.status === SCHEDULED_STATUS);
    return [...live, ...scheduled].slice(0, LIMIT);
  }
}
