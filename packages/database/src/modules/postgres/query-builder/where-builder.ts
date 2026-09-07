import { BaseBuilder } from './base-builder';
import { BuildConditions, ColumnMapping, QueryWithPaginationOptions } from '../../interfaces/database.interface';

export class WhereBuilder extends BaseBuilder {
  constructor (protected override columnMappings: ColumnMapping) {
    super(columnMappings);
  }

  buildWhereConditions (options: QueryWithPaginationOptions, params: unknown[], startParamIndex: number): BuildConditions {
    const conditions: string[] = [];
    let paramIndex = startParamIndex;

    const objectConditions = this.buildObjectConditions(options, params, paramIndex);
    conditions.push(...objectConditions.conditions);
    paramIndex = objectConditions.paramIndex;

    const arrayConditions = this.buildArrayConditions(options, params, paramIndex);
    conditions.push(...arrayConditions.conditions);
    paramIndex = arrayConditions.paramIndex;

    const searchConditions = this.buildSearchConditions(options, params, paramIndex);
    conditions.push(...searchConditions.conditions);
    paramIndex = searchConditions.paramIndex;

    return {
      conditions,
      paramIndex
    };
  }

  private buildObjectConditions (options: QueryWithPaginationOptions, params: unknown[], startParamIndex: number): BuildConditions {
    const conditions: string[] = [];
    let paramIndex = startParamIndex;

    if (options.where && !Array.isArray(options.where)) {
      for (const [field, value] of Object.entries(options.where)) {
        if (value === null) {
          conditions.push(`${this.mapColumn(field)} IS NULL`);
        } else {
          conditions.push(`${this.mapColumn(field)} = $${paramIndex++}`);
          params.push(value);
        }
      }
    }

    return { conditions, paramIndex };
  }

  private buildArrayConditions (options: QueryWithPaginationOptions, params: unknown[], startParamIndex: number): BuildConditions {
    const conditions: string[] = [];
    let paramIndex = startParamIndex;

    if (Array.isArray(options.where)) {
      for (const condition of options.where) {
        conditions.push(`${this.mapColumn(condition.field)} ${condition.operator} $${paramIndex++}`);
        params.push(condition.value);
      }
    }

    return { conditions, paramIndex };
  }

  private buildSearchConditions (options: QueryWithPaginationOptions, params: unknown[], startParamIndex: number): BuildConditions {
    const conditions: string[] = [];
    let paramIndex = startParamIndex;

    if (options.search?.term && options.search.fields.length) {
      const search = options.search.fields.map(field => `LOWER(${this.mapColumn(field)}) LIKE LOWER($${paramIndex})`);

      conditions.push(`(${search.join(' OR ')})`);
      params.push(`%${options.search.term}%`);
      paramIndex++;
    }

    return {
      conditions,
      paramIndex
    };
  }
}
