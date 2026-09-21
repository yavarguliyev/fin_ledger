import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentCapability, PaymentMethodStatus } from '@common/libs';

import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { PaymentMethodByUserDto } from '../../dtos/input/payment-method-by-user.dto';

@Injectable()
export class VerifyPaymentMethodUseCase extends PaymentMethodBaseUseCase<PaymentMethodByUserDto, PaymentMethodDto> {
  async execute ({ id, userId }: PaymentMethodByUserDto): Promise<PaymentMethodDto> {
    const existing = await this.paymentMethodRepository.findById({ id });
    const method = this.validateOwnership({ method: existing, userId });

    if (method.status === PaymentMethodStatus.VERIFIED) {
      return method;
    }

    if (method.status === PaymentMethodStatus.REMOVED || method.status === PaymentMethodStatus.REJECTED) {
      throw new BadRequestException(`Cannot verify payment method in ${method.status} status`);
    }

    let targetStatus = PaymentMethodStatus.VERIFIED;
    if (method.providerMethodId && method.provider) {
      const provider = this.providerRegistry.require({ providerName: method.provider, capability: PaymentCapability.METHOD_VAULT });
      const verifyResult = await provider.verifyPaymentMethod({ paymentMethodToken: method.providerMethodId });
      targetStatus = verifyResult.status;
    }

    const updated = await this.paymentMethodRepository.updateStatus({ id, status: targetStatus });
    if (!updated) throw new InternalServerErrorException('Failed to verify payment method');

    return updated;
  }
}
