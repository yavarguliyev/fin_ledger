import { DATE_PICKER } from '../../constants/ui/date-picker.constant';
import { CalendarDateDto } from '../../dtos/ui/calendar-date.dto';
import { CalendarIsoDto } from '../../dtos/ui/calendar-iso.dto';
import { CalendarMonthDto } from '../../dtos/ui/calendar-month.dto';
import { CalendarRangeDto } from '../../dtos/ui/calendar-range.dto';
import { CalendarShiftDto } from '../../dtos/ui/calendar-shift.dto';
import { YearsAgoDto } from '../../dtos/ui/years-ago.dto';

export class CalendarHelper {
  static parse ({ iso }: CalendarIsoDto): CalendarDateDto | null {
    if (!DATE_PICKER.ISO_PATTERN.test(iso)) return null;
    const [year = 0, month = 0, day = 0] = iso.split(DATE_PICKER.SEPARATOR).map(Number);
    return day >= 1 && day <= CalendarHelper.daysInMonth({ year, month }) ? { year, month, day } : null;
  }

  static toIso ({ year, month, day }: CalendarDateDto): string {
    const { PAD, PART_DIGITS, YEAR_DIGITS, SEPARATOR } = DATE_PICKER;
    return [String(year).padStart(YEAR_DIGITS, PAD), String(month).padStart(PART_DIGITS, PAD), String(day).padStart(PART_DIGITS, PAD)].join(SEPARATOR);
  }

  static daysInMonth ({ year, month }: CalendarMonthDto): number {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  static monthGrid ({ year, month }: CalendarMonthDto): (string | null)[] {
    const leading = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + DATE_PICKER.MONDAY_OFFSET) % DATE_PICKER.DAYS_IN_WEEK;
    const days = Array.from({ length: CalendarHelper.daysInMonth({ year, month }) }, (_day, index) => CalendarHelper.toIso({ year, month, day: index + 1 }));
    return [...Array.from({ length: leading }, () => null), ...days];
  }

  static shift ({ iso, days = 0, months = 0 }: CalendarShiftDto): string {
    const date = CalendarHelper.parse({ iso });
    if (!date) return iso;
    const target = new Date(Date.UTC(date.year, date.month - 1 + months, 1));
    const year = target.getUTCFullYear();
    const month = target.getUTCMonth() + 1;
    const day = Math.min(date.day, CalendarHelper.daysInMonth({ year, month }));
    const moved = new Date(Date.UTC(year, month - 1, day + days));
    return CalendarHelper.toIso({ year: moved.getUTCFullYear(), month: moved.getUTCMonth() + 1, day: moved.getUTCDate() });
  }

  static clamp ({ iso = '', min, max }: CalendarRangeDto): string {
    if (min && iso < min) return min;
    if (max && iso > max) return max;
    return iso;
  }

  static isWithin ({ iso = '', min, max }: CalendarRangeDto): boolean {
    return CalendarHelper.clamp({ iso, ...(min && { min }), ...(max && { max }) }) === iso;
  }

  static yearsAgo ({ today, years }: YearsAgoDto): string {
    const year = today.getUTCFullYear() - years;
    const month = today.getUTCMonth() + 1;
    return CalendarHelper.toIso({ year, month, day: Math.min(today.getUTCDate(), CalendarHelper.daysInMonth({ year, month })) });
  }

  static years ({ min, max }: CalendarRangeDto): number[] {
    const first = CalendarHelper.parse({ iso: min ?? '' })?.year ?? new Date().getUTCFullYear() - DATE_PICKER.OLDEST_AGE_YEARS;
    const last = CalendarHelper.parse({ iso: max ?? '' })?.year ?? new Date().getUTCFullYear();
    return Array.from({ length: Math.max(last - first + 1, 0) }, (_year, index) => last - index);
  }

  static monthNames (): string[] {
    const format = new Intl.DateTimeFormat(DATE_PICKER.LOCALE, { month: 'long', timeZone: DATE_PICKER.TIME_ZONE });
    return Array.from({ length: DATE_PICKER.MONTHS_IN_YEAR }, (_month, index) => format.format(new Date(Date.UTC(DATE_PICKER.REFERENCE_YEAR, index, 1))));
  }

  static label ({ iso }: CalendarIsoDto): string {
    const date = CalendarHelper.parse({ iso });
    if (!date) return '';
    const format = new Intl.DateTimeFormat(DATE_PICKER.LOCALE, { day: 'numeric', month: 'long', year: 'numeric', timeZone: DATE_PICKER.TIME_ZONE });
    return format.format(new Date(Date.UTC(date.year, date.month - 1, date.day)));
  }
}
