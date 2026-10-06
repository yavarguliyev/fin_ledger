import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentCapability } from '@common/libs';

import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { PaymentMethodMapper } from '../../helpers/payment-method.mapper';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { ConfirmSetupSessionDto } from '../../dtos/input/confirm-setup-session.dto';
import { PasskeyStepUpService } from '../../../auth';

@Injectable()
export class ConfirmSetupSessionUseCase extends PaymentMethodBaseUseCase<ConfirmSetupSessionDto, PaymentMethodDto> {
  @Inject(PasskeyStepUpService)
  private readonly stepUp!: PasskeyStepUpService;

  async execute ({ userId, provider, sessionId }: ConfirmSetupSessionDto): Promise<PaymentMethodDto> {
    await this.stepUp.assertConfirmed({ userId });

    const paymentProvider = this.providerRegistry.require({ providerName: provider, capability: PaymentCapability.HOSTED_SETUP });
    const methodResult = await paymentProvider.retrieveSessionPaymentMethod({ sessionId });
    const existing = await this.paymentMethodRepository.findByProviderMethodId({ provider, providerMethodId: methodResult.paymentMethodToken });

    if (existing) return existing;

    const entity = PaymentMethodMapper.fromProviderResult({ userId, provider, result: methodResult, isDefault: true });

    const created = await this.paymentMethodRepository.createPaymentMethod(entity);
    if (!created) throw new InternalServerErrorException(`Failed to record ${provider} payment method`);

    return created;
  }
}
