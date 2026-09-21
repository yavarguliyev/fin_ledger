import { JoinClauseTypes } from '@common/shared-libs';

export interface JoinClause {
  readonly table: string;
  readonly left: string;
  readonly right: string;
  readonly type: JoinClauseTypes;
}
