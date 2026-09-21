import { AggregateFunction } from '@common/shared-libs';

export interface AggregateSpec {
  readonly alias: string;
  readonly fn: AggregateFunction;
  readonly column?: string;
  readonly filter?: Record<string, unknown>;
}
