import path from 'path';

const MODULES_SEGMENT = `${path.sep}src${path.sep}modules${path.sep}`;
const MODULE_FILE = /^[^/]+\.module$/;

const owningModule = file => {
  const at = file.indexOf(MODULES_SEGMENT);
  if (at < 0) return null;
  const rest = file.slice(at + MODULES_SEGMENT.length).split(path.sep);
  return rest.length > 1 ? { root: file.slice(0, at + MODULES_SEGMENT.length), name: rest[0] } : null;
};

export const moduleBoundaries = {
  meta: {
    type: 'problem',
    messages: {
      deepImport: "Import '{{module}}' through its index or its *.module file, not '{{source}}'."
    },
    schema: []
  },
  create (context) {
    const owner = owningModule(context.filename);
    if (!owner) return {};
    return {
      ImportDeclaration (node) {
        const source = node.source.value;
        if (typeof source !== 'string' || !source.startsWith('.')) return;
        const target = path.resolve(path.dirname(context.filename), source);
        if (!target.startsWith(owner.root)) return;
        const [name, ...inner] = target.slice(owner.root.length).split(path.sep);
        if (name === owner.name || inner.length === 0) return;
        if (inner.length === 1 && MODULE_FILE.test(inner[0])) return;
        context.report({ node: node.source, messageId: 'deepImport', data: { module: name, source } });
      }
    };
  }
};
