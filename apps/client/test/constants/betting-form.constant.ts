import { join } from 'node:path';

export const BETTING_FORM_TEST = {
  TEMPLATE: join(__dirname, '..', '..', 'src', 'app', 'features', 'betting', 'templates', 'betting.component.html'),
  COMPONENT: join(__dirname, '..', '..', 'src', 'app', 'features', 'betting', 'betting.component.ts'),
  ENCODING: 'utf8',
  BOUND_CONTROL: /<input[^>]*formControlName[^>]*\[disabled\]/,
  DISABLED_AT_START: /control<number \| null>\(\{ value: null, disabled: true \}/,
  LIVE_GUARD: /@if \(event\.status !== badge\.LIVE_STATUS\) \{\s*<button[\s\S]*?Select/,
  LIVE_TOKEN: 'text-live',
  IDLE_TOKEN: 'text-pending'
} as const;
