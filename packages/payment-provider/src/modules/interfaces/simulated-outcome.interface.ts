import { ProviderChargeStatus } from '@common/shared-libs';

export interface SimulatedOutcome {
  readonly status: ProviderChargeStatus;
  readonly code?: string;
  readonly message?: string;
}
