import { PaymentProvider, PaymentMethodStatus } from '@common/shared-libs';

import { ProviderMethodResultDto } from '../dtos/provider-method-result.dto';

export const buildNotFoundMethodResult = (paymentMethodToken: string, provider: PaymentProvider): ProviderMethodResultDto => ({
  paymentMethodToken,
  status: PaymentMethodStatus.REJECTED,
  failureReason: 'Payment method not found at provider',
  rawResponse: { provider, verified: false }
});
