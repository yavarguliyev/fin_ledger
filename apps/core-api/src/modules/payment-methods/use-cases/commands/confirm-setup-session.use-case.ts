import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CardBrand, PaymentMethodStatus, PaymentMethodType, PaymentProviderRegistry } from '@common/libs';

import { PaymentMethodRepository } from '../../repositories/payment-method.repository';
import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { ConfirmSetupSessionDto } from '../../dtos/request/setup-session.dto';

@Injectable()
export class ConfirmSetupSessionUseCase extends PaymentMethodBaseUseCase<ConfirmSetupSessionDto, PaymentMethodDto> {
  constructor (
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly providerRegistry: PaymentProviderRegistry
  ) {
    super();
  }

  async execute (dto: ConfirmSetupSessionDto): Promise<PaymentMethodDto> {
    const {
      req: {
        user: { userId }
      },
      provider,
      sessionId
    } = dto;

    const paymentProvider = this.providerRegistry.get(provider);

    if (!paymentProvider.retrieveSessionPaymentMethod) throw new NotFoundException(`Payment provider ${provider} does not support session retrieval`);

    const methodResult = await paymentProvider.retrieveSessionPaymentMethod(sessionId);
    const existing = await this.paymentMethodRepository.findByProviderMethodId(provider, methodResult.paymentMethodToken);

    if (existing) return existing;

    const last4 = methodResult.last4;
    const entity: Partial<PaymentMethodDto> = {
      userId,
      type: PaymentMethodType.CREDIT_CARD,
      accountHolder: `${provider.toUpperCase()} Cardholder`,
      maskedAccount: `•••• ${last4}`,
      bankName: null,
      provider,
      providerMethodId: methodResult.paymentMethodToken,
      cardBrand: methodResult.brand ?? CardBrand.UNKNOWN,
      walletType: methodResult.walletType ?? null,
      status: PaymentMethodStatus.VERIFIED,
      isDefault: true,
      expiryMonth: null,
      expiryYear: null,
      metadata: methodResult.rawResponse ?? null
    };

    const created = await this.paymentMethodRepository.createPaymentMethod(entity);
    if (!created) throw new InternalServerErrorException(`Failed to record ${provider} payment method`);

    return created;
  }
}
