import { ProviderError, ProviderErrorCategory, StripeLikeError } from '@common/shared-libs';

import { STRIPE_TYPE_CATEGORY } from '../../../constants/stripe/stripe-type-category.constant';
import { STRIPE_ERROR_DEFAULTS } from '../../../constants/stripe/stripe-error-defaults.constant';
import { ClassifyErrorDto } from '../../../dtos/adapter/classify-error.dto';

export class StripeErrorMapper {
  static toProviderError ({ error }: ClassifyErrorDto): ProviderError {
    if (error instanceof ProviderError) return error;

    const candidate = (error ?? {}) as StripeLikeError;
    const name = candidate.type ?? (error as Error)?.constructor?.name ?? '';
    const category = STRIPE_TYPE_CATEGORY[name] ?? ProviderErrorCategory.UNKNOWN;
    const code = candidate.decline_code ?? candidate.code;

    return new ProviderError({
      message: candidate.message ?? STRIPE_ERROR_DEFAULTS.MESSAGE,
      category,
      ...(code ? { code } : {})
    });
  }
}
