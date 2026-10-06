import { readFileSync } from 'node:fs';

import { LAZY_ROUTES_TEST as T } from '../constants/lazy-routes.constant';

describe('Routes', () => {
  it('load every page lazily, so the first load carries no feature code', () => {
    const routes = readFileSync(T.ROUTES_FILE, T.ENCODING);

    expect(routes.match(T.EAGER)).toBeNull();
    expect(routes.match(T.LAZY)?.length).toBeGreaterThan(0);
  });
});
