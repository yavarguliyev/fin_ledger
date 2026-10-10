export const BUTTON = {
  VARIANTS: { PRIMARY: 'primary', SECONDARY: 'secondary', DANGER: 'danger', GHOST: 'ghost' },
  TYPES: { BUTTON: 'button', SUBMIT: 'submit' },
  BASE: 'inline-flex min-h-11 items-center justify-center gap-2 min-h-12 rounded-2xl px-5 py-2.5 text-[15px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-ground disabled:cursor-not-allowed disabled:opacity-60',
  VARIANT_CLASSES: {
    primary: 'glossy',
    secondary: 'border border-line bg-surface-2 text-text hover:border-action',
    danger: 'border border-loss/40 bg-loss/15 text-loss hover:bg-loss/25',
    ghost: 'text-live hover:bg-live/10'
  },
  FULL_WIDTH: 'w-full',
  SEPARATOR: ' '
} as const;
