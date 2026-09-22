import { ProviderChargeStatus, ProviderError, ProviderErrorCategory } from '@common/shared-libs';

import { OperationResultDto } from '../../../dtos/adapter/operation-result.dto';
import { StripeIntentDto } from '../../../dtos/helper/stripe-intent.dto';
import { STRIPE_INTENT_DEFAULTS, STRIPE_INTENT_STATUS } from '../../../constants/stripe/stripe-intent-status.constant';
import { ProviderResultHelper } from '../../../helpers/provider-result.helper';

export class StripeIntentHelper {
  static toOperationResult ({ intent }: StripeIntentDto): OperationResultDto {
    const status = STRIPE_INTENT_STATUS[intent.status] ?? ProviderChargeStatus.INDETERMINATE;

    if (status === ProviderChargeStatus.FAILED) return { id: intent.id, status, failure: StripeIntentHelper.failureOf({ intent }) };
    if (status === ProviderChargeStatus.REQUIRES_ACTION && intent.client_secret) return { id: intent.id, status, clientSecret: intent.client_secret };

    return { id: intent.id, status };
  }

  private static failureOf ({ intent }: StripeIntentDto): OperationResultDto['failure'] {
    const error = intent.last_payment_error;
    const failure = new ProviderError({
      message: error?.message ?? STRIPE_INTENT_DEFAULTS.FAILURE_MESSAGE,
      category: ProviderErrorCategory.DECLINED,
      code: error?.decline_code ?? error?.code ?? intent.status
    });

    return ProviderResultHelper.describeFailure({ failure });
  }
}
