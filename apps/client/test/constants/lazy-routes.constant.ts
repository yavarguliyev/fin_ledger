import { join } from 'node:path';

export const LAZY_ROUTES_TEST = {
  ROUTES_FILE: join(__dirname, '..', '..', 'src', 'app', 'app.routes.ts'),
  ENCODING: 'utf8',
  EAGER: /\bcomponent:/g,
  LAZY: /\bloadComponent:/g
} as const;
