import { readFileSync } from 'node:fs';

import { MOBILE_INPUTS_TEST as T } from '../constants/mobile-inputs.constant';

describe('Layout on phones and large screens', () => {
  it('keeps text fields at 16 px on phones so iOS does not zoom in on focus', () => {
    const block = T.PHONE_BLOCK.exec(readFileSync(T.GLOBAL_STYLES, T.ENCODING))?.[1] ?? '';

    T.FIELDS.forEach(field => expect(block).toContain(field));
    expect(block).toMatch(T.SIXTEEN_PIXELS);
  });

  it('caps the content width so pages do not stretch across a wide screen', () => {
    expect(readFileSync(T.SHELL, T.ENCODING)).toMatch(T.BOUNDED_MAIN);
  });
});
