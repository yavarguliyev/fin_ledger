export const FOCUS_TRAP = {
  FOCUSABLE: 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  TAB_KEY: 'Tab',
  HOST_TAB_INDEX: '-1',
  TAB_INDEX_ATTRIBUTE: 'tabindex'
} as const;
