import { ProviderChargeStatus } from '@common/shared-libs';

import { SimulatedOutcome } from '../../interfaces/simulated-outcome.interface';

export const STRIPE_SIMULATED_OUTCOMES: Readonly<Record<string, SimulatedOutcome>> = {
  pm_card_threeDSecure2Required: { status: ProviderChargeStatus.REQUIRES_ACTION },
  pm_card_chargeDeclined: { status: ProviderChargeStatus.FAILED, code: 'generic_decline', message: 'Your card was declined.' },
  pm_card_chargeDeclinedInsufficientFunds: { status: ProviderChargeStatus.FAILED, code: 'insufficient_funds', message: 'Your card has insufficient funds.' },
  pm_simulated_processing: { status: ProviderChargeStatus.PENDING }
};

export const STRIPE_SIMULATION = {
  CHARGE_PREFIX: 'ch',
  CLIENT_SECRET_SUFFIX: '_secret_simulated'
} as const;
