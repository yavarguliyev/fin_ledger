import { join } from 'node:path';

export const MOBILE_INPUTS_TEST = {
  GLOBAL_STYLES: join(__dirname, '..', '..', 'src', 'global_styles.css'),
  SHELL: join(__dirname, '..', '..', 'src', 'app', 'layout', 'templates', 'shell.component.html'),
  ENCODING: 'utf8',
  PHONE_BLOCK: /@media\s*\(max-width:\s*767px\)\s*\{([\s\S]*?\})\s*\}/,
  FIELDS: ['input:not(', 'select', 'textarea'],
  SIXTEEN_PIXELS: /font-size:\s*16px\s*!important/,
  BOUNDED_MAIN: /<main[^>]*class="[^"]*\bmax-w-7xl\b[^"]*\bmx-auto\b/
} as const;
