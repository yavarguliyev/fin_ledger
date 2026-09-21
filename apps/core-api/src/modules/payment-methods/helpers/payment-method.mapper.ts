import { CardBrand, PaymentMethodStatus, PaymentMethodType } from '@common/libs';

import { PaymentMethodDto } from '../dtos/payment-method/payment-method.dto';
import { FromProviderResultDto } from '../dtos/helper/from-provider-result.dto';

export class PaymentMethodMapper {
  static fromProviderResult ({ userId, provider, result, isDefault }: FromProviderResultDto): Partial<PaymentMethodDto> {
    return {
      userId,
      provider,
      type: result.methodType ?? PaymentMethodType.CREDIT_CARD,
      accountHolder: result.billingName ?? `${provider.toUpperCase()} Cardholder`,
      providerMethodId: result.paymentMethodToken,
      cardBrand: result.brand ?? CardBrand.UNKNOWN,
      lastFour: result.last4 ?? null,
      expiryMonth: result.expMonth ?? null,
      expiryYear: result.expYear ?? null,
      fingerprint: result.fingerprint ?? null,
      walletType: result.walletType ?? null,
      bankName: null,
      status: PaymentMethodStatus.VERIFIED,
      verifiedAt: new Date(),
      isDefault,
      metadata: null
    };
  }
}
