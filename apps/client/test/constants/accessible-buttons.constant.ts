import { join } from 'node:path';

export const ACCESSIBLE_BUTTONS_TEST = {
  APP_ROOT: join(__dirname, '..', '..', 'src', 'app'),
  TEMPLATE_EXTENSION: '.html',
  ENCODING: 'utf8',
  BUTTON: /<button\b([^>]*)>([\s\S]*?)<\/button>/g,
  SVG: /<svg[\s\S]*?<\/svg>/g,
  TAG: /<[^>]+>/g,
  ACCESSIBLE_NAME: /aria-label|aria-labelledby/,
  NEWLINE: '\n',
  SEPARATOR: ':'
} as const;
