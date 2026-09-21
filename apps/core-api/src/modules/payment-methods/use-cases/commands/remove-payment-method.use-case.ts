import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { PaymentMethodByUserDto } from '../../dtos/input/payment-method-by-user.dto';

@Injectable()
export class RemovePaymentMethodUseCase extends PaymentMethodBaseUseCase<PaymentMethodByUserDto, PaymentMethodDto> {
  async execute ({ id, userId }: PaymentMethodByUserDto): Promise<PaymentMethodDto> {
    const existing = await this.paymentMethodRepository.findById({ id });
    this.validateOwnership({ method: existing, userId });

    const updated = await this.paymentMethodRepository.markRemoved({ id });
    if (!updated) throw new InternalServerErrorException('Failed to remove payment method');

    return updated;
  }
}
