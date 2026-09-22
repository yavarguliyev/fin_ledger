import { ProviderChargeStatus, ProviderErrorCategory } from '@common/shared-libs';

import { StripeSimulationHelper } from '../modules/adapters/stripe/helpers/stripe-simulation.helper';
import { STRIPE_SIMULATION } from '../modules/constants/stripe/stripe-simulated-outcomes.constant';
import { CHARGE_INPUT } from '../modules/constants/testing/charge-input.constant';

const simulate = (paymentMethodToken?: string): ReturnType<typeof StripeSimulationHelper.charge> =>
  StripeSimulationHelper.charge({ dto: { ...CHARGE_INPUT, ...(paymentMethodToken && { paymentMethodToken }) }, provider: 'stripe' });

describe('Stripe simulation follows the Stripe test cards', () => {
  it('succeeds for an ordinary card', () => {
    expect(simulate('pm_card_visa').status).toBe(ProviderChargeStatus.SUCCEEDED);
    expect(simulate().status).toBe(ProviderChargeStatus.SUCCEEDED);
  });

  it('asks for 3-D Secure with a client secret', () => {
    const result = simulate('pm_card_threeDSecure2Required');

    expect(result.status).toBe(ProviderChargeStatus.REQUIRES_ACTION);
    expect(result.clientSecret).toBe(`${result.chargeId}${STRIPE_SIMULATION.CLIENT_SECRET_SUFFIX}`);
  });

  it('declines with the decline code', () => {
    expect(simulate('pm_card_chargeDeclinedInsufficientFunds')).toMatchObject({
      status: ProviderChargeStatus.FAILED,
      failure: { code: 'insufficient_funds', category: ProviderErrorCategory.DECLINED, indeterminate: false }
    });
  });

  it('can leave a charge processing', () => {
    expect(simulate('pm_simulated_processing').status).toBe(ProviderChargeStatus.PENDING);
  });
});
