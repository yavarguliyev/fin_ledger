import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { DIALOG_FOCUS_TRAP_TEST as T } from '../constants/dialog-focus-trap.constant';

describe('Dialogs', () => {
  it.each(T.DIALOGS)('trap and restore focus in %s', file => {
    expect(readFileSync(join(T.APP_ROOT, file), T.ENCODING)).toContain(T.TRAP);
  });
});
