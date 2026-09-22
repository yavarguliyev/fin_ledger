import { ProviderChargeStatus } from '@common/shared-libs';

export const STRIPE_INTENT_STATUS: Readonly<Record<string, ProviderChargeStatus>> = {
  canceled: ProviderChargeStatus.FAILED,
  processing: ProviderChargeStatus.PENDING,
  requires_action: ProviderChargeStatus.REQUIRES_ACTION,
  requires_capture: ProviderChargeStatus.PENDING,
  requires_confirmation: ProviderChargeStatus.REQUIRES_ACTION,
  requires_payment_method: ProviderChargeStatus.FAILED,
  succeeded: ProviderChargeStatus.SUCCEEDED
};

export const STRIPE_INTENT_DEFAULTS = {
  FAILURE_MESSAGE: 'The payment was not completed'
} as const;
