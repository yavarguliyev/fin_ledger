import { ProviderMethodDetailsDto } from '@common/libs';

import { BuildPaymentMethodEntityDto, BuildProviderMethodDetailsDto } from '../dtos/payment-method-helper.dto';
import { PaymentMethodDto } from '../dtos/payment-method/payment-method.dto';

export class PaymentMethodHelper {
  public static buildProviderMethodDetails (options: BuildProviderMethodDetailsDto): ProviderMethodDetailsDto {
    const { dto } = options;
    return {
      type: dto.type,
      cardNumber: dto.accountNumber,
      walletToken: dto.walletToken,
      ...(dto.walletType ? { walletType: dto.walletType } : {}),
      ...(dto.expiryMonth ? { expiryMonth: dto.expiryMonth } : {}),
      ...(dto.expiryYear ? { expiryYear: dto.expiryYear } : {}),
      ...(dto.cvv ? { cvv: dto.cvv } : {}),
      holderName: dto.accountHolder
    };
  }

  public static buildPaymentMethodEntity (options: BuildPaymentMethodEntityDto): Partial<PaymentMethodDto> {
    const { dto, providerResult, maskedAccount, detectedBrand, providerName } = options;
    return {
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
    };
  }
}
