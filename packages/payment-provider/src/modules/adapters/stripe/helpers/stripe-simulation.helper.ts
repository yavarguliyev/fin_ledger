import { ProviderChargeStatus, ProviderError, ProviderErrorCategory } from '@common/shared-libs';

import { ProviderChargeResultDto } from '../../../dtos/operation/provider-charge-result.dto';
import { SimulateChargeDto } from '../../../dtos/helper/simulate-charge.dto';
import { ProviderResultHelper } from '../../../helpers/provider-result.helper';
import { STRIPE_SIMULATED_OUTCOMES, STRIPE_SIMULATED_RETRIEVALS, STRIPE_SIMULATION } from '../../../constants/stripe/stripe-simulated-outcomes.constant';
import { SimulateRetrieveChargeDto } from '../../../dtos/helper/simulate-retrieve-charge.dto';
import { STRIPE_INTENT_DEFAULTS } from '../../../constants/stripe/stripe-intent-status.constant';

export class StripeSimulationHelper {
  static retrieveCharge ({ dto, provider }: SimulateRetrieveChargeDto): ProviderChargeResultDto {
    const prefix = Object.keys(STRIPE_SIMULATED_RETRIEVALS).find(key => dto.chargeId.startsWith(key));
    const status = prefix ? STRIPE_SIMULATED_RETRIEVALS[prefix] : ProviderChargeStatus.PENDING;

    return {
      chargeId: dto.chargeId,
      status: status ?? ProviderChargeStatus.PENDING,
      amount: STRIPE_SIMULATION.UNKNOWN_AMOUNT,
      currency: STRIPE_SIMULATION.UNKNOWN_CURRENCY,
      rawResponse: { provider, simulated: true }
    };
  }

  static charge ({ dto, provider }: SimulateChargeDto): ProviderChargeResultDto {
    const result = ProviderResultHelper.simulatedCharge({ prefix: STRIPE_SIMULATION.CHARGE_PREFIX, amount: dto.amount, currency: dto.currency, provider });
    const outcome = dto.paymentMethodToken ? STRIPE_SIMULATED_OUTCOMES[dto.paymentMethodToken] : undefined;
    if (!outcome) return result;

    if (outcome.status === ProviderChargeStatus.REQUIRES_ACTION) {
      return { ...result, status: outcome.status, clientSecret: `${result.chargeId}${STRIPE_SIMULATION.CLIENT_SECRET_SUFFIX}` };
    }

    if (outcome.status === ProviderChargeStatus.FAILED) {
      const failure = new ProviderError({
        message: outcome.message ?? STRIPE_INTENT_DEFAULTS.FAILURE_MESSAGE,
        category: ProviderErrorCategory.DECLINED,
        ...(outcome.code && { code: outcome.code })
      });

      return { ...result, status: outcome.status, failureReason: failure.message, failure: ProviderResultHelper.describeFailure({ failure }) };
    }

    return { ...result, status: outcome.status };
  }
}
