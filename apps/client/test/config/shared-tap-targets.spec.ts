import { readFileSync } from 'node:fs';

import { SHARED_TAP_TARGETS_TEST as T } from '../constants/shared-tap-targets.constant';

describe('Shared component tap targets', () => {
  it('makes every pagination button at least 44 px square', () => {
    const buttons = [...readFileSync(T.PAGINATION, T.ENCODING).matchAll(T.PAGINATION_BUTTON)].map(([, quoted, attribute]) => (quoted ?? attribute ?? T.EMPTY).split(T.SPACE));

    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(classes => expect(classes).toEqual(expect.arrayContaining([...T.PAGINATION_CLASSES])));
  });

  it('gives the modal close button a 44 px hit area', () => {
    expect(readFileSync(T.MODAL, T.ENCODING)).toMatch(T.MODAL_CLOSE);
  });

  it('sizes the table action icons at 44 px', () => {
    expect(readFileSync(T.GLOBAL_STYLES, T.ENCODING)).toMatch(T.ACTION_ICON);
  });
});
