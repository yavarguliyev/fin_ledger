import { ProviderErrorCategory } from '@common/shared-libs';

export const STRIPE_TYPE_CATEGORY: Record<string, ProviderErrorCategory> = {
  StripeCardError: ProviderErrorCategory.DECLINED,
  StripeInvalidRequestError: ProviderErrorCategory.INVALID_REQUEST,
  StripeAuthenticationError: ProviderErrorCategory.AUTHENTICATION,
  StripePermissionError: ProviderErrorCategory.AUTHENTICATION,
  StripeRateLimitError: ProviderErrorCategory.RATE_LIMIT,
  StripeConnectionError: ProviderErrorCategory.NETWORK,
  StripeAPIError: ProviderErrorCategory.PROVIDER_DOWN,
  StripeIdempotencyError: ProviderErrorCategory.INVALID_REQUEST
};
