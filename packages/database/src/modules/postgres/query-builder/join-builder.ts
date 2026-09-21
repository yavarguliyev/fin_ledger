import { JoinClausesDto } from '../../dtos/builder/join-clauses.dto';
import { JoinClauseRefDto } from '../../dtos/builder/join-clause.dto';
import { BaseBuilder } from './base-builder';

export class JoinBuilder extends BaseBuilder {
  buildJoinClauses ({ joins }: JoinClausesDto): string {
    if (!joins?.length) return '';
    return joins.map(join => this.buildSingleJoin({ join })).join(' ');
  }

  private buildSingleJoin ({ join }: JoinClauseRefDto): string {
    return `${join.type} JOIN ${join.table} ON ${this.mapColumn({ column: join.left })} = ${this.mapColumn({ column: join.right })}`;
  }
}
