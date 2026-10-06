import { join } from 'node:path';

export const SAFE_AREA_TEST = {
  INDEX_HTML: join(__dirname, '..', '..', 'src', 'index.html'),
  SHELL: join(__dirname, '..', '..', 'src', 'app', 'layout', 'templates', 'shell.component.html'),
  ENCODING: 'utf8',
  VIEWPORT: '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />',
  HEADER_INSET: /<header[^>]*pt-\[env\(safe-area-inset-top\)\]/,
  BOTTOM_NAV_INSET: /fixed bottom-0[^"]*pb-\[max\(0\.5rem,env\(safe-area-inset-bottom\)\)\]/,
  MAIN_INSET: /<main[^>]*pb-\[calc\(5rem\+env\(safe-area-inset-bottom\)\)\]/
} as const;
