export const BUTTON = {
  VARIANTS: { PRIMARY: 'primary', SECONDARY: 'secondary', DANGER: 'danger', GHOST: 'ghost' },
  TYPES: { BUTTON: 'button', SUBMIT: 'submit' },
  BASE: 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  VARIANT_CLASSES: {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'border border-ink-300 bg-white text-ink-700 hover:bg-ink-50 dark:border-night-border dark:bg-night-card dark:text-night-text dark:hover:bg-night-hover',
    danger: 'bg-danger-dark text-white hover:bg-danger-deep',
    ghost: 'text-primary hover:bg-primary/10'
  },
  FULL_WIDTH: 'w-full',
  SEPARATOR: ' '
} as const;
