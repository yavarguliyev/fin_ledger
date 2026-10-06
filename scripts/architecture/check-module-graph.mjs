import { readFileSync } from 'node:fs';
import path from 'node:path';

import { moduleGraph, moduleNames } from './module-graph.mjs';

const MAP_FILE = path.resolve('docs/architecture/context-map.json');
const { contexts, allowed, knownCycles } = JSON.parse(readFileSync(MAP_FILE, 'utf8'));

const contextOf = new Map(Object.entries(contexts).flatMap(([context, modules]) => modules.map(name => [name, context])));
const graph = moduleGraph();
const nodes = moduleNames().sort();

const cycles = () => {
  const index = new Map();
  const low = new Map();
  const stack = [];
  const found = [];
  const visit = node => {
    index.set(node, index.size);
    low.set(node, index.get(node));
    stack.push(node);
    for (const next of graph.get(node) ?? []) {
      if (!index.has(next)) visit(next);
      if (stack.includes(next)) low.set(node, Math.min(low.get(node), low.get(next)));
    }
    if (low.get(node) !== index.get(node)) return;
    const members = stack.splice(stack.indexOf(node));
    if (members.length > 1) found.push(members.sort());
  };
  for (const node of nodes) if (!index.has(node)) visit(node);
  return found;
};

const problems = [];
for (const node of nodes) if (!contextOf.has(node)) problems.push(`Module '${node}' has no context in ${path.basename(MAP_FILE)}`);

const contextEdges = new Set();
for (const [from, targets] of graph) {
  for (const to of targets) {
    const [source, target] = [contextOf.get(from), contextOf.get(to)];
    if (!source || !target || source === target) continue;
    contextEdges.add(`${source} -> ${target}`);
    if (!(allowed[source] ?? []).includes(target)) problems.push(`'${from}' (${source}) imports '${to}' (${target}), which the context map does not allow`);
  }
}

const baseline = new Set(knownCycles.map(cycle => [...cycle].sort().join(',')));
const current = cycles().map(cycle => cycle.join(','));
for (const cycle of current) if (!baseline.has(cycle)) problems.push(`New module cycle: ${cycle}`);
for (const cycle of baseline) if (!current.includes(cycle)) problems.push(`Cycle ${cycle} is gone: remove it from knownCycles`);

console.log([...contextEdges].sort().join('\n'));
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Module graph matches the context map (${nodes.length} modules, ${current.length} known cycle(s))`);
