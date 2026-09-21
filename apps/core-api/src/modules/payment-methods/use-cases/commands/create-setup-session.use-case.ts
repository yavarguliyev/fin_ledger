import { Injectable } from '@nestjs/common';
import { PaymentCapability, SetupSessionResultDto } from '@common/libs';

import { CreateSetupSessionDto } from '../../dtos/input/create-setup-session.dto';
import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';

@Injectable()
export class CreateSetupSessionUseCase extends PaymentMethodBaseUseCase<CreateSetupSessionDto, SetupSessionResultDto> {
  async execute ({ email, provider, returnUrl }: CreateSetupSessionDto): Promise<SetupSessionResultDto> {
    const paymentProvider = this.providerRegistry.require({ providerName: provider, capability: PaymentCapability.HOSTED_SETUP });
    return paymentProvider.createSetupSession({ ...(email ? { customerEmail: email } : {}), returnUrl });
  }
}
