import { ProviderMethodResultDto, CardBrand, PaymentProvider } from '@common/libs';

import { PaymentMethodDto } from '../dtos/payment-method/payment-method.dto';
import { CreatePaymentMethod } from '../dtos/request/create-payment-method.dto';

export const buildPaymentMethodEntity = (
  dto: CreatePaymentMethod,
  providerResult: ProviderMethodResultDto,
  maskedAccount: string,
  detectedBrand: CardBrand,
  providerName: PaymentProvider
): Partial<PaymentMethodDto> => ({
  userId: dto.userId,
  type: dto.type,
  accountHolder: dto.accountHolder,
  maskedAccount,
  bankName: dto.bankName ?? null,
  provider: providerName,
  providerMethodId: providerResult.paymentMethodToken,
  cardBrand: providerResult.brand ?? detectedBrand,
  walletType: dto.walletType ?? providerResult.walletType ?? null,
  expiryMonth: dto.expiryMonth ?? null,
  expiryYear: dto.expiryYear ?? null,
  cvv: dto.cvv ?? null,
  failureReason: providerResult.failureReason ?? null,
  status: providerResult.status,
  isDefault: dto.isDefault ?? false,
  metadata: {
    rawLength: dto.accountNumber.length,
    ...(providerResult.rawResponse ?? {})
  }
});
