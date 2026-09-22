import { ProviderChargeStatus } from '@common/shared-libs';

import { SimulatedOutcome } from '../../interfaces/simulated-outcome.interface';

export const STRIPE_SIMULATED_OUTCOMES: Readonly<Record<string, SimulatedOutcome>> = {
  pm_card_threeDSecure2Required: { status: ProviderChargeStatus.REQUIRES_ACTION },
  pm_card_chargeDeclined: { status: ProviderChargeStatus.FAILED, code: 'generic_decline', message: 'Your card was declined.' },
  pm_card_chargeDeclinedInsufficientFunds: { status: ProviderChargeStatus.FAILED, code: 'insufficient_funds', message: 'Your card has insufficient funds.' },
  pm_simulated_processing: { status: ProviderChargeStatus.PENDING }
};

export const STRIPE_SIMULATED_RETRIEVALS: Readonly<Record<string, ProviderChargeStatus>> = {
  pi_simulated_succeeded: ProviderChargeStatus.SUCCEEDED,
  pi_simulated_failed: ProviderChargeStatus.FAILED
};

export const STRIPE_SIMULATION = {
  CHARGE_PREFIX: 'ch',
  PAYOUT_PREFIX: 'po',
  REFUND_PREFIX: 're',
  UNKNOWN_AMOUNT: 0,
  UNKNOWN_CURRENCY: '',
  CLIENT_SECRET_SUFFIX: '_secret_simulated'
} as const;
