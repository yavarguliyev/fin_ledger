import { Injectable } from '@nestjs/common';
import { EntityId, UnknownRecord } from '@common/shared-libs';

import { PostgresService } from '../services/postgres.service';
import { Builder } from '../query-builder/builder';
import { DatabaseAdapter } from '../../interfaces/database.interface';
import { ColumnMapping, QueryWithPaginationOptions } from '../../interfaces/database.interface';

@Injectable()
export abstract class BaseRepository<T> {
  protected builder: Builder<T>;

  constructor (
    protected readonly service: PostgresService,
    protected tableName: string,
    protected columnMappings: ColumnMapping = {}
  ) {
    this.builder = new Builder(tableName, columnMappings);
  }

  protected abstract getSelectColumns(): string[];

  async findAll (options: QueryWithPaginationOptions = {}, adapter?: DatabaseAdapter): Promise<T[]> {
    const columns = this.getSelectColumns();
    const { query, params } = this.builder.buildSelectQuery(columns, options);

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>(query, params);

    return result.rows;
  }

  async findById (id: EntityId, adapter?: DatabaseAdapter): Promise<T | null> {
    const columns = this.getSelectColumns();
    const { query, params } = this.builder.buildSelectQuery(columns, { where: { id } });

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>(query, params);

    return (result.rows[0] as T) || null;
  }

  async findOne (where: UnknownRecord, adapter?: DatabaseAdapter): Promise<T | null> {
    const columns = this.getSelectColumns();
    const { query, params } = this.builder.buildSelectQuery(columns, { where });

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>(query, params);

    return (result.rows[0] as T) || null;
  }

  async create<K extends keyof T> (data: Partial<T>, returningColumns?: K[], adapter?: DatabaseAdapter): Promise<Pick<T, K> | null> {
    const columnsToReturn = returningColumns ?? (this.getSelectColumns() as K[]);
    const { query, params } = this.builder.buildInsertQuery(data, columnsToReturn);

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<Pick<T, K>>(query, params);

    return (result.rows[0] as T) ?? null;
  }

  async update<K extends keyof T> (id: EntityId, data: Partial<T>, returningColumns?: K[], adapter?: DatabaseAdapter): Promise<Pick<T, K> | null> {
    const columnsToReturn = returningColumns ?? (this.getSelectColumns() as K[]);
    const { query, params } = this.builder.buildUpdateQuery(id, data, columnsToReturn.map(String));

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<T>(query, params);

    return (result.rows[0] as T) || null;
  }

  async delete (id: EntityId, adapter?: DatabaseAdapter): Promise<boolean> {
    const { query, params } = this.builder.buildDeleteQuery(id);

    const db = adapter ?? this.service.getConnection();
    const result = await db.query(query, params);

    return result.rowCount > 0;
  }

  async softDelete (id: EntityId, data: Partial<T>, adapter?: DatabaseAdapter): Promise<boolean> {
    const { query, params } = this.builder.buildUpdateQuery(id, data, []);

    const db = adapter ?? this.service.getConnection();
    const result = await db.query(query, params);

    return result.rowCount > 0;
  }

  async count (options: QueryWithPaginationOptions = {}, adapter?: DatabaseAdapter): Promise<number> {
    const { query, params } = this.builder.buildCountQuery(options);

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<{ count: string }>(query, params);

    return parseInt(result.rows[0]?.count as string, 10);
  }

  async sum (column: keyof T & string, options: QueryWithPaginationOptions = {}, adapter?: DatabaseAdapter): Promise<number> {
    const { query, params } = this.builder.buildSumQuery(column, options);

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<{ sum: string }>(query, params);

    return parseInt(result.rows[0]?.sum as string, 10) || 0;
  }
}
