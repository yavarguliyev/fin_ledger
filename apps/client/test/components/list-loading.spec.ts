import { readFileSync } from 'node:fs';

import { LIST_LOADING_TEST as T } from '../constants/list-loading.constant';

describe('List loading state', () => {
  T.TEMPLATES.forEach(path => {
    it(`shows the shared skeleton, not a spinner, while ${path} loads`, () => {
      const blocks = [...readFileSync(path, T.ENCODING).matchAll(T.LOADING_BLOCK)].map(([, block]) => block ?? '');

      expect(blocks.length).toBeGreaterThan(0);
      blocks.forEach(block => {
        expect(block).toContain(T.SKELETON);
        expect(block).not.toContain(T.SPINNER);
      });
    });
  });
});
