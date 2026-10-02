import { join } from 'node:path';

export const ANGULAR_BUDGETS_TEST = {
  ANGULAR_JSON: join(__dirname, '..', '..', 'angular.json'),
  ENCODING: 'utf8',
  PRODUCTION: 'production',
  EXPECTED: [
    { type: 'initial', maximumWarning: '500kB', maximumError: '1MB' },
    { type: 'anyScript', maximumWarning: '250kB', maximumError: '500kB' },
    { type: 'anyComponentStyle', maximumWarning: '4kB', maximumError: '8kB' }
  ]
} as const;
