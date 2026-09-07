import { EntityData, EntityId } from '@common/shared-libs';

import { WhereBuilder } from './where-builder';
import { JoinBuilder } from './join-builder';
import { BaseBuilder } from './base-builder';
import { BuildSelectQuery, ColumnMapping, JoinClause, QueryWithPaginationOptions } from '../../interfaces/database.interface';

export class Builder<T> extends BaseBuilder {
  private tableName: string;
  private whereBuilder: WhereBuilder;
  private joinBuilder: JoinBuilder;

  static buildDatabaseSizeQuery = (): string => 'SELECT pg_database_size(current_database()) as size';

  constructor (
    tableName: string,
    protected override columnMappings: ColumnMapping = {}
  ) {
    super(columnMappings);
    this.tableName = tableName;
    this.columnMappings = columnMappings;
    this.whereBuilder = new WhereBuilder(columnMappings);
    this.joinBuilder = new JoinBuilder(columnMappings);
  }

  getTableName = (): string => this.tableName;
  getColumnMapping = (col: string): string => this.columnMappings[col] || col;
  hasColumn = (col: string): boolean => this.columnMappings[col] !== undefined;
  buildDeleteQuery = (id: EntityId): BuildSelectQuery => ({ query: `DELETE FROM ${this.tableName} WHERE id = $1`, params: [id] });

  buildSelectQuery (columns: string[], options: QueryWithPaginationOptions = {}, joins: JoinClause[] = []): BuildSelectQuery {
    const mappedColumns = this.mapColumns(columns);
    let query = `SELECT ${mappedColumns} FROM ${this.tableName}`;

    const joinClause = this.joinBuilder.buildJoinClauses(joins);

    if (joinClause) {
      query += ` ${joinClause}`;
    }

    const params: unknown[] = [];
    let paramIndex = 1;

    const where = this.whereBuilder.buildWhereConditions(options, params, paramIndex);

    if (where.conditions.length) {
      query += ` WHERE ${where.conditions.join(' AND ')}`;
      paramIndex = where.paramIndex;
    }

    if (options.orderBy) {
      query += ` ORDER BY ${this.mapColumn(options.orderBy)} ${options.orderDirection ?? 'ASC'}`;
    }

    if (options.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(options.limit);
    }

    if (options.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(options.offset);
    }

    return { query, params };
  }

  buildInsertQuery<K extends keyof T> (data: EntityData, returningColumns?: K[]): BuildSelectQuery {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const columns = keys.map(key => this.mapColumn(key));
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const returning = (returningColumns ?? (keys as K[])).map(column => `${this.mapColumn(String(column))} AS "${String(column)}"`).join(', ');

    return {
      query: `
        INSERT INTO ${this.tableName} (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING ${returning}
      `,
      params: values
    };
  }

  buildUpdateQuery<K extends string> (id: EntityId, data: EntityData, returningColumns: K[]): BuildSelectQuery {
    const params: unknown[] = [];
    let paramIndex = 1;

    const setClause = Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([column, value]) => {
        params.push(value);
        return `${this.mapColumn(column)} = $${paramIndex++}`;
      })
      .join(', ');

    const updatedAt = this.columnMappings['updatedAt'] ? `, ${this.columnMappings['updatedAt']} = CURRENT_TIMESTAMP` : '';

    params.push(id);

    const returning = returningColumns.length
      ? `RETURNING ${returningColumns.map(column => `${this.mapColumn(column)} AS "${column}"`).join(', ')}`
      : '';

    return {
      query: `
        UPDATE ${this.tableName}
        SET ${setClause}${updatedAt}
        WHERE id = $${paramIndex}
        ${returning}
      `,
      params
    };
  }

  buildCountQuery (options: QueryWithPaginationOptions = {}, joins: JoinClause[] = []): BuildSelectQuery {
    return this.buildAggregateQuery('COUNT(*) AS count', options, joins);
  }

  buildSumQuery (column: string, options: QueryWithPaginationOptions = {}, joins: JoinClause[] = []): BuildSelectQuery {
    const dbCol = this.mapColumn(column);
    return this.buildAggregateQuery(`COALESCE(SUM(${dbCol}), 0) AS sum`, options, joins);
  }

  private mapColumns = (columns: string[]): string => columns.map(column => `${this.mapColumn(column)} AS "${column}"`).join(', ');

  private buildAggregateQuery (aggregateExpr: string, options: QueryWithPaginationOptions = {}, joins: JoinClause[] = []): BuildSelectQuery {
    let query = `SELECT ${aggregateExpr} FROM ${this.tableName}`;

    const joinClause = this.joinBuilder.buildJoinClauses(joins);
    if (joinClause) query += ` ${joinClause}`;

    const params: unknown[] = [];
    const where = this.whereBuilder.buildWhereConditions(options, params, 1);
    if (where.conditions.length) query += ` WHERE ${where.conditions.join(' AND ')}`;

    return { query, params };
  }
}
