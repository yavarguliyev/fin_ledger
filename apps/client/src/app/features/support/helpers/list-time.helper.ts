import { LastSeenRefDto } from '../interfaces/last-seen-ref.interface';
import { LIST_TIME } from '../constants/list-time.constant';

export class ListTimeHelper {
  static label ({ iso }: LastSeenRefDto): string {
    if (!iso) return '';

    const when = new Date(iso);
    const days = ListTimeHelper.daysAgo({ iso });
    if (days === 0) return when.toLocaleTimeString(undefined, LIST_TIME.TIME_FORMAT);
    if (days === 1) return LIST_TIME.YESTERDAY;
    if (days < LIST_TIME.WEEK_DAYS) return when.toLocaleDateString(undefined, LIST_TIME.WEEKDAY_FORMAT);
    return when.toLocaleDateString(undefined, LIST_TIME.DATE_FORMAT);
  }

  private static daysAgo ({ iso }: LastSeenRefDto): number {
    const day = new Date(iso ?? Date.now());
    day.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((today.getTime() - day.getTime()) / LIST_TIME.DAY_MS);
  }
}
