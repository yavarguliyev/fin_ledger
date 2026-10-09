export const LIST_TIME_SPEC = {
  NOON_HOUR: 12,
  YESTERDAY: 'Yesterday',
  TIME: /^\d{1,2}:\d{2}/,
  DATE: /\d{2}\D\d{2}\D\d{4}/,
  DAY_MS: 86400000,
  HOUR_MS: 3600000,
  THREE_DAYS: 3,
  TEN_DAYS: 10
} as const;
