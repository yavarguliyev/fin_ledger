export const HTML_META_SPEC = {
  URL: 'https://example.com/articles/one',
  OPEN_GRAPH: `<html><head><title>Fallback</title>
    <meta property="og:title" content="Deposits &amp; withdrawals">
    <meta content='How   payouts work' property='og:description'>
    <meta property="og:image" content="/images/cover.png"></head></html>`,
  PLAIN: '<html><head><title> Plain page </title><meta name="description" content="Short summary"></head></html>',
  UNSAFE_IMAGE: '<meta property="og:image" content="javascript:alert(1)"><title>x</title>',
  LONG_TITLE_LENGTH: 500,
  TITLE_MAX: 200,
  TITLE: 'Deposits & withdrawals',
  DESCRIPTION: 'How payouts work',
  IMAGE: 'https://example.com/images/cover.png',
  PLAIN_TITLE: 'Plain page',
  PLAIN_DESCRIPTION: 'Short summary',
  LETTER: 'a'
} as const;
