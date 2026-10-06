import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const MODULES_ROOT = path.resolve('apps/core-api/src/modules');
const IMPORT_PATTERN = /from '(\.[^']+)'/g;

const walk = dir =>
  readdirSync(dir).flatMap(name => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith('.ts') ? [full] : [];
  });

const moduleOf = file => {
  const relative = path.relative(MODULES_ROOT, file);
  if (relative.startsWith('..')) return null;
  const [name, ...rest] = relative.split(path.sep);
  return rest.length > 0 ? name : null;
};

export const moduleNames = () => readdirSync(MODULES_ROOT).filter(name => statSync(path.join(MODULES_ROOT, name)).isDirectory());

export const moduleGraph = () => {
  const edges = new Map();
  for (const file of walk(MODULES_ROOT)) {
    const from = moduleOf(file);
    if (!from) continue;
    for (const [, source] of readFileSync(file, 'utf8').matchAll(IMPORT_PATTERN)) {
      const to = moduleOf(path.resolve(path.dirname(file), source));
      if (!to || to === from) continue;
      if (!edges.has(from)) edges.set(from, new Set());
      edges.get(from).add(to);
    }
  }
  return edges;
};

if (process.argv[1] === import.meta.filename) {
  for (const [from, targets] of [...moduleGraph()].sort()) console.log(`${from} -> ${[...targets].sort().join(', ')}`);
}
