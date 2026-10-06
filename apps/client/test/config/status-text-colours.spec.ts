import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { STATUS_TEXT_COLOURS_TEST as T } from '../constants/status-text-colours.constant';
import { SourceDirDto, SourceFileDto } from '../interfaces/source-file.interface';

const sources = ({ dir }: SourceDirDto): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory()
      ? sources({ dir: join(dir, entry.name) })
      : T.EXTENSIONS.some(extension => entry.name.endsWith(extension))
        ? [join(dir, entry.name)]
        : []
  );

const plainStatusText = ({ file }: SourceFileDto): string[] => {
  const source = readFileSync(file, T.ENCODING);
  return [...source.matchAll(T.PLAIN_STATUS_TEXT)].map(match => `${file}${T.SEPARATOR}${source.slice(0, match.index).split(T.NEWLINE).length}`);
};

describe('Status text colours', () => {
  it('use the deep shade in light mode, never the plain success, danger or warning token', () => {
    expect(sources({ dir: T.APP_ROOT }).flatMap(file => plainStatusText({ file }))).toEqual([]);
  });
});
