export const LINK_PREVIEW = {
  PATH: '/link-preview',
  URL_PATTERN: /https?:\/\/[^\s<>"']+/i,
  TRAILING_PUNCTUATION: /[).,!?;:]+$/,
  EMPTY: '',
  TARGET: '_blank',
  REL: 'noopener noreferrer nofollow'
} as const;
