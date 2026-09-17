import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentMethodStatus } from '@common/libs';

import { PaymentMethodRepository } from '../../repositories/payment-method.repository';
import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { RemovePaymentMethodDto } from '../../dtos/request/remove-payment-method.dto';

@Injectable()
export class RemovePaymentMethodUseCase extends PaymentMethodBaseUseCase<RemovePaymentMethodDto, PaymentMethodDto> {
  constructor (private readonly paymentMethodRepository: PaymentMethodRepository) {
    super();
  }

  async execute ({ id, userId }: RemovePaymentMethodDto): Promise<PaymentMethodDto> {
    const existing = await this.paymentMethodRepository.findById(id);
    this.validateOwnership(existing, userId);

    const updated = await this.paymentMethodRepository.updateStatus(id, PaymentMethodStatus.REMOVED);
    if (!updated) throw new InternalServerErrorException('Failed to remove payment method');

    return updated;
  }
}
