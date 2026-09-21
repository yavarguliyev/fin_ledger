import { BaseBuilder } from './base-builder';
import { JoinBuilder } from './join-builder';
import { WhereBuilder } from './where-builder';
import { BuildSelectQuery } from '../../interfaces/build-select-query.interface';
import { BuilderOptionsDto } from '../../dtos/builder/builder-options.dto';
import { AggregateQueryDto } from '../../dtos/builder/aggregate-query.dto';
import { SumQueryDto } from '../../dtos/builder/sum-query.dto';
import { GroupedAggregateQueryDto } from '../../dtos/builder/grouped-aggregate-query.dto';
import { ComposeQueryDto } from '../../dtos/builder/compose-query.dto';
import { AggregateExpressionDto } from '../../dtos/builder/aggregate-expression.dto';

export class AggregateBuilder extends BaseBuilder {
  private readonly whereBuilder: WhereBuilder;
  private readonly joinBuilder: JoinBuilder;

  private readonly tableName: string;

  constructor ({ tableName, columnMappings = {} }: BuilderOptionsDto) {
    super({ columnMappings });
    this.tableName = tableName;
    this.whereBuilder = new WhereBuilder({ columnMappings });
    this.joinBuilder = new JoinBuilder({ columnMappings });
  }

  buildCountQuery (dto: AggregateQueryDto): BuildSelectQuery {
    return this.buildAggregateQuery({ ...dto, aggregateExpr: 'COUNT(*) AS count' });
  }

  buildSumQuery ({ column, ...dto }: SumQueryDto): BuildSelectQuery {
    return this.buildAggregateQuery({ ...dto, aggregateExpr: `COALESCE(SUM(${this.mapColumn({ column })}), 0) AS sum` });
  }

  buildGroupedAggregateQuery ({ groupBy, aggregates, options = {}, joins = [] }: GroupedAggregateQueryDto): BuildSelectQuery {
    const params: unknown[] = [];
    const where = this.whereBuilder.buildWhereConditions({ options, params, startParamIndex: 1 });
    const groupColumn = this.mapColumn({ column: groupBy });
    const selections = [`${groupColumn} AS "${groupBy}"`];
    let paramIndex = where.paramIndex;

    for (const { alias, fn, column, filter } of aggregates) {
      const target = fn === 'COUNT' ? '*' : this.mapColumn({ column: column ?? '' });
      const conditions: string[] = [];

      for (const [field, value] of Object.entries(filter ?? {})) {
        conditions.push(`${this.mapColumn({ column: field })} = $${paramIndex++}`);
        params.push(value);
      }

      const filterClause = conditions.length ? ` FILTER (WHERE ${conditions.join(' AND ')})` : '';
      selections.push(`COALESCE(${fn}(${target})${filterClause}, 0) AS "${alias}"`);
    }

    const trailing = `GROUP BY ${groupColumn} ORDER BY ${groupColumn}`;
    return { query: this.compose({ selection: selections.join(', '), conditions: where.conditions, joins, trailing }), params };
  }

  private compose ({ selection, conditions, joins, trailing = '' }: ComposeQueryDto): string {
    return [
      `SELECT ${selection} FROM ${this.tableName}`,
      this.joinBuilder.buildJoinClauses({ joins }),
      conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
      trailing
    ]
      .filter(Boolean)
      .join(' ');
  }

  private buildAggregateQuery ({ aggregateExpr, options = {}, joins = [] }: AggregateExpressionDto): BuildSelectQuery {
    const params: unknown[] = [];
    const where = this.whereBuilder.buildWhereConditions({ options, params, startParamIndex: 1 });

    return { query: this.compose({ selection: aggregateExpr, conditions: where.conditions, joins }), params };
  }
}
