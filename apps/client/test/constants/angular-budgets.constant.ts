import { join } from 'node:path';

export const ANGULAR_BUDGETS_TEST = {
  ANGULAR_JSON: join(__dirname, '..', '..', 'angular.json'),
  ENCODING: 'utf8',
  PRODUCTION: 'production',
  EXPECTED: [
    { type: 'initial', maximumWarning: '500kB', maximumError: '1MB' },
    { type: 'anyScript', maximumWarning: '220kB', maximumError: '500kB' },
    { type: 'anyComponentStyle', maximumWarning: '4kB', maximumError: '8kB' },
    { type: 'bundle', name: 'profile-component', maximumWarning: '100kB', maximumError: '150kB' },
    { type: 'bundle', name: 'support-component', maximumWarning: '100kB', maximumError: '150kB' }
  ]
} as const;
