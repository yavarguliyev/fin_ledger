import { join } from 'node:path';

export const HEX_COLOURS_TEST = {
  APP_ROOT: join(__dirname, '..', '..', 'src', 'app'),
  GLOBAL_STYLES: join(__dirname, '..', '..', 'src', 'global_styles.css'),
  EXTENSIONS: ['.html', '.ts'],
  ENCODING: 'utf8',
  HEX: /#[0-9a-fA-F]{3,8}\b/g,
  NEWLINE: '\n',
  SEPARATOR: ':'
} as const;
