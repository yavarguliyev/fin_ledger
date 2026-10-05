import { join } from 'node:path';

export const NOTIFICATION_LOAD_TEST = {
  APP: join(__dirname, '..', '..', 'src', 'app', 'app.component.ts'),
  DASHBOARD: join(__dirname, '..', '..', 'src', 'app', 'features', 'dashboard', 'dashboard.component.ts'),
  LOAD_CALL: 'getNotifications(',
  ENCODING: 'utf8',
  EFFECT_BODY: /effect\(\(\) => \{([\s\S]*?)\n {4}\}\);/,
  UNTRACKED_LOAD: /untracked\(\(\) => \{[\s\S]*connectSSE\(\)[\s\S]*getNotifications\(\)[\s\S]*\}\);/
} as const;
