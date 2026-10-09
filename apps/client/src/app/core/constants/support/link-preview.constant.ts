export const LINK_PREVIEW = {
  PATH: '/link-preview',
  URL_PATTERN: /https?:\/\/[^\s<>"']+/i,
  TRAILING_PUNCTUATION: /[).,!?;:]+$/,
  EMPTY: '',
  TARGET: '_blank',
  REL: 'noopener noreferrer nofollow',
  DEBOUNCE_MS: 600,
  DISMISS_LABEL: 'Remove link preview'
} as const;
