import { OutboxStatus } from '@common/shared-libs';

export interface OutboxRescheduleResult {
  readonly status: OutboxStatus;
  readonly attempts: number;
}
