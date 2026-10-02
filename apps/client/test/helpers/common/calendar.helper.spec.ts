import { CalendarHelper } from '../../../src/app/core/helpers/common/calendar.helper';
import { CALENDAR_SPEC as C } from '../../constants/calendar.constant';

describe('CalendarHelper', () => {
  it('parses real dates, including leap days, and rejects the rest', () => {
    expect(CalendarHelper.parse({ iso: C.ISO })).toEqual(C.PARSED);
    expect(CalendarHelper.parse({ iso: C.LEAP_DAY })).not.toBeNull();
    expect(CalendarHelper.parse({ iso: C.INVALID_DAY })).toBeNull();
    expect(CalendarHelper.parse({ iso: C.MALFORMED })).toBeNull();
  });

  it('lays a month out on a Monday-first grid', () => {
    const grid = CalendarHelper.monthGrid(C.MARCH_2024);

    expect(grid.slice(0, C.MARCH_2024_LEADING_BLANKS).every(cell => cell === null)).toBe(true);
    expect(grid[C.MARCH_2024_LEADING_BLANKS]).toBe(C.MARCH_2024_FIRST);
    expect(grid.filter(Boolean)).toHaveLength(C.MARCH_2024_DAYS);
  });

  it('moves by days across year ends and by months without overflowing short months', () => {
    expect(CalendarHelper.shift({ iso: C.DEC_31, days: 1 })).toBe(C.JAN_01);
    expect(CalendarHelper.shift({ iso: C.JAN_31, months: 1 })).toBe(C.FEB_29);
  });

  it('keeps dates inside the allowed range', () => {
    expect(CalendarHelper.clamp({ iso: C.BELOW, min: C.MIN, max: C.MAX })).toBe(C.MIN);
    expect(CalendarHelper.clamp({ iso: C.ABOVE, min: C.MIN, max: C.MAX })).toBe(C.MAX);
    expect(CalendarHelper.isWithin({ iso: C.ISO, min: C.MIN, max: C.MAX })).toBe(true);
    expect(CalendarHelper.isWithin({ iso: C.ABOVE, min: C.MIN, max: C.MAX })).toBe(false);
  });

  it('works out the latest birth date for an age limit, even from a leap day', () => {
    expect(CalendarHelper.yearsAgo({ today: new Date(C.TODAY_LEAP), years: C.EIGHTEEN })).toBe(C.EIGHTEEN_FROM_LEAP);
  });

  it('lists the selectable years newest first', () => {
    expect(CalendarHelper.years({ min: C.RANGE_MIN, max: C.RANGE_MAX })).toEqual(C.YEARS_RANGE);
  });

  it('names months and formats a readable label', () => {
    expect(CalendarHelper.monthNames()).toHaveLength(C.MONTHS);
    expect(CalendarHelper.monthNames()[0]).toBe(C.FIRST_MONTH);
    expect(CalendarHelper.label({ iso: C.ISO })).toBe(C.LABEL);
  });
});
