export const TABS = {
  NEXT_KEYS: ['ArrowRight', 'ArrowDown'],
  PREVIOUS_KEYS: ['ArrowLeft', 'ArrowUp'],
  FIRST_KEY: 'Home',
  LAST_KEY: 'End',
  TAB_ID_PREFIX: 'tab-',
  PANEL_ID_PREFIX: 'tabpanel-',
  LIST: 'flex gap-1 overflow-x-auto border-b border-ink-200 dark:border-night-border',
  TAB: 'min-h-11 whitespace-nowrap border-b-2 px-4 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  ACTIVE: 'border-primary text-primary',
  INACTIVE: 'border-transparent text-ink-600 hover:text-ink-900 dark:text-night-muted dark:hover:text-night-text',
  SEPARATOR: ' '
} as const;
