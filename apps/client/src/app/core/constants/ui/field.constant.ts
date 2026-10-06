export const FIELD = {
  LABEL: 'mb-1 block text-sm font-medium text-ink-700 dark:text-night-text',
  CONTROL: 'block min-h-11 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-base text-ink-900 placeholder:text-ink-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 dark:border-night-border dark:bg-night-surface dark:text-night-text',
  INVALID: 'border-danger focus:border-danger focus:ring-danger/40',
  ERROR: 'mt-1 text-sm text-danger-deep dark:text-danger-light',
  ID_PREFIX: 'field-',
  ERROR_SUFFIX: '-error',
  TEXT_TYPE: 'text',
  EMPTY: '',
  SEPARATOR: ' '
} as const;
