import { LastSeenRefDto } from '../dtos/last-seen-ref.dto';
import { SUPPORT_VIEW } from '../constants/support-view.constant';

export class LastSeenHelper {
  static label ({ iso }: LastSeenRefDto): string {
    if (!iso) return SUPPORT_VIEW.OFFLINE_LABEL;

    const seen = new Date(iso);
    const minutes = Math.floor((Date.now() - seen.getTime()) / SUPPORT_VIEW.MINUTE_MS);

    if (minutes < SUPPORT_VIEW.JUST_NOW_MINUTES) return SUPPORT_VIEW.JUST_NOW;
    if (minutes < SUPPORT_VIEW.MINUTES_PER_HOUR) return `${SUPPORT_VIEW.LAST_SEEN_PREFIX} ${minutes}m ago`;

    const isToday = seen.toDateString() === new Date().toDateString();
    const when = isToday
      ? seen.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      : seen.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

    return `${SUPPORT_VIEW.LAST_SEEN_PREFIX} ${isToday ? SUPPORT_VIEW.TODAY_AT : ''}${when}`.replace(/\s+/g, ' ');
  }
}
