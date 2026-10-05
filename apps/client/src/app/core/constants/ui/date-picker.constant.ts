export const DATE_PICKER = {
  TRIGGER_REF: 'trigger',
  LOCALE: 'en-GB',
  TIME_ZONE: 'UTC',
  ISO_PATTERN: /^\d{4}-\d{2}-\d{2}$/,
  SEPARATOR: '-',
  YEAR_DIGITS: 4,
  PART_DIGITS: 2,
  PAD: '0',
  DAYS_IN_WEEK: 7,
  MONTHS_IN_YEAR: 12,
  MONDAY_OFFSET: 6,
  WEEKDAYS: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  OLDEST_AGE_YEARS: 120,
  REFERENCE_YEAR: 2000,
  PLACEHOLDER: 'Select a date',
  PREVIOUS_MONTH: 'Previous month',
  NEXT_MONTH: 'Next month',
  MONTH_LABEL: 'Month',
  YEAR_LABEL: 'Year',
  DAY_ID_PREFIX: 'date-picker-day-',
  CLASS_SEPARATOR: ' ',
  DAY_CLASSES: {
    BASE: 'h-9 rounded-lg text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
    SELECTED: 'bg-primary text-white',
    IDLE: 'text-ink-800 dark:text-ink-100 hover:bg-ink-100 dark:hover:bg-night-hover',
    FOCUSED: 'ring-2 ring-primary'
  },
  STEPS: {
    ArrowLeft: { days: -1 },
    ArrowRight: { days: 1 },
    ArrowUp: { days: -7 },
    ArrowDown: { days: 7 },
    PageUp: { months: -1 },
    PageDown: { months: 1 }
  },
  KEYS: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape'
  }
} as const;
