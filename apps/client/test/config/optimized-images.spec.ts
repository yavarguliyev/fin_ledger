import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { OPTIMIZED_IMAGES_TEST as T } from '../constants/optimized-images.constant';
import { SourceDirDto, SourceFileDto } from '../interfaces/source-file.interface';

const templates = ({ dir }: SourceDirDto): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? templates({ dir: join(dir, entry.name) }) : entry.name.endsWith(T.TEMPLATE_EXTENSION) ? [join(dir, entry.name)] : []
  );

const unsizedImages = ({ file }: SourceFileDto): string[] => {
  const source = readFileSync(file, T.ENCODING);
  return [...source.matchAll(T.IMAGE)]
    .filter(([tag]) => !T.LOCAL_SOURCE.test(tag) && !(T.OPTIMIZED.test(tag) && T.SIZED.test(tag)))
    .map(match => `${file}${T.SEPARATOR}${source.slice(0, match.index).split(T.NEWLINE).length}`);
};

describe('Images', () => {
  it('load through NgOptimizedImage with a fixed size, so they never shift the layout', () => {
    expect(templates({ dir: T.APP_ROOT }).flatMap(file => unsizedImages({ file }))).toEqual([]);
  });
});
