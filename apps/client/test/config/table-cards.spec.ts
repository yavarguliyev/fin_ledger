import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { TABLE_CARDS_TEST as T } from '../constants/table-cards.constant';
import { SourceDirDto } from '../interfaces/source-file.interface';

const templates = ({ dir }: SourceDirDto): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? templates({ dir: join(dir, entry.name) }) : entry.name.endsWith(T.EXTENSION) ? [join(dir, entry.name)] : []
  );

describe('Tables on phones', () => {
  it('shows the shared table as a card list under 768 px and as a table from md up', () => {
    const html = readFileSync(T.DATA_TABLE, T.ENCODING);

    expect(html).toMatch(T.DESKTOP_TABLE);
    expect(html).toMatch(T.PHONE_CARDS);
  });

  it('never renders a raw table outside the shared one', () => {
    const raw = templates({ dir: T.APP_ROOT }).filter(file => file !== T.DATA_TABLE && readFileSync(file, T.ENCODING).includes(T.RAW_TABLE));

    expect(raw).toEqual([]);
  });
});
