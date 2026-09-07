import { ColumnMapping, JoinClause } from '../../interfaces/database.interface';
import { BaseBuilder } from './base-builder';

export class JoinBuilder extends BaseBuilder {
  constructor (protected override columnMappings: ColumnMapping) {
    super(columnMappings);
  }

  buildJoinClauses (joins: JoinClause[]): string {
    if (!joins?.length) return '';
    return joins.map(join => this.buildSingleJoin(join)).join(' ');
  }

  private buildSingleJoin (join: JoinClause): string {
    return `${join.type} JOIN ${join.table} ON ${this.mapColumn(join.left)} = ${this.mapColumn(join.right)}`;
  }
}
