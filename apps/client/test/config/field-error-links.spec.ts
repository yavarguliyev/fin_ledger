import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { FIELD_ERROR_LINKS_TEST as T } from '../constants/field-error-links.constant';

describe('Field errors', () => {
  it.each(T.NATIVE_FIELDS)('are linked to their field in $FILE', ({ FILE, COUNT }) => {
    const template = readFileSync(join(T.APP_ROOT, FILE), T.ENCODING);
    const fieldIds = [...template.matchAll(T.FIELD_ID)].map(match => match[1] ?? T.EMPTY);

    expect(fieldIds).toHaveLength(COUNT);
    fieldIds.forEach(fieldId => {
      const native = template.includes(T.INPUT_ID(fieldId)) && template.includes(T.DESCRIBED_BY(fieldId));
      expect(native || template.includes(T.CUSTOM_DESCRIBED_BY(fieldId))).toBe(true);
    });
  });

  it.each(T.CUSTOM_CONTROLS)('reach the focusable element of %s', file => {
    expect(readFileSync(join(T.APP_ROOT, file), T.ENCODING)).toContain(T.CONTROL_BINDING);
  });
});
