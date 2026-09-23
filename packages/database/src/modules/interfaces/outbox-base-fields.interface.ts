import { OutboxDestination, OutboxStatus } from '@common/shared-libs';

import { CreateEventInput } from './create-event-input.interface';

export interface OutboxBaseFields extends CreateEventInput {
  readonly id: string;
  readonly aggregateVersion: number;
  readonly attempts: number;
  readonly availableAt: Date;
  readonly createdAt: Date;
  readonly publishedAt: Date | null;
  readonly status: OutboxStatus;
  readonly traceId: string | null;
  readonly destination: OutboxDestination;
}
