import { Injectable } from '@nestjs/common';

import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { PaymentMethodByUserDto } from '../../dtos/input/payment-method-by-user.dto';

@Injectable()
export class GetPaymentMethodUseCase extends PaymentMethodBaseUseCase<PaymentMethodByUserDto, PaymentMethodDto> {
  async execute ({ id, userId }: PaymentMethodByUserDto): Promise<PaymentMethodDto> {
    const method = await this.paymentMethodRepository.findById({ id });
    return this.validateOwnership({ method, userId });
  }
}
