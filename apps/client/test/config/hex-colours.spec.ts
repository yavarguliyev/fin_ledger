import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { HEX_COLOURS_TEST as T } from '../constants/hex-colours.constant';
import { SourceDirDto, SourceFileDto } from '../interfaces/source-file.interface';

const sources = ({ dir }: SourceDirDto): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory()
      ? sources({ dir: join(dir, entry.name) })
      : T.EXTENSIONS.some(extension => entry.name.endsWith(extension))
        ? [join(dir, entry.name)]
        : []
  );

const hexColours = ({ file }: SourceFileDto): string[] => {
  const source = readFileSync(file, T.ENCODING);
  return [...source.matchAll(T.HEX)].map(match => `${file}${T.SEPARATOR}${source.slice(0, match.index).split(T.NEWLINE).length}`);
};

describe('Colours in components', () => {
  it('come from the Tailwind theme, never a hex value in a template or class string', () => {
    expect(sources({ dir: T.APP_ROOT }).flatMap(file => hexColours({ file }))).toEqual([]);
  });
});
