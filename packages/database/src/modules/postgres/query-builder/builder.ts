
import { WhereBuilder } from './where-builder';
import { JoinBuilder } from './join-builder';
import { AggregateBuilder } from './aggregate-builder';
import { BaseBuilder } from './base-builder';
import { BuildSelectQuery } from '../../interfaces/build-select-query.interface';
import { BuilderOptionsDto } from '../../dtos/builder/builder-options.dto';
import { ColumnDto } from '../../dtos/builder/column.dto';
import { ColumnsDto } from '../../dtos/builder/columns.dto';
import { SelectQueryDto } from '../../dtos/builder/select-query.dto';
import { InsertQueryDto } from '../../dtos/builder/insert-query.dto';
import { UpdateQueryDto } from '../../dtos/builder/update-query.dto';
import { DeleteQueryDto } from '../../dtos/builder/delete-query.dto';
import { AggregateQueryDto } from '../../dtos/builder/aggregate-query.dto';
import { SumQueryDto } from '../../dtos/builder/sum-query.dto';
import { GroupedAggregateQueryDto } from '../../dtos/builder/grouped-aggregate-query.dto';

export class Builder<T> extends BaseBuilder {
  private tableName: string;
  private whereBuilder: WhereBuilder;
  private joinBuilder: JoinBuilder;
  private aggregateBuilder: AggregateBuilder;

  static buildDatabaseSizeQuery = (): string => 'SELECT pg_database_size(current_database()) as size';

  constructor ({ tableName, columnMappings = {} }: BuilderOptionsDto) {
    super({ columnMappings });
    this.tableName = tableName;
    this.whereBuilder = new WhereBuilder({ columnMappings });
    this.joinBuilder = new JoinBuilder({ columnMappings });
    this.aggregateBuilder = new AggregateBuilder({ tableName, columnMappings });
  }

  getTableName = (): string => this.tableName;
  getColumnMapping = ({ column }: ColumnDto): string => this.columnMappings[column] || column;
  hasColumn = ({ column }: ColumnDto): boolean => this.columnMappings[column] !== undefined;
  buildDeleteQuery = ({ id }: DeleteQueryDto): BuildSelectQuery => ({ query: `DELETE FROM ${this.tableName} WHERE id = $1`, params: [id] });

  buildSelectQuery ({ columns, options = {}, joins = [] }: SelectQueryDto): BuildSelectQuery {
    const mappedColumns = this.mapColumns({ columns });
    let query = `SELECT ${mappedColumns} FROM ${this.tableName}`;

    const joinClause = this.joinBuilder.buildJoinClauses({ joins });

    if (joinClause) {
      query += ` ${joinClause}`;
    }

    const params: unknown[] = [];
    let paramIndex = 1;

    const where = this.whereBuilder.buildWhereConditions({ options, params, startParamIndex: paramIndex });

    if (where.conditions.length) {
      query += ` WHERE ${where.conditions.join(' AND ')}`;
      paramIndex = where.paramIndex;
    }

    if (options.orderBy) {
      query += ` ORDER BY ${this.mapColumn({ column: options.orderBy })} ${options.orderDirection ?? 'ASC'}`;
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

  buildInsertQuery<K extends keyof T> ({ data, returningColumns }: InsertQueryDto<T, K>): BuildSelectQuery {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const columns = keys.map(key => this.mapColumn({ column: key }));
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const returning = (returningColumns ?? (keys as K[])).map(column => `${this.mapColumn({ column: String(column) })} AS "${String(column)}"`).join(', ');

    return {
      query: `
        INSERT INTO ${this.tableName} (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING ${returning}
      `,
      params: values
    };
  }

  buildUpdateQuery ({ id, data, returningColumns }: UpdateQueryDto): BuildSelectQuery {
    const params: unknown[] = [];
    let paramIndex = 1;

    const setClause = Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([column, value]) => {
        params.push(value);
        return `${this.mapColumn({ column: column })} = $${paramIndex++}`;
      })
      .join(', ');

    const updatedAt = this.columnMappings['updatedAt'] ? `, ${this.columnMappings['updatedAt']} = CURRENT_TIMESTAMP` : '';

    params.push(id);

    const returning = returningColumns.length
      ? `RETURNING ${returningColumns.map(column => `${this.mapColumn({ column: column })} AS "${column}"`).join(', ')}`
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

  buildCountQuery (dto: AggregateQueryDto): BuildSelectQuery {
    return this.aggregateBuilder.buildCountQuery(dto);
  }

  buildSumQuery (dto: SumQueryDto): BuildSelectQuery {
    return this.aggregateBuilder.buildSumQuery(dto);
  }

  buildGroupedAggregateQuery (dto: GroupedAggregateQueryDto): BuildSelectQuery {
    return this.aggregateBuilder.buildGroupedAggregateQuery(dto);
  }

  private mapColumns = ({ columns }: ColumnsDto): string => columns.map(column => `${this.mapColumn({ column: column })} AS "${column}"`).join(', ');
}
