export const LAST_SEEN_SPEC = {
  NOON_HOUR: 12,
  OFFLINE: 'Offline',
  TODAY: 'last seen today at ',
  YESTERDAY: 'last seen yesterday at ',
  PREFIX: 'last seen ',
  AT: ' at ',
  TIME: /\d{1,2}:\d{2}/,
  YEARS_AGO: 2,
  MINUTE_MS: 60000,
  HOUR_MS: 3600000,
  DAY_MS: 86400000
} as const;
