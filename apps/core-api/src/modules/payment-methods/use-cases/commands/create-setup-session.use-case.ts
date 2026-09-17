import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentProviderRegistry, SetupSessionResultDto } from '@common/libs';

import { CreateSetupSessionDto } from '../../dtos/request/setup-session.dto';
import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';

@Injectable()
export class CreateSetupSessionUseCase extends PaymentMethodBaseUseCase<CreateSetupSessionDto, SetupSessionResultDto> {
  constructor (private readonly providerRegistry: PaymentProviderRegistry) {
    super();
  }

  async execute (dto: CreateSetupSessionDto): Promise<SetupSessionResultDto> {
    const {
      req: {
        user: { email }
      },
      provider,
      returnUrl
    } = dto;

    const paymentProvider = this.providerRegistry.get(provider);

    if (!paymentProvider.createSetupSession) throw new BadRequestException(`Payment provider ${provider} does not support hosted setup sessions`);
    return paymentProvider.createSetupSession({ ...(email ? { customerEmail: email } : {}), returnUrl });
  }
}
