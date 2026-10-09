export const LAST_SEEN = {
  OFFLINE: 'Offline',
  PREFIX: 'last seen',
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  AT: 'at',
  SEPARATOR: ' ',
  TIME_FORMAT: { hour: '2-digit', minute: '2-digit' },
  DATE_FORMAT: { day: 'numeric', month: 'short' },
  DATE_WITH_YEAR_FORMAT: { day: 'numeric', month: 'short', year: 'numeric' }
} as const;
