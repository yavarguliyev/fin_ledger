import { UnknownRecord } from '@common/shared-libs';

import { Builder } from '../query-builder/builder';
import { BuildSetClause } from '../../interfaces/database.interface';

export const buildSetClause = <T>(builder: Builder<T>, data: UnknownRecord): BuildSetClause => {
  const columns = Object.keys(data).filter(key => data[key] !== undefined);
  const params: unknown[] = [];
  let paramIndex = 1;

  const setClause = columns
    .map(col => {
      const dbColumn = builder.getColumnMapping(col);
      params.push(data[col]);
      return `${dbColumn} = $${paramIndex++}`;
    })
    .join(', ');

  return { setClause, params, paramIndex };
};

export const buildReturningClause = <T>(builder: Builder<T>, selectColumns: string[]): string => {
  if (!selectColumns.length) return '';

  const mapped = selectColumns
    .map(col => builder.getColumnMapping(col))
    .map((c, i) => `${c} AS "${selectColumns[i]}"`)
    .join(', ');

  return `RETURNING ${mapped}`;
};

export const buildUpdatedAtClause = <T>(builder: Builder<T>): string => {
  return builder.hasColumn('updatedAt') ? `, ${builder.getColumnMapping('updatedAt')} = CURRENT_TIMESTAMP` : '';
};
