export const EVENT_BADGE = {
  LIVE_STATUS: 'LIVE',
  LIVE: 'inline-flex items-center gap-1 bg-danger/10 text-danger-deep dark:bg-danger/25 dark:text-danger-light',
  LIVE_DOT: 'w-1.5 h-1.5 rounded-full bg-danger animate-pulseRing',
  IDLE: 'bg-ink-100 text-ink-500 dark:bg-night-border dark:text-night-muted'
} as const;
