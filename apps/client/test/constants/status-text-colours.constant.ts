import { join } from 'node:path';

export const STATUS_TEXT_COLOURS_TEST = {
  APP_ROOT: join(__dirname, '..', '..', 'src', 'app'),
  EXTENSIONS: ['.html', '.ts'],
  ENCODING: 'utf8',
  PLAIN_STATUS_TEXT: /(?<![-:\w])text-(success|danger|warning)(?=[\s'"])/g,
  NEWLINE: '\n',
  SEPARATOR: ':'
} as const;
