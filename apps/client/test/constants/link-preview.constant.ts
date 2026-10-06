export const LINK_PREVIEW_TEST = {
  SENTENCE: 'See https://example.com/docs/payouts. Thanks!',
  BRACKETED: '(details: https://example.com/a?b=1)',
  PLAIN: 'No link in here',
  FIRST_URL: 'https://example.com/docs/payouts',
  BRACKETED_URL: 'https://example.com/a?b=1',
  HOST: 'example.com',
  BROKEN: 'https://',
  API_URL: 'http://api.test/api/v1',
  PREVIEW_PATH: 'http://api.test/api/v1/support/link-preview',
  TITLE: 'Example'
} as const;
