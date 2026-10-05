import { join } from 'node:path';

const TEMPLATES = join(__dirname, '..', '..', 'src', 'app', 'features', 'auth', 'templates');

export const AUTH_TAP_TARGETS_TEST = {
  TEMPLATES: [join(TEMPLATES, 'login.component.html'), join(TEMPLATES, 'register.component.html')],
  REGISTER: join(TEMPLATES, 'register.component.html'),
  ENCODING: 'utf8',
  TOGGLE: /<button[^>]*class="([^"]*)"[^>]*Show password/g,
  LINK: /<a routerLink="[^"]*" class="([^"]*)"/g,
  TERMS_BOX: /<span class="[^"]*\bh-11 w-11\b[^"]*">\s*<input type="checkbox" formControlName="terms"/,
  SQUARE: ['h-11', 'w-11'],
  TALL_LINK: ['py-3', '-my-3']
} as const;
