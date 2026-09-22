import { BaseBuilder } from './base-builder';
import { BuildConditions } from '../../interfaces/build-conditions.interface';
import { BuildConditionsInputDto } from '../../dtos/builder/build-conditions-input.dto';

export class WhereBuilder extends BaseBuilder {
  buildWhereConditions ({ options, params, startParamIndex }: BuildConditionsInputDto): BuildConditions {
    const conditions: string[] = [];
    let paramIndex = startParamIndex;

    const objectConditions = this.buildObjectConditions({ options, params, startParamIndex: paramIndex });
    conditions.push(...objectConditions.conditions);
    paramIndex = objectConditions.paramIndex;

    const arrayConditions = this.buildArrayConditions({ options, params, startParamIndex: paramIndex });
    conditions.push(...arrayConditions.conditions);
    paramIndex = arrayConditions.paramIndex;

    const searchConditions = this.buildSearchConditions({ options, params, startParamIndex: paramIndex });
    conditions.push(...searchConditions.conditions);
    paramIndex = searchConditions.paramIndex;

    return {
      conditions,
      paramIndex
    };
  }

  private buildObjectConditions ({ options, params, startParamIndex }: BuildConditionsInputDto): BuildConditions {
    const conditions: string[] = [];
    let paramIndex = startParamIndex;

    if (options.where && !Array.isArray(options.where)) {
      for (const [field, value] of Object.entries(options.where)) {
        if (value === null) {
          conditions.push(`${this.mapColumn({ column: field })} IS NULL`);
        } else {
          conditions.push(`${this.mapColumn({ column: field })} = $${paramIndex++}`);
          params.push(value);
        }
      }
    }

    return { conditions, paramIndex };
  }

  private buildArrayConditions ({ options, params, startParamIndex }: BuildConditionsInputDto): BuildConditions {
    const conditions: string[] = [];
    let paramIndex = startParamIndex;

    if (Array.isArray(options.where)) {
      for (const condition of options.where) {
        const column = this.mapColumn({ column: condition.field });

        if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
          conditions.push(`${column} ${condition.operator}`);
          continue;
        }

        const placeholder = `$${paramIndex++}`;

        if (condition.operator === 'IN') conditions.push(`${column} = ANY(${placeholder})`);
        else if (condition.operator === 'NOT IN') conditions.push(`${column} <> ALL(${placeholder})`);
        else conditions.push(`${column} ${condition.operator} ${placeholder}`);

        params.push(condition.value);
      }
    }

    return { conditions, paramIndex };
  }

  private buildSearchConditions ({ options, params, startParamIndex }: BuildConditionsInputDto): BuildConditions {
    const conditions: string[] = [];
    let paramIndex = startParamIndex;

    if (options.search?.term && options.search.fields.length) {
      const search = options.search.fields.map(field => `LOWER(${this.mapColumn({ column: field })}) LIKE LOWER($${paramIndex})`);

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
