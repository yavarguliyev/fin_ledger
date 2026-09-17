import { Injectable } from '@nestjs/common';

import { PaymentMethodRepository } from '../../repositories/payment-method.repository';
import { PaymentMethodBaseUseCase } from '../base/payment-method-base.use-case';
import { PaymentMethodDto } from '../../dtos/payment-method/payment-method.dto';
import { GetPaymentMethodDto } from '../../dtos/request/get-payment-method.dto';

@Injectable()
export class GetPaymentMethodUseCase extends PaymentMethodBaseUseCase<GetPaymentMethodDto, PaymentMethodDto> {
  constructor (private readonly paymentMethodRepository: PaymentMethodRepository) {
    super();
  }

  async execute ({ id, userId }: GetPaymentMethodDto): Promise<PaymentMethodDto> {
    const method = await this.paymentMethodRepository.findById(id);
    return this.validateOwnership(method, userId);
  }
}
