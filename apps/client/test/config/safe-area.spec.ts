import { readFileSync } from 'node:fs';

import { SAFE_AREA_TEST as T } from '../constants/safe-area.constant';

describe('Notched phones', () => {
  it('lays the page out at device width and lets it reach under the notch', () => {
    expect(readFileSync(T.INDEX_HTML, T.ENCODING)).toContain(T.VIEWPORT);
  });

  it('keeps the header, the bottom nav and the page content clear of the safe-area insets', () => {
    const shell = readFileSync(T.SHELL, T.ENCODING);

    expect(shell).toMatch(T.HEADER_INSET);
    expect(shell).toMatch(T.BOTTOM_NAV_INSET);
    expect(shell).toMatch(T.MAIN_INSET);
  });
});
