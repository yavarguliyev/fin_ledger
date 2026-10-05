import { join } from 'node:path';

const APP = join(__dirname, '..', '..', 'src', 'app');

export const LIST_LOADING_TEST = {
  TEMPLATES: [
    join(APP, 'shared', 'components', 'data-table', 'data-table.component.html'),
    join(APP, 'features', 'profile', 'payment-methods', 'templates', 'payment-methods.component.html')
  ],
  ENCODING: 'utf8',
  LOADING_BLOCK: /@if \(loading\(\)\) \{([\s\S]*?)\} @else/g,
  SKELETON: '<app-skeleton',
  SPINNER: 'animate-spin'
} as const;
