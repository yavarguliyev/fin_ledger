import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { FIELD_ERROR_LINKS_TEST as T } from '../constants/field-error-links.constant';

describe('Field errors', () => {
  it.each(T.NATIVE_FIELDS)('are linked to their input in $FILE', ({ FILE, COUNT }) => {
    const template = readFileSync(join(T.APP_ROOT, FILE), T.ENCODING);
    const fieldIds = [...template.matchAll(T.FIELD_ID)].map(match => match[1] ?? T.EMPTY);

    expect(fieldIds).toHaveLength(COUNT);
    fieldIds.forEach(fieldId => {
      expect(template).toContain(T.INPUT_ID(fieldId));
      expect(template).toContain(T.DESCRIBED_BY(fieldId));
    });
  });
});
