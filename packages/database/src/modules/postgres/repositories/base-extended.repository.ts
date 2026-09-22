import { BaseRepository } from './base.repository';
import { QueryPaginationOptionsResults } from '../../interfaces/query-pagination-options-results.interface';
import { QueryWithAdapterDto } from '../../dtos/query/query-with-adapter.dto';
import { FindWithPaginationDto } from '../../dtos/query/find-with-pagination.dto';
import { EntityIdRefDto } from '../../dtos/repository/entity-id-ref.dto';
import { IncrementDto } from '../../dtos/repository/increment.dto';
import { UpdateWithVersionDto } from '../../dtos/repository/update-with-version.dto';
import { UpdateWhereDto } from '../../dtos/repository/update-where.dto';
import { DatabaseHelper } from '../helpers/database.helper';

export abstract class BaseExtendedRepository<T> extends BaseRepository<T> {
  async findWithPagination (dto: FindWithPaginationDto): Promise<QueryPaginationOptionsResults<T>> {
    const { page, limit, ...queryOptions } = dto;

    const offset = (page - 1) * limit;
    const total = await this.count(queryOptions);
    const data = await this.findAll({ ...queryOptions, limit, offset });
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }

  async findAllWithPagination (dto: QueryWithAdapterDto): Promise<QueryPaginationOptionsResults<T>> {
    const { page = 25, limit = 25, search, searchFields, where, orderBy, orderDirection, adapter } = dto;

    const queryOptions: QueryWithAdapterDto = {
      ...(adapter && { adapter }),
      orderBy: orderBy || 'id',
      orderDirection: orderDirection || 'ASC'
    };

    if (where) queryOptions.where = where;
    if (search && searchFields && searchFields.length > 0) queryOptions.search = search;

    return this.findWithPagination({ ...queryOptions, page, limit });
  }

  async findByIdForUpdate ({ id, adapter }: EntityIdRefDto): Promise<T | null> {
    const { query, params } = this.builder.buildSelectQuery({ columns: this.getSelectColumns(), options: { where: { id } } });

    const lockQuery = `${query} FOR UPDATE`;
    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>({ sql: lockQuery, params });

    return (result.rows[0] as T) || null;
  }

  async increment ({ id, field, amount, adapter }: IncrementDto<T>): Promise<T | null> {
    const dbColumn = this.builder.getColumnMapping({ column: field });
    const columns = this.getSelectColumns();
    const returning = columns
      .map(col => {
        const mapping = this.builder.getColumnMapping({ column: col });
        return mapping ? `${mapping} as "${col}"` : col;
      })
      .join(', ');

    const updatedAtClause = DatabaseHelper.buildUpdatedAtClause({ builder: this.builder });

    const query = `
      UPDATE ${this.builder.getTableName()}
      SET ${dbColumn} = ${dbColumn} + $1${updatedAtClause}
      WHERE id = $2
      RETURNING ${returning}
    `;

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>({ sql: query, params: [amount, id] });

    return result.rows[0] ?? null;
  }

  async updateWithVersion ({ id, data, versionField, expectedVersion, adapter }: UpdateWithVersionDto<T>): Promise<T | null> {
    const { setClause, params, paramIndex: idx } = DatabaseHelper.buildSetClause({ builder: this.builder, data });
    const dbVersionCol = this.builder.getColumnMapping({ column: versionField });
    const versionSet = `${dbVersionCol} = ${dbVersionCol} + 1`;
    const updatedAtClause = DatabaseHelper.buildUpdatedAtClause({ builder: this.builder });

    params.push(id);
    const idIdx = idx;
    params.push(expectedVersion);
    const verIdx = idx + 1;

    const returning = DatabaseHelper.buildReturningClause({ builder: this.builder, selectColumns: this.getSelectColumns() });

    const query = `
      UPDATE ${this.builder.getTableName()}
      SET ${setClause ? setClause + ', ' : ''}${versionSet}${updatedAtClause}
      WHERE id = $${idIdx} AND ${dbVersionCol} = $${verIdx}
      ${returning}
    `;

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>({ sql: query, params });

    return result.rows[0] ?? null;
  }

  async updateWhere ({ where, data, adapter }: UpdateWhereDto<T>): Promise<T | null> {
    const { setClause, params, paramIndex } = DatabaseHelper.buildSetClause({ builder: this.builder, data });
    const updatedAtClause = DatabaseHelper.buildUpdatedAtClause({ builder: this.builder });
    let currentIdx = paramIndex;

    let whereClause = '';
    const whereKeys = Object.keys(where);
    if (whereKeys.length > 0) {
      whereClause =
        'WHERE ' +
        whereKeys
          .map(key => {
            const dbCol = this.builder.getColumnMapping({ column: key });
            if (where[key] === null) return `${dbCol} IS NULL`;

            params.push(where[key]);
            return `${dbCol} = $${currentIdx++}`;
          })
          .join(' AND ');
    }

    const returning = DatabaseHelper.buildReturningClause({ builder: this.builder, selectColumns: this.getSelectColumns() });

    const query = `
      UPDATE ${this.builder.getTableName()}
      SET ${setClause}${updatedAtClause}
      ${whereClause}
      ${returning}
    `;

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>({ sql: query, params });

    return result.rows[0] ?? null;
  }
}
