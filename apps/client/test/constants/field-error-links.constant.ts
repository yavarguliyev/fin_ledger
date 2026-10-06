import { join } from 'node:path';

export const FIELD_ERROR_LINKS_TEST = {
  APP_ROOT: join(__dirname, '..', '..', 'src', 'app'),
  EXTENSION: '.html',
  ENCODING: 'utf8',
  EMPTY: '',
  FIELD_ID: /<app-field-error[^>]*fieldId="([^"]+)"/g,
  DESCRIBED_BY: (fieldId: string): string => `aria-describedby="${fieldId}-error"`,
  INPUT_ID: (fieldId: string): string => `id="${fieldId}"`,
  CUSTOM_DESCRIBED_BY: (fieldId: string): string => `describedBy="${fieldId}-error"`,
  CONTROL_BINDING: '[attr.aria-describedby]="describedBy()"',
  CUSTOM_CONTROLS: [
    join('shared', 'components', 'country-select', 'country-select.component.html'),
    join('shared', 'components', 'date-picker', 'date-picker.component.html')
  ],
  NATIVE_FIELDS: [
    { FILE: join('features', 'auth', 'templates', 'register.component.html'), COUNT: 4 },
    { FILE: join('features', 'profile', 'security', 'templates', 'account-security.component.html'), COUNT: 4 },
    { FILE: join('features', 'profile', 'templates', 'profile.component.html'), COUNT: 3 },
    { FILE: join('features', 'wallet', 'templates', 'withdraw.component.html'), COUNT: 1 }
  ]
} as const;
