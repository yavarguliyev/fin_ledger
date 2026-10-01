import { Injectable } from '@nestjs/common';
import { PaymentCapability, SetupSessionResultDto } from '@common/libs';

import { CreateSetupSessionDto } from '../../dtos/input/create-setup-session.dto';
import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { ProviderCustomerRepository } from '../../repositories/provider-customer.repository';

@Injectable()
export class CreateSetupSessionUseCase extends PaymentMethodBaseUseCase<CreateSetupSessionDto, SetupSessionResultDto> {
  constructor (private readonly providerCustomerRepository: ProviderCustomerRepository) {
    super();
  }

  async execute ({ email, provider, returnUrl, userId }: CreateSetupSessionDto): Promise<SetupSessionResultDto> {
    const paymentProvider = this.providerRegistry.require({ providerName: provider, capability: PaymentCapability.HOSTED_SETUP });
    const known = await this.providerCustomerRepository.findCustomerId({ userId, provider });

    const session = await paymentProvider.createSetupSession({
      returnUrl,
      ...(email && { customerEmail: email }),
      ...(known && { customerId: known })
    });

    if (session.customerId !== known) {
      await this.providerCustomerRepository.remember({ userId, provider, providerCustomerId: session.customerId });
    }

    return session;
  }
}
