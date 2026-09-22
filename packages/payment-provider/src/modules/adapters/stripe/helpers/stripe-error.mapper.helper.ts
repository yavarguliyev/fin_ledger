import { ProviderError, ProviderErrorCategory, StripeLikeError } from '@common/shared-libs';

import { STRIPE_TYPE_CATEGORY } from '../../../constants/stripe/stripe-type-category.constant';
import { ClassifyErrorDto } from '../../../dtos/adapter/classify-error.dto';

export class StripeErrorMapper {
  static toProviderError ({ error }: ClassifyErrorDto): ProviderError {
    if (error instanceof ProviderError) return error;

    const candidate = (error ?? {}) as StripeLikeError;
    const name = candidate.type ?? (error as Error)?.constructor?.name ?? '';
    const category = STRIPE_TYPE_CATEGORY[name] ?? ProviderErrorCategory.UNKNOWN;

    return new ProviderError({
      message: candidate.message ?? 'Payment provider request failed',
      category,
      ...(candidate.code ? { code: candidate.code } : {})
    });
  }
}
