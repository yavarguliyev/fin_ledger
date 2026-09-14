import { v7 as uuid } from 'uuid';
import { PaymentMethodStatus, PaymentProvider } from '@common/shared-libs';

import { ProviderMethodDetailsDto } from '../dtos/provider-method-details.dto';
import { ProviderMethodResultDto } from '../dtos/provider-method-result.dto';
import { validateCardDetails } from './card-validation.helper';

export const buildProviderMethodResult = (
  details: ProviderMethodDetailsDto,
  provider: PaymentProvider,
  tokenPrefix: string
): ProviderMethodResultDto => {
  const { isValid, failureReason, brand } = validateCardDetails(details);

  const rawNumber = details.cardNumber ? details.cardNumber.replace(/\D/g, '') : '';
  const last4 = rawNumber ? rawNumber.slice(-4) : undefined;
  const token = details.token ?? details.walletToken ?? `${tokenPrefix}_${uuid()}`;

  return {
    paymentMethodToken: token,
    status: isValid ? PaymentMethodStatus.VERIFIED : PaymentMethodStatus.REJECTED,
    ...(brand ? { brand } : {}),
    ...(last4 ? { last4 } : {}),
    ...(details.walletType ? { walletType: details.walletType } : {}),
    ...(failureReason ? { failureReason } : {}),
    rawResponse: { provider, verified: isValid }
  };
};
