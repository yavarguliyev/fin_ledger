import { ENUM_VALUES } from './enum-values.js';

export const enumColumn = ({ name, notNull = true, defaultValue }) => {
  if (!ENUM_VALUES[name]) throw new Error(`Unknown enum list: ${name}`);

  return { type: 'text', notNull, ...(defaultValue !== undefined && { default: defaultValue }) };
};

export const enumCheckName = ({ table, column }) => `chk_${table}_${column}`;

export const addEnumCheck = (pgm, { table, column, name }) => {
  const values = ENUM_VALUES[name];
  if (!values) throw new Error(`Unknown enum list: ${name}`);

  pgm.addConstraint(table, enumCheckName({ table, column }), {
    check: `${column} IN (${values.map(value => `'${value}'`).join(', ')})`
  });
};
