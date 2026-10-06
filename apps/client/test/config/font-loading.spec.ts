import { readFileSync } from 'node:fs';

import { FONT_LOADING_TEST as T } from '../constants/font-loading.constant';

describe('Main font loading', () => {
  it('connects to the font hosts and requests the font from the page head, so the build can inline it', () => {
    const index = readFileSync(T.INDEX_HTML, T.ENCODING);

    T.PRECONNECTS.forEach(preconnect => expect(index).toContain(preconnect));
    expect(index).toMatch(T.STYLESHEET);
  });

  it('never chains the font behind the global stylesheet', () => {
    expect(readFileSync(T.GLOBAL_STYLES, T.ENCODING)).not.toContain(T.CSS_IMPORT);
  });
});
