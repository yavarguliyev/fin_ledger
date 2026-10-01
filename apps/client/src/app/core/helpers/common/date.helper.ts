import { DATE_FORMATS } from '../../constants/common/date-formats.constant';

export class DateHelper {
  static formatDateTime (date: string | Date | null | undefined): string {
    const parsed = DateHelper.parse(date);
    return parsed
      ? parsed.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : DATE_FORMATS.EMPTY;
  }

  static formatDate (date: string | Date | null | undefined): string {
    const parsed = DateHelper.parse(date);
    return parsed ? parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : DATE_FORMATS.EMPTY;
  }

  static formatRelative (date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return then.toLocaleDateString();
  }

  private static parse (date: string | Date | null | undefined): Date | null {
    if (!date) return null;
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
