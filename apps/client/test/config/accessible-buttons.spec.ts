import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ACCESSIBLE_BUTTONS_TEST as T } from '../constants/accessible-buttons.constant';

const templates = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? templates(join(dir, entry.name)) : entry.name.endsWith(T.TEMPLATE_EXTENSION) ? [join(dir, entry.name)] : []
  );

const unlabelledIconButtons = (file: string): string[] => {
  const source = readFileSync(file, T.ENCODING);
  return [...source.matchAll(T.BUTTON)]
    .filter(([, attributes, inner]) => !(inner ?? '').replace(T.SVG, '').replace(T.TAG, '').trim() && !T.ACCESSIBLE_NAME.test(attributes ?? ''))
    .map(match => `${file}${T.SEPARATOR}${source.slice(0, match.index).split(T.NEWLINE).length}`);
};

describe('Buttons that show only an icon', () => {
  it('always carry an accessible name for screen readers', () => {
    expect(templates(T.APP_ROOT).flatMap(unlabelledIconButtons)).toEqual([]);
  });
});
