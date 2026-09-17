import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentMethodStatus, PaymentProviderRegistry } from '@common/libs';

import { PaymentMethodRepository } from '../../repositories/payment-method.repository';
import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { VerifyPaymentMethodDto } from '../../dtos/request/verify-payment-method.dto';

@Injectable()
export class VerifyPaymentMethodUseCase extends PaymentMethodBaseUseCase<VerifyPaymentMethodDto, PaymentMethodDto> {
  constructor (
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly providerRegistry: PaymentProviderRegistry
  ) {
    super();
  }

  async execute ({ id, userId }: VerifyPaymentMethodDto): Promise<PaymentMethodDto> {
    const existing = await this.paymentMethodRepository.findById(id);
    const method = this.validateOwnership(existing, userId);

    if (method.status === PaymentMethodStatus.VERIFIED) {
      return method;
    }

    if (method.status === PaymentMethodStatus.REMOVED || method.status === PaymentMethodStatus.REJECTED) {
      throw new BadRequestException(`Cannot verify payment method in ${method.status} status`);
    }

    let targetStatus = PaymentMethodStatus.VERIFIED;
    if (method.providerMethodId && method.provider) {
      const provider = this.providerRegistry.get(method.provider);
      const verifyResult = await provider.verifyPaymentMethod(method.providerMethodId);
      targetStatus = verifyResult.status;
    }

    const updated = await this.paymentMethodRepository.updateStatus(id, targetStatus);
    if (!updated) throw new InternalServerErrorException('Failed to verify payment method');

    return updated;
  }
}
