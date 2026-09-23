import { CreateEventInput } from './create-event-input.interface';

export interface OutboxClaimedEvent extends CreateEventInput {
  readonly id: string;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly destination: import('@common/shared-libs').OutboxDestination;
}
