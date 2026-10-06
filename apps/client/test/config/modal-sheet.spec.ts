import { readFileSync } from 'node:fs';

import { MODAL_SHEET_TEST as T } from '../constants/modal-sheet.constant';

describe('Dialogs on small screens', () => {
  it.each(T.TEMPLATES)('open as a full-screen sheet on phones and a centred card from sm up in %s', template => {
    const html = readFileSync(template, T.ENCODING);

    expect(html).toMatch(T.BACKDROP);
    expect(html).toMatch(T.SHEET);
  });
});
