import { ProviderMethodDetailsDto } from '@common/libs';

import { CreatePaymentMethod } from '../dtos/request/create-payment-method.dto';

export const buildProviderMethodDetails = (dto: CreatePaymentMethod): ProviderMethodDetailsDto => ({
  type: dto.type,
  cardNumber: dto.accountNumber,
  walletToken: dto.walletToken,
  ...(dto.walletType ? { walletType: dto.walletType } : {}),
  ...(dto.expiryMonth ? { expiryMonth: dto.expiryMonth } : {}),
  ...(dto.expiryYear ? { expiryYear: dto.expiryYear } : {}),
  ...(dto.cvv ? { cvv: dto.cvv } : {}),
  holderName: dto.accountHolder
});
