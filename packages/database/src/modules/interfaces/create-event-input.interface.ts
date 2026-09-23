import { UnknownRecord, AggregateType } from '@common/shared-libs';

export interface CreateEventInput {
  readonly aggregateId: string;
  readonly payload: UnknownRecord;
  readonly aggregateType: AggregateType;
  readonly eventType: string;
}
