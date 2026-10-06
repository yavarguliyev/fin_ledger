import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve, sep } from 'node:path';

import { BACKGROUND_GUARD_SPEC as T } from '../constants/background-guard.constant';

const root = resolve(__dirname, T.REPO_ROOT);
const skipped: readonly string[] = T.SKIPPED_DIRS;
const connections: readonly string[] = T.CONNECTION_FILES;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return skipped.includes(name) ? [] : walk(path);
    return path.endsWith(T.TS_EXTENSION) ? [path] : [];
  });

const sources = T.SOURCE_ROOTS.flatMap(dir => walk(join(root, dir))).filter(path => relative(root, path).split(sep).includes(T.SOURCE_DIR));

describe('Background work starts only through BackgroundRunner', () => {
  it('scans the API and package sources', () => {
    expect(sources.length).toBeGreaterThan(0);
  });

  it('keeps setInterval inside classes decorated with @BackgroundWorker', () => {
    const offenders = sources.filter(path => {
      const text = readFileSync(path, 'utf8');
      return T.TIMER_PATTERN.test(text) && !text.includes(T.WORKER_MARKER);
    });

    expect(offenders.map(path => relative(root, path))).toEqual([]);
  });

  it('starts nothing from onModuleInit or onApplicationBootstrap except connections and the runner', () => {
    const offenders = sources.filter(path => T.HOOK_PATTERN.test(readFileSync(path, 'utf8')) && !connections.includes(basename(path)));

    expect(offenders.map(path => relative(root, path))).toEqual([]);
  });
});
