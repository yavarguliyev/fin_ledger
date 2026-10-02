export const PAGE_VIEW = {
  PATH: '/telemetry/page-view',
  METHOD: 'POST',
  EMPTY_COUNTS: { initialCalls: 0, laterCalls: 0, duplicates: 0 },
  STALE_START: 0,
  INITIAL_WINDOW_MS: 5_000,
  CONTENT_TYPE: 'text/plain;charset=UTF-8',
  ROOT: '/',
  SEPARATOR: '/',
  KEY_SEPARATOR: ' ',
  HIDDEN: 'hidden',
  VISIBILITY_EVENT: 'visibilitychange',
  PAGE_HIDE_EVENT: 'pagehide'
} as const;
