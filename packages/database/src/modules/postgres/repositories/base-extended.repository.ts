import { EntityId, UnknownRecord } from '@common/shared-libs';

import { BaseRepository } from './base.repository';
import { buildReturningClause, buildSetClause, buildUpdatedAtClause } from '../helpers/update-query.helper';
import { DatabaseAdapter, QueryPaginationOptionsResults } from '../../interfaces/database.interface';
import { QueryWithPaginationOptions } from '../../interfaces/database.interface';

export abstract class BaseExtendedRepository<T> extends BaseRepository<T> {
  async findWithPagination (
    options: QueryWithPaginationOptions & { page: number; limit: number },
    adapter?: DatabaseAdapter
  ): Promise<QueryPaginationOptionsResults<T>> {
    const { page, limit, ...queryOptions } = options;

    const offset = (page - 1) * limit;
    const total = await this.count(queryOptions, adapter);
    const data = await this.findAll({ ...queryOptions, limit, offset }, adapter);
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }

  async findAllWithPagination (options: QueryWithPaginationOptions, adapter?: DatabaseAdapter): Promise<QueryPaginationOptionsResults<T>> {
    const { page = 25, limit = 25, search, searchFields, where, orderBy, orderDirection } = options;

    const queryOptions: QueryWithPaginationOptions = {
      orderBy: orderBy || 'id',
      orderDirection: orderDirection || 'ASC'
    };

    if (where) queryOptions.where = where;
    if (search && searchFields && searchFields.length > 0) queryOptions.search = search;

    return this.findWithPagination({ ...queryOptions, page, limit }, adapter);
  }

  async findByIdForUpdate (id: EntityId, adapter?: DatabaseAdapter): Promise<T | null> {
    const columns = this.getSelectColumns();

    const { query, params } = this.builder.buildSelectQuery(columns, { where: { id } });

    const lockQuery = `${query} FOR UPDATE`;
    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>(lockQuery, params);

    return (result.rows[0] as T) || null;
  }

  async increment (id: EntityId, field: keyof T & string, amount: number, adapter?: DatabaseAdapter): Promise<T | null> {
    const dbColumn = this.builder.getColumnMapping(field);
    const columns = this.getSelectColumns();
    const returning = columns
      .map(col => {
        const mapping = this.builder.getColumnMapping(col);
        return mapping ? `${mapping} as "${col}"` : col;
      })
      .join(', ');

    const updatedAtClause = buildUpdatedAtClause(this.builder);

    const query = `
      UPDATE ${this.builder.getTableName()}
      SET ${dbColumn} = ${dbColumn} + $1${updatedAtClause}
      WHERE id = $2
      RETURNING ${returning}
    `;

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>(query, [amount, id]);

    return result.rows[0] ?? null;
  }

  async updateWithVersion (
    id: EntityId,
    data: Partial<T>,
    versionField: keyof T & string,
    expectedVersion: number,
    adapter?: DatabaseAdapter
  ): Promise<T | null> {
    const { setClause, params, paramIndex: idx } = buildSetClause(this.builder, data as UnknownRecord);
    const dbVersionCol = this.builder.getColumnMapping(versionField);
    const versionSet = `${dbVersionCol} = ${dbVersionCol} + 1`;
    const updatedAtClause = buildUpdatedAtClause(this.builder);

    params.push(id);
    const idIdx = idx;
    params.push(expectedVersion);
    const verIdx = idx + 1;

    const returning = buildReturningClause(this.builder, this.getSelectColumns());

    const query = `
      UPDATE ${this.builder.getTableName()}
      SET ${setClause ? setClause + ', ' : ''}${versionSet}${updatedAtClause}
      WHERE id = $${idIdx} AND ${dbVersionCol} = $${verIdx}
      ${returning}
    `;

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>(query, params);

    return result.rows[0] ?? null;
  }

  async updateWhere (where: UnknownRecord, data: Partial<T>, adapter?: DatabaseAdapter): Promise<T | null> {
    const { setClause, params, paramIndex } = buildSetClause(this.builder, data as UnknownRecord);
    const updatedAtClause = buildUpdatedAtClause(this.builder);
    let currentIdx = paramIndex;

    let whereClause = '';
    const whereKeys = Object.keys(where);
    if (whereKeys.length > 0) {
      whereClause =
        'WHERE ' +
        whereKeys
          .map(key => {
            const dbCol = this.builder.getColumnMapping(key);
            params.push(where[key]);
            return `${dbCol} = $${currentIdx++}`;
          })
          .join(' AND ');
    }

    const returning = buildReturningClause(this.builder, this.getSelectColumns());

    const query = `
      UPDATE ${this.builder.getTableName()}
      SET ${setClause}${updatedAtClause}
      ${whereClause}
      ${returning}
    `;

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>(query, params);

    return result.rows[0] ?? null;
  }
}
