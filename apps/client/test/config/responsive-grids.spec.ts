import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { RESPONSIVE_GRIDS_TEST as T } from '../constants/responsive-grids.constant';
import { SourceDirDto, SourceFileDto } from '../interfaces/source-file.interface';

const templates = ({ dir }: SourceDirDto): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? templates({ dir: join(dir, entry.name) }) : entry.name.endsWith(T.EXTENSION) ? [join(dir, entry.name)] : []
  );

const unboundedGrids = ({ file }: SourceFileDto): string[] =>
  [...readFileSync(file, T.ENCODING).matchAll(T.CLASS_ATTRIBUTE)]
    .map(match => match[1] ?? '')
    .filter(classes => T.GRID.test(classes) && T.RESPONSIVE_COLUMNS.test(classes) && !T.BASE_COLUMNS.test(classes))
    .map(classes => `${file}${T.SEPARATOR}${classes}`);

describe('Responsive grids', () => {
  it('set a base column count, so long text cannot widen a phone layout', () => {
    expect(templates({ dir: T.APP_ROOT }).flatMap(file => unboundedGrids({ file }))).toEqual([]);
  });
});
