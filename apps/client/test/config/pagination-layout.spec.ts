import { readFileSync } from 'node:fs';

import { PAGINATION_LAYOUT_TEST as T } from '../constants/pagination-layout.constant';

describe('Pagination on a 360 px phone', () => {
  it('wraps the page buttons and the rows-per-page select instead of scrolling the page sideways', () => {
    const rows = [...readFileSync(T.TEMPLATE, T.ENCODING).matchAll(T.ROW_CLASSES)].slice(0, T.WRAPPING_ROWS);

    rows.forEach(([, classes]) => expect(classes?.split(' ')).toContain(T.WRAP));
  });

  it('wraps the rows-per-page select in its label so screen readers announce it', () => {
    expect(readFileSync(T.TEMPLATE, T.ENCODING)).toMatch(T.LABELLED_SELECT);
  });
});
