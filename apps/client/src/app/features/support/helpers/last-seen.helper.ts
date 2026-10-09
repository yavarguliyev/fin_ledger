import { LastSeenRefDto } from '../interfaces/last-seen-ref.interface';
import { LAST_SEEN } from '../constants/last-seen.constant';

export class LastSeenHelper {
  static label ({ iso }: LastSeenRefDto): string {
    if (!iso) return LAST_SEEN.OFFLINE;

    const seen = new Date(iso);
    const time = seen.toLocaleTimeString(undefined, LAST_SEEN.TIME_FORMAT);
    return [LAST_SEEN.PREFIX, LastSeenHelper.day({ iso }), LAST_SEEN.AT, time].join(LAST_SEEN.SEPARATOR);
  }

  private static day ({ iso }: LastSeenRefDto): string {
    const seen = new Date(iso ?? Date.now());
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (seen.toDateString() === today.toDateString()) return LAST_SEEN.TODAY;
    if (seen.toDateString() === yesterday.toDateString()) return LAST_SEEN.YESTERDAY;
    const format = seen.getFullYear() === today.getFullYear() ? LAST_SEEN.DATE_FORMAT : LAST_SEEN.DATE_WITH_YEAR_FORMAT;
    return seen.toLocaleDateString(undefined, format);
  }
}
